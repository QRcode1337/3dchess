export type PieceType = "pawn" | "rook" | "knight" | "bishop" | "queen" | "king"
export type PieceColor = "white" | "black"

export interface ChessPiece {
  type: PieceType
  color: PieceColor
  hasMoved: boolean
}

export interface Position {
  row: number
  col: number
}

export type GameState = (ChessPiece | null)[][]

export interface ValidMoveInfo {
  type: "move" | "capture" | "castle" | "en passant" | "attack"
}

export interface ValidMoves {
  [key: string]: ValidMoveInfo
}

export interface Move {
  piece: ChessPiece
  from: Position
  to: Position
  captured: ChessPiece | null
  isCapture: boolean
  isCheck: boolean
  isCheckmate: boolean
  isCastle: boolean
  rookMove: { from: Position; to: Position } | null
  promotion: string | null
}

export interface RookMove {
  from: Position
  to: Position
}
