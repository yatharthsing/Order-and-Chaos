import { useState, useEffect } from "react"
import { getBestMove } from "./ai"

const EMPTY = null
const ROWS = 6
const COLS = 6
const WIN_LENGTH = 5

function checkWin(board) {
  const directions = [[0, 1], [1, 0], [1, 1], [1, -1]]
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (board[r][c] === EMPTY) continue
      const piece = board[r][c]
      for (let [dr, dc] of directions) {
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

function isBoardFull(board) {
  return board.every(row => row.every(cell => cell !== EMPTY))
}

function createBoard() {
  return Array(ROWS).fill(null).map(() => Array(COLS).fill(EMPTY))
}

export default function App() {
  const [board, setBoard] = useState(createBoard())
  const [selectedPiece, setSelectedPiece] = useState("O")
  const [winner, setWinner] = useState(null)
  const [isDraw, setIsDraw] = useState(false)
  const [isAIThinking, setIsAIThinking] = useState(false)
  // mode: "menu", "human", "ai-order", "ai-chaos"
  const [mode, setMode] = useState("menu")
  // whose turn: "human" or "ai"
  const [turn, setTurn] = useState("human")

  // AI plays whenever it's its turn
  useEffect(() => {
    if (turn !== "ai" || winner || isDraw || mode === "human") return

    setIsAIThinking(true)
    const timeout = setTimeout(() => {
      const boardCopy = board.map(row => [...row])
      const isOrderTurn = mode === "ai-order"
      const move = getBestMove(boardCopy, isOrderTurn)

      if (!move) return

      const newBoard = board.map(row => [...row])
      newBoard[move.r][move.c] = move.piece

      const winPiece = checkWin(newBoard)
      if (winPiece) {
        setBoard(newBoard)
        setWinner({ player: "AI", piece: winPiece })
        setIsAIThinking(false)
        return
      }
      if (isBoardFull(newBoard)) {
        setBoard(newBoard)
        setIsDraw(true)
        setIsAIThinking(false)
        return
      }

      setBoard(newBoard)
      setSelectedPiece("O")
      setTurn("human")
      setIsAIThinking(false)
    }, 100)

    return () => clearTimeout(timeout)
  }, [turn, board, winner, isDraw, mode])

  function handleCellClick(r, c) {
    if (board[r][c] !== EMPTY || winner || isDraw || isAIThinking || turn !== "human") return

    const newBoard = board.map(row => [...row])
    newBoard[r][c] = selectedPiece

    const winPiece = checkWin(newBoard)
    if (winPiece) {
      setBoard(newBoard)
      setWinner({ player: "You", piece: winPiece })
      return
    }
    if (isBoardFull(newBoard)) {
      setBoard(newBoard)
      setIsDraw(true)
      return
    }

    setBoard(newBoard)
    setSelectedPiece("O")

    if (mode === "human") {
      // do nothing, same turn logic but switch player label
    } else {
      setTurn("ai")
    }
  }

  function startGame(selectedMode) {
    setBoard(createBoard())
    setSelectedPiece("O")
    setWinner(null)
    setIsDraw(false)
    setIsAIThinking(false)
    setMode(selectedMode)
    setTurn("human")
  }

  function goToMenu() {
    setMode("menu")
    setBoard(createBoard())
    setWinner(null)
    setIsDraw(false)
  }

  if (mode === "menu") {
    return (
      <div style={{ minHeight: "100vh", background: "#111827", color: "white", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "24px" }}>
        <h1 style={{ fontSize: "2.5rem", fontWeight: "bold" }}>Order and Chaos</h1>
        <p style={{ color: "#9ca3af", textAlign: "center", maxWidth: "360px" }}>
          Order tries to get 5 in a row. Chaos tries to fill the board without letting that happen. Both players can place either X or O.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px", width: "260px" }}>
          <button onClick={() => startGame("human")}
            style={{ padding: "12px", background: "#2563eb", color: "white", fontWeight: "bold", borderRadius: "8px", border: "none", cursor: "pointer", fontSize: "1rem" }}>
            Human vs Human
          </button>
          <button onClick={() => startGame("ai-chaos")}
            style={{ padding: "12px", background: "#7c3aed", color: "white", fontWeight: "bold", borderRadius: "8px", border: "none", cursor: "pointer", fontSize: "1rem" }}>
            Play as Order vs AI Chaos
          </button>
          <button onClick={() => startGame("ai-order")}
            style={{ padding: "12px", background: "#dc2626", color: "white", fontWeight: "bold", borderRadius: "8px", border: "none", cursor: "pointer", fontSize: "1rem" }}>
            Play as Chaos vs AI Order
          </button>
        </div>
      </div>
    )
  }

  const statusText = () => {
    if (winner) return winner.player === "You" ? `You win! — five ${winner.piece}s in a row` : `AI wins! — five ${winner.piece}s in a row`
    if (isDraw) return mode === "ai-order" ? "You win! — board full, no 5 in a row!" : "AI wins! — board full, no 5 in a row!"
    if (isAIThinking) return "AI is thinking..."
    return "Your turn"
  }

  return (
    <div style={{ minHeight: "100vh", background: "#111827", color: "white", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "20px", padding: "16px" }}>
      <h1 style={{ fontSize: "2rem", fontWeight: "bold" }}>Order and Chaos</h1>

      <div style={{ fontSize: "0.8rem", color: "#9ca3af" }}>
        {mode === "human" ? "Human vs Human" : mode === "ai-chaos" ? "You (Order) vs AI (Chaos)" : "You (Chaos) vs AI (Order)"}
      </div>

      <div style={{ fontSize: "1rem", color: "#d1d5db", height: "24px" }}>{statusText()}</div>

      {!winner && !isDraw && !isAIThinking && (
        <div style={{ display: "flex", gap: "12px", alignItems: "center", background: "#1f2937", padding: "8px 20px", borderRadius: "8px" }}>
          <span style={{ color: "#9ca3af", fontSize: "0.875rem" }}>Place:</span>
          <button onClick={() => setSelectedPiece("O")}
            style={{ width: "44px", height: "44px", borderRadius: "8px", border: `2px solid ${selectedPiece === "O" ? "#facc15" : "#4b5563"}`, background: "#1f2937", color: "#60a5fa", fontSize: "1.25rem", fontWeight: "bold", cursor: "pointer" }}>
            O
          </button>
          <button onClick={() => setSelectedPiece("X")}
            style={{ width: "44px", height: "44px", borderRadius: "8px", border: `2px solid ${selectedPiece === "X" ? "#facc15" : "#4b5563"}`, background: "#1f2937", color: "#f87171", fontSize: "1.25rem", fontWeight: "bold", cursor: "pointer" }}>
            X
          </button>
        </div>
      )}

      <div style={{ background: "#374151", padding: "12px", borderRadius: "12px", display: "grid", gridTemplateColumns: `repeat(${COLS}, 1fr)`, gap: "6px" }}>
        {board.map((row, r) =>
          row.map((cell, c) => (
            <button
              key={`${r}-${c}`}
              onClick={() => handleCellClick(r, c)}
              disabled={cell !== EMPTY || !!winner || isDraw || isAIThinking || turn !== "human"}
              style={{
                width: "56px", height: "56px", borderRadius: "8px",
                border: `2px solid ${cell !== EMPTY ? "#374151" : "#4b5563"}`,
                background: "#1f2937",
                color: cell === "O" ? "#60a5fa" : cell === "X" ? "#f87171" : "white",
                fontSize: "1.5rem", fontWeight: "bold",
                cursor: cell !== EMPTY || isAIThinking ? "not-allowed" : "pointer",
                display: "flex", alignItems: "center", justifyContent: "center"
              }}
            >
              {cell}
            </button>
          ))
        )}
      </div>

      <div style={{ display: "flex", gap: "12px" }}>
        {(winner || isDraw) && (
          <button onClick={() => startGame(mode)}
            style={{ padding: "8px 24px", background: "#2563eb", color: "white", fontWeight: "bold", borderRadius: "8px", border: "none", cursor: "pointer" }}>
            Play Again
          </button>
        )}
        <button onClick={goToMenu}
          style={{ padding: "8px 24px", background: "#374151", color: "white", fontWeight: "bold", borderRadius: "8px", border: "none", cursor: "pointer" }}>
          Menu
        </button>
      </div>

      <div style={{ fontSize: "0.75rem", color: "#6b7280", textAlign: "center", maxWidth: "360px" }}>
        <p>Order gets 5 in a row (X or O) to win. Chaos fills the board to win.</p>
        <p style={{ marginTop: "4px" }}>Both players can place either X or O each turn.</p>
      </div>
    </div>
  )
}