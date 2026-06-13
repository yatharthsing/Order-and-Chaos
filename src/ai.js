const EMPTY = null
const ROWS = 6
const COLS = 6
const WIN_LENGTH = 5

// All directions to check
const DIRECTIONS = [[0,1],[1,0],[1,1],[1,-1]]

// Count how many pieces of 'piece' are in a line from (r,c) in direction (dr,dc)
// and whether the line is still open (not blocked)
function evaluateLine(board, r, c, dr, dc, piece) {
  let count = 0
  let open = 0

  // count forward
  for (let i = 0; i < WIN_LENGTH; i++) {
    const nr = r + dr * i
    const nc = c + dc * i
    if (nr < 0 || nr >= ROWS || nc < 0 || nc >= COLS) break
    if (board[nr][nc] === piece) count++
    else if (board[nr][nc] === EMPTY) { open++; break }
    else break
  }

  // count backward
  for (let i = 1; i < WIN_LENGTH; i++) {
    const nr = r - dr * i
    const nc = c - dc * i
    if (nr < 0 || nr >= ROWS || nc < 0 || nc >= COLS) break
    if (board[nr][nc] === piece) count++
    else if (board[nr][nc] === EMPTY) { open++; break }
    else break
  }

  return { count, open }
}

// Heuristic: score the board from Order's perspective
// Order wants 5 in a row of any piece
// Chaos wants to prevent that
export function heuristic(board) {
  let score = 0

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      for (let [dr, dc] of DIRECTIONS) {
        for (let piece of ["O", "X"]) {
          const { count, open } = evaluateLine(board, r, c, dr, dc, piece)
          if (count >= 5) return 100000  // Order wins
          if (count === 4 && open > 0) score += 1000
          if (count === 3 && open > 0) score += 100
          if (count === 2 && open > 0) score += 10
        }
      }
    }
  }

  return score
}

function isBoardFull(board) {
  return board.every(row => row.every(cell => cell !== EMPTY))
}

function checkWin(board) {
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (board[r][c] === EMPTY) continue
      const piece = board[r][c]
      for (let [dr, dc] of DIRECTIONS) {
        let count = 1
        for (let i = 1; i < WIN_LENGTH; i++) {
          const nr = r + dr * i
          const nc = c + dc * i
          if (nr < 0 || nr >= ROWS || nc < 0 || nc >= COLS) break
          if (board[nr][nc] !== piece) break
          count++
        }
        if (count >= WIN_LENGTH) return piece
      }
    }
  }
  return null
}

// Minimax with Alpha-Beta Pruning
// isOrderTurn: true = Order (maximizer), false = Chaos (minimizer)
function minimax(board, depth, alpha, beta, isOrderTurn) {
  const win = checkWin(board)
  if (win) return 100000 - (10 - depth) * 1000  // Order wins, sooner is better
  if (isBoardFull(board)) return -100000          // Board full = Chaos wins
  if (depth === 0) return heuristic(board)

  // Only look at cells near existing pieces for efficiency
  const candidates = getCandidateMoves(board)

  if (isOrderTurn) {
    let maxScore = -Infinity
    for (let [r, c] of candidates) {
      for (let piece of ["O", "X"]) {
        board[r][c] = piece
        const score = minimax(board, depth - 1, alpha, beta, false)
        board[r][c] = EMPTY
        maxScore = Math.max(maxScore, score)
        alpha = Math.max(alpha, score)
        if (beta <= alpha) break
      }
      if (beta <= alpha) break
    }
    return maxScore
  } else {
    let minScore = Infinity
    for (let [r, c] of candidates) {
      for (let piece of ["O", "X"]) {
        board[r][c] = piece
        const score = minimax(board, depth - 1, alpha, beta, true)
        board[r][c] = EMPTY
        minScore = Math.min(minScore, score)
        beta = Math.min(beta, score)
        if (beta <= alpha) break
      }
      if (beta <= alpha) break
    }
    return minScore
  }
}

// Only consider cells adjacent to existing pieces (huge speedup)
function getCandidateMoves(board) {
  const candidates = new Set()
  let hasAny = false

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (board[r][c] !== EMPTY) {
        hasAny = true
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            const nr = r + dr
            const nc = c + dc
            if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && board[nr][nc] === EMPTY) {
              candidates.add(`${nr},${nc}`)
            }
          }
        }
      }
    }
  }

  // If board is empty, start in center
  if (!hasAny) return [[2, 2]]

  return Array.from(candidates).map(s => s.split(",").map(Number))
}

// Main function called from App — returns best {r, c, piece}
export function getBestMove(board, isOrderTurn) {
  const candidates = getCandidateMoves(board)
  let bestScore = isOrderTurn ? -Infinity : Infinity
  let bestMove = null
  const depth = 3

  for (let [r, c] of candidates) {
    for (let piece of ["O", "X"]) {
      board[r][c] = piece
      const score = minimax(board, depth, -Infinity, Infinity, !isOrderTurn)
      board[r][c] = EMPTY

      if (isOrderTurn && score > bestScore) {
        bestScore = score
        bestMove = { r, c, piece }
      }
      if (!isOrderTurn && score < bestScore) {
        bestScore = score
        bestMove = { r, c, piece }
      }
    }
  }

  return bestMove
}