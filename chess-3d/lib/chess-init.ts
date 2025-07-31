import type { GameState } from "@/types/chess"

export function initializeChessBoard(): GameState {
  const board: GameState = Array(8)
    .fill(null)
    .map(() => Array(8).fill(null))

  // Set up pawns
  for (let col = 0; col < 8; col++) {
    board[1][col] = { type: "pawn", color: "black", hasMoved: false }
    board[6][col] = { type: "pawn", color: "white", hasMoved: false }
  }

  // Set up rooks
  board[0][0] = { type: "rook", color: "black", hasMoved: false }
  board[0][7] = { type: "rook", color: "black", hasMoved: false }
  board[7][0] = { type: "rook", color: "white", hasMoved: false }
  board[7][7] = { type: "rook", color: "white", hasMoved: false }

  // Set up knights
  board[0][1] = { type: "knight", color: "black", hasMoved: false }
  board[0][6] = { type: "knight", color: "black", hasMoved: false }
  board[7][1] = { type: "knight", color: "white", hasMoved: false }
  board[7][6] = { type: "knight", color: "white", hasMoved: false }

  // Set up bishops
  board[0][2] = { type: "bishop", color: "black", hasMoved: false }
  board[0][5] = { type: "bishop", color: "black", hasMoved: false }
  board[7][2] = { type: "bishop", color: "white", hasMoved: false }
  board[7][5] = { type: "bishop", color: "white", hasMoved: false }

  // Set up queens
  board[0][3] = { type: "queen", color: "black", hasMoved: false }
  board[7][3] = { type: "queen", color: "white", hasMoved: false }

  // Set up kings
  board[0][4] = { type: "king", color: "black", hasMoved: false }
  board[7][4] = { type: "king", color: "white", hasMoved: false }

  return board
}
