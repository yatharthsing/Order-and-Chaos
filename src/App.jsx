import { useState } from "react"

const EMPTY = null
const ROWS = 6
const COLS = 6
const WIN_LENGTH = 5

function checkWin(board) {
  const directions = [[0, 1], [1, 0], [1, 1], [1, -1]]
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (board[r][c] === EMPTY) continue
      const color = board[r][c]
      for (let [dr, dc] of directions) {
        let count = 1
        for (let i = 1; i < WIN_LENGTH; i++) {
          const nr = r + dr * i
          const nc = c + dc * i
          if (nr < 0 || nr >= ROWS || nc < 0 || nc >= COLS) break
          if (board[nr][nc] !== color) break
          count++
        }
        if (count >= WIN_LENGTH) return color
      }
    }
  }
  return null
}

function isBoardFull(board) {
  return board.every(row => row.every(cell => cell !== EMPTY))
}

function createBoard() {
  return Array(ROWS).fill(null).map(() => Array(COLS).fill(EMPTY))
}

export default function App() {
  const [board, setBoard] = useState(createBoard())
  const [currentPlayer, setCurrentPlayer] = useState(1)
  const [selectedPiece, setSelectedPiece] = useState("O")
  const [winner, setWinner] = useState(null)
  const [isDraw, setIsDraw] = useState(false)

  function handleCellClick(r, c) {
    if (board[r][c] !== EMPTY || winner || isDraw) return

    const newBoard = board.map(row => [...row])
    newBoard[r][c] = selectedPiece

    const winPiece = checkWin(newBoard)
    if (winPiece) {
      setBoard(newBoard)
      setWinner({ player: currentPlayer, piece: winPiece })
      return
    }

    if (isBoardFull(newBoard)) {
      setBoard(newBoard)
      setIsDraw(true)
      return
    }

    setBoard(newBoard)
    setCurrentPlayer(currentPlayer === 1 ? 2 : 1)
    setSelectedPiece("O")
  }

  function resetGame() {
    setBoard(createBoard())
    setCurrentPlayer(1)
    setSelectedPiece("O")
    setWinner(null)
    setIsDraw(false)
  }

  function cellStyle(cell) {
    if (cell === "O") return "border-gray-600 bg-gray-800 cursor-not-allowed text-blue-400"
    if (cell === "X") return "border-gray-600 bg-gray-800 cursor-not-allowed text-red-400"
    return "border-gray-500 bg-gray-800 hover:border-yellow-400 hover:bg-gray-700 text-white"
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center gap-5 p-4">
      <h1 className="text-3xl font-bold tracking-wide">Order and Chaos</h1>

      <div className="text-base font-medium text-gray-300 h-6">
        {winner
          ? `Player ${winner.player} wins! — five ${winner.piece}s in a row`
          : isDraw
          ? "Chaos wins — board full with no 5 in a row!"
          : `Player ${currentPlayer}'s turn`}
      </div>

      {!winner && !isDraw && (
        <div className="flex gap-4 items-center bg-gray-800 px-5 py-2 rounded-lg">
          <span className="text-gray-400 text-sm">Place:</span>
          <button
            onClick={() => setSelectedPiece("O")}
            style={{ color: selectedPiece === "O" ? "#60a5fa" : "#9ca3af" }}
            className={`w-10 h-10 rounded-lg border-2 transition-all text-xl font-bold flex items-center justify-center
              ${selectedPiece === "O" ? "border-yellow-400 bg-gray-700" : "border-gray-600 bg-gray-800 hover:border-gray-400"}`}
          >
            O
          </button>
          <button
            onClick={() => setSelectedPiece("X")}
            style={{ color: selectedPiece === "X" ? "#f87171" : "#9ca3af" }}
            className={`w-10 h-10 rounded-lg border-2 transition-all text-xl font-bold flex items-center justify-center
              ${selectedPiece === "X" ? "border-yellow-400 bg-gray-700" : "border-gray-600 bg-gray-800 hover:border-gray-400"}`}
          >
            X
          </button>
        </div>
      )}

      <div
        className="bg-gray-700 p-3 rounded-xl grid gap-2"
        style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)` }}
      >
        {board.map((row, r) =>
          row.map((cell, c) => (
            <button
              key={`${r}-${c}`}
              onClick={() => handleCellClick(r, c)}
              disabled={cell !== EMPTY || !!winner || isDraw}
              className={`w-14 h-14 rounded-lg border-2 transition-all text-2xl font-bold flex items-center justify-center ${cellStyle(cell)}`}
            >
              {cell}
            </button>
          ))
        )}
      </div>

      {(winner || isDraw) && (
        <button
          onClick={resetGame}
          style={{ backgroundColor: "#2563eb" }}
          className="px-6 py-2 hover:opacity-90 font-bold rounded-lg transition-all text-white"
        >
          Play Again
        </button>
      )}

      <div className="text-xs text-gray-500 text-center max-w-sm">
        <p>Order gets 5 in a row (X or O) to win. Chaos fills the board to win.</p>
        <p className="mt-1">Both players can place either X or O each turn.</p>
      </div>
    </div>
  )
}