import type { GameState, Position, ValidMoves, Move } from "@/types/chess"

// Get all valid moves for a piece
export function getValidMoves(gameState: GameState, position: Position, moveHistory: Move[]): ValidMoves {
  const { row, col } = position
  const piece = gameState[row][col]

  if (!piece) return {}

  const validMoves: ValidMoves = {}
  const color = piece.color

  switch (piece.type) {
    case "pawn":
      getPawnMoves(gameState, position, validMoves, moveHistory)
      break
    case "rook":
      getRookMoves(gameState, position, validMoves)
      break
    case "knight":
      getKnightMoves(gameState, position, validMoves)
      break
    case "bishop":
      getBishopMoves(gameState, position, validMoves)
      break
    case "queen":
      getQueenMoves(gameState, position, validMoves)
      break
    case "king":
      getKingMoves(gameState, position, validMoves, moveHistory)
      break
  }

  // Filter out moves that would leave the king in check
  const filteredMoves: ValidMoves = {}

  Object.entries(validMoves).forEach(([key, moveInfo]) => {
    const [toRow, toCol] = key.split(",").map(Number)
    const newState = simulateMove(gameState, position, { row: toRow, col: toCol })

    // Find the king's position
    const kingPos = findKingPosition(newState, color)
    if (kingPos && !isKingInCheck(newState, kingPos, color)) {
      filteredMoves[key] = moveInfo
    }
  })

  return filteredMoves
}

// Check if the king is in check
export function isKingInCheck(gameState: GameState, kingPosition: Position, kingColor: "white" | "black"): boolean {
  const oppositeColor = kingColor === "white" ? "black" : "white"

  // Check if any opponent piece can capture the king
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = gameState[row][col]
      if (piece && piece.color === oppositeColor) {
        const moves = getPieceAttackMoves(gameState, { row, col })
        const kingKey = `${kingPosition.row},${kingPosition.col}`
        if (moves[kingKey]) {
          return true
        }
      }
    }
  }

  return false
}

// Get all squares a piece can attack (without considering check)
function getPieceAttackMoves(gameState: GameState, position: Position): ValidMoves {
  const { row, col } = position
  const piece = gameState[row][col]

  if (!piece) return {}

  const validMoves: ValidMoves = {}

  switch (piece.type) {
    case "pawn":
      getPawnAttackMoves(gameState, position, validMoves)
      break
    case "rook":
      getRookMoves(gameState, position, validMoves)
      break
    case "knight":
      getKnightMoves(gameState, position, validMoves)
      break
    case "bishop":
      getBishopMoves(gameState, position, validMoves)
      break
    case "queen":
      getQueenMoves(gameState, position, validMoves)
      break
    case "king":
      getKingAttackMoves(gameState, position, validMoves)
      break
  }

  return validMoves
}

// Make a move and return the new game state
export function makeMove(
  gameState: GameState,
  from: Position,
  to: Position,
  moveHistory: Move[],
): { newState: GameState; moveDetails: Move } | null {
  const piece = gameState[from.row][from.col]
  if (!piece) return null

  // Create a deep copy of the game state
  const newState: GameState = JSON.parse(JSON.stringify(gameState))

  // Capture information
  const captured = newState[to.row][to.col]
  let promotion = null
  let isCheck = false
  let isCheckmate = false
  let isCastle = false
  let rookMove = null

  // Move the piece
  newState[to.row][to.col] = { ...piece, hasMoved: true }
  newState[from.row][from.col] = null

  // Special moves

  // Pawn promotion
  if (piece.type === "pawn" && (to.row === 0 || to.row === 7)) {
    promotion = "queen" // Auto-promote to queen for simplicity
    newState[to.row][to.col] = {
      type: "queen",
      color: piece.color,
      hasMoved: true,
    }
  }

  // En passant
  if (piece.type === "pawn" && from.col !== to.col && !captured) {
    // This is a diagonal move without a capture, must be en passant
    newState[from.row][to.col] = null // Capture the pawn that moved two squares
  }

  // Castling
  if (piece.type === "king" && Math.abs(from.col - to.col) === 2) {
    isCastle = true
    const isKingSide = to.col > from.col

    // Move the rook
    const rookFromCol = isKingSide ? 7 : 0
    const rookToCol = isKingSide ? 5 : 3

    rookMove = {
      from: { row: from.row, col: rookFromCol },
      to: { row: from.row, col: rookToCol },
    }

    newState[from.row][rookToCol] = newState[from.row][rookFromCol]
    if (newState[from.row][rookToCol]) {
      newState[from.row][rookToCol].hasMoved = true
    }
    newState[from.row][rookFromCol] = null
  }

  // Check if this move puts the opponent in check or checkmate
  const opponentColor = piece.color === "white" ? "black" : "white"
  const kingPos = findKingPosition(newState, opponentColor)

  if (kingPos) {
    isCheck = isKingInCheck(newState, kingPos, opponentColor)

    if (isCheck) {
      // Check if it's checkmate
      isCheckmate = isCheckmatePosition(newState, opponentColor, [
        ...moveHistory,
        {
          piece,
          from,
          to,
          captured,
          isCapture: !!captured,
          isCheck,
          isCheckmate: false, // We'll update this
          isCastle,
          rookMove,
          promotion,
        },
      ])
    }
  }

  // Create move details
  const moveDetails: Move = {
    piece,
    from,
    to,
    captured,
    isCapture: !!captured,
    isCheck,
    isCheckmate,
    isCastle,
    rookMove,
    promotion,
  }

  return { newState, moveDetails }
}

// Check if the position is checkmate
export function isCheckmate(gameState: GameState, color: "white" | "black", moveHistory: Move[]): boolean {
  return isCheckmatePosition(gameState, color, moveHistory)
}

// Helper function to check if a position is checkmate
function isCheckmatePosition(gameState: GameState, color: "white" | "black", moveHistory: Move[]): boolean {
  // If the king is not in check, it's not checkmate
  const kingPos = findKingPosition(gameState, color)
  if (!kingPos || !isKingInCheck(gameState, kingPos, color)) {
    return false
  }

  // Check if any move can get the king out of check
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = gameState[row][col]
      if (piece && piece.color === color) {
        const moves = getValidMoves(gameState, { row, col }, moveHistory)
        if (Object.keys(moves).length > 0) {
          return false // Found at least one legal move
        }
      }
    }
  }

  return true // No legal moves, it's checkmate
}

// Check if the position is stalemate
export function isStalemate(gameState: GameState, color: "white" | "black", moveHistory: Move[]): boolean {
  // If the king is in check, it's not stalemate
  const kingPos = findKingPosition(gameState, color)
  if (!kingPos || isKingInCheck(gameState, kingPos, color)) {
    return false
  }

  // Check if any move is possible
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = gameState[row][col]
      if (piece && piece.color === color) {
        const moves = getValidMoves(gameState, { row, col }, moveHistory)
        if (Object.keys(moves).length > 0) {
          return false // Found at least one legal move
        }
      }
    }
  }

  return true // No legal moves, but not in check, it's stalemate
}

// Simulate a move without actually making it
function simulateMove(gameState: GameState, from: Position, to: Position): GameState {
  const newState: GameState = JSON.parse(JSON.stringify(gameState))
  newState[to.row][to.col] = newState[from.row][from.col]
  newState[from.row][from.col] = null
  return newState
}

// Find a king's position
export function findKingPosition(gameState: GameState, color: "white" | "black"): Position | null {
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = gameState[row][col]
      if (piece && piece.type === "king" && piece.color === color) {
        return { row, col }
      }
    }
  }
  return null
}

// Find the piece that is putting the king in check
export function findCheckingPiece(
  gameState: GameState,
  kingPos: Position,
  kingColor: "white" | "black",
): Position | null {
  const oppositeColor = kingColor === "white" ? "black" : "white"

  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = gameState[row][col]
      if (piece && piece.color === oppositeColor) {
        const moves = getPieceAttackMoves(gameState, { row, col })
        const kingKey = `${kingPos.row},${kingPos.col}`
        if (moves[kingKey]) {
          return { row, col }
        }
      }
    }
  }

  return null
}

// Get pawn moves
function getPawnMoves(gameState: GameState, position: Position, validMoves: ValidMoves, moveHistory: Move[]): void {
  const { row, col } = position
  const piece = gameState[row][col]
  if (!piece || piece.type !== "pawn") return

  const direction = piece.color === "white" ? -1 : 1
  const startRow = piece.color === "white" ? 6 : 1

  // Move forward one square
  const oneForward = { row: row + direction, col }
  if (isInBounds(oneForward) && !gameState[oneForward.row][oneForward.col]) {
    validMoves[`${oneForward.row},${oneForward.col}`] = { type: "move" }

    // Move forward two squares from starting position
    if (row === startRow) {
      const twoForward = { row: row + 2 * direction, col }
      if (!gameState[twoForward.row][twoForward.col]) {
        validMoves[`${twoForward.row},${twoForward.col}`] = { type: "move" }
      }
    }
  }

  // Capture diagonally
  const captureMoves = [
    { row: row + direction, col: col - 1 },
    { row: row + direction, col: col + 1 },
  ]

  captureMoves.forEach((capturePos) => {
    if (isInBounds(capturePos)) {
      const targetPiece = gameState[capturePos.row][capturePos.col]
      if (targetPiece && targetPiece.color !== piece.color) {
        validMoves[`${capturePos.row},${capturePos.col}`] = { type: "capture" }
      }

      // En passant
      if (!targetPiece && col !== capturePos.col) {
        const lastMove = moveHistory[moveHistory.length - 1]
        if (
          lastMove &&
          lastMove.piece.type === "pawn" &&
          lastMove.piece.color !== piece.color &&
          Math.abs(lastMove.from.row - lastMove.to.row) === 2 &&
          lastMove.to.col === capturePos.col &&
          lastMove.to.row === row
        ) {
          validMoves[`${capturePos.row},${capturePos.col}`] = { type: "en passant" }
        }
      }
    }
  })
}

// Get pawn attack moves (for check detection)
function getPawnAttackMoves(gameState: GameState, position: Position, validMoves: ValidMoves): void {
  const { row, col } = position
  const piece = gameState[row][col]
  if (!piece || piece.type !== "pawn") return

  const direction = piece.color === "white" ? -1 : 1

  // Pawns attack diagonally
  const attackMoves = [
    { row: row + direction, col: col - 1 },
    { row: row + direction, col: col + 1 },
  ]

  attackMoves.forEach((attackPos) => {
    if (isInBounds(attackPos)) {
      validMoves[`${attackPos.row},${attackPos.col}`] = { type: "attack" }
    }
  })
}

// Get rook moves
function getRookMoves(gameState: GameState, position: Position, validMoves: ValidMoves): void {
  const { row, col } = position
  const piece = gameState[row][col]
  if (!piece) return

  const directions = [
    { row: -1, col: 0 }, // Up
    { row: 1, col: 0 }, // Down
    { row: 0, col: -1 }, // Left
    { row: 0, col: 1 }, // Right
  ]

  getSlidingMoves(gameState, position, directions, validMoves)
}

// Get bishop moves
function getBishopMoves(gameState: GameState, position: Position, validMoves: ValidMoves): void {
  const { row, col } = position
  const piece = gameState[row][col]
  if (!piece) return

  const directions = [
    { row: -1, col: -1 }, // Up-left
    { row: -1, col: 1 }, // Up-right
    { row: 1, col: -1 }, // Down-left
    { row: 1, col: 1 }, // Down-right
  ]

  getSlidingMoves(gameState, position, directions, validMoves)
}

// Get queen moves
function getQueenMoves(gameState: GameState, position: Position, validMoves: ValidMoves): void {
  getRookMoves(gameState, position, validMoves)
  getBishopMoves(gameState, position, validMoves)
}

// Get knight moves
function getKnightMoves(gameState: GameState, position: Position, validMoves: ValidMoves): void {
  const { row, col } = position
  const piece = gameState[row][col]
  if (!piece) return

  const moves = [
    { row: row - 2, col: col - 1 },
    { row: row - 2, col: col + 1 },
    { row: row - 1, col: col - 2 },
    { row: row - 1, col: col + 2 },
    { row: row + 1, col: col - 2 },
    { row: row + 1, col: col + 2 },
    { row: row + 2, col: col - 1 },
    { row: row + 2, col: col + 1 },
  ]

  moves.forEach((move) => {
    if (isInBounds(move)) {
      const targetPiece = gameState[move.row][move.col]
      if (!targetPiece) {
        validMoves[`${move.row},${move.col}`] = { type: "move" }
      } else if (targetPiece.color !== piece.color) {
        validMoves[`${move.row},${move.col}`] = { type: "capture" }
      }
    }
  })
}

// Get king moves
function getKingMoves(gameState: GameState, position: Position, validMoves: ValidMoves, moveHistory: Move[]): void {
  const { row, col } = position
  const piece = gameState[row][col]
  if (!piece || piece.type !== "king") return

  // Regular king moves
  getKingAttackMoves(gameState, position, validMoves)

  // Castling
  if (!piece.hasMoved) {
    // Kingside castling
    const kingsideRook = gameState[row][7]
    if (kingsideRook && kingsideRook.type === "rook" && kingsideRook.color === piece.color && !kingsideRook.hasMoved) {
      // Check if squares between king and rook are empty
      if (!gameState[row][5] && !gameState[row][6]) {
        // Check if king is not in check and doesn't pass through check
        if (
          !isKingInCheck(gameState, position, piece.color) &&
          !isKingInCheck(simulateMove(gameState, position, { row, col: 5 }), { row, col: 5 }, piece.color)
        ) {
          validMoves[`${row},${col + 2}`] = { type: "castle" }
        }
      }
    }

    // Queenside castling
    const queensideRook = gameState[row][0]
    if (
      queensideRook &&
      queensideRook.type === "rook" &&
      queensideRook.color === piece.color &&
      !queensideRook.hasMoved
    ) {
      // Check if squares between king and rook are empty
      if (!gameState[row][1] && !gameState[row][2] && !gameState[row][3]) {
        // Check if king is not in check and doesn't pass through check
        if (
          !isKingInCheck(gameState, position, piece.color) &&
          !isKingInCheck(simulateMove(gameState, position, { row, col: 3 }), { row, col: 3 }, piece.color)
        ) {
          validMoves[`${row},${col - 2}`] = { type: "castle" }
        }
      }
    }
  }
}

// Get king attack moves (for check detection)
function getKingAttackMoves(gameState: GameState, position: Position, validMoves: ValidMoves): void {
  const { row, col } = position
  const piece = gameState[row][col]
  if (!piece) return

  const moves = [
    { row: row - 1, col: col - 1 },
    { row: row - 1, col: col },
    { row: row - 1, col: col + 1 },
    { row: row, col: col - 1 },
    { row: row, col: col + 1 },
    { row: row + 1, col: col - 1 },
    { row: row + 1, col: col },
    { row: row + 1, col: col + 1 },
  ]

  moves.forEach((move) => {
    if (isInBounds(move)) {
      const targetPiece = gameState[move.row][move.col]
      if (!targetPiece) {
        validMoves[`${move.row},${move.col}`] = { type: "move" }
      } else if (targetPiece.color !== piece.color) {
        validMoves[`${move.row},${move.col}`] = { type: "capture" }
      }
    }
  })
}

// Get sliding moves (for rook, bishop, queen)
function getSlidingMoves(
  gameState: GameState,
  position: Position,
  directions: { row: number; col: number }[],
  validMoves: ValidMoves,
): void {
  const { row, col } = position
  const piece = gameState[row][col]
  if (!piece) return

  directions.forEach((dir) => {
    let currentRow = row + dir.row
    let currentCol = col + dir.col

    while (isInBounds({ row: currentRow, col: currentCol })) {
      const targetPiece = gameState[currentRow][currentCol]

      if (!targetPiece) {
        validMoves[`${currentRow},${currentCol}`] = { type: "move" }
      } else {
        if (targetPiece.color !== piece.color) {
          validMoves[`${currentRow},${currentCol}`] = { type: "capture" }
        }
        break // Stop in this direction after encountering a piece
      }

      currentRow += dir.row
      currentCol += dir.col
    }
  })
}

// Check if a position is within the board bounds
function isInBounds(position: Position): boolean {
  return position.row >= 0 && position.row < 8 && position.col >= 0 && position.col < 8
}

// AI: Evaluate the board position
export function evaluateBoard(gameState: GameState, color: "white" | "black"): number {
  let score = 0

  // Piece values
  const pieceValues = {
    pawn: 100,
    knight: 320,
    bishop: 330,
    rook: 500,
    queen: 900,
    king: 20000,
  }

  // Position bonuses (simplified)
  const pawnPositionBonus = [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [50, 50, 50, 50, 50, 50, 50, 50],
    [10, 10, 20, 30, 30, 20, 10, 10],
    [5, 5, 10, 25, 25, 10, 5, 5],
    [0, 0, 0, 20, 20, 0, 0, 0],
    [5, -5, -10, 0, 0, -10, -5, 5],
    [5, 10, 10, -20, -20, 10, 10, 5],
    [0, 0, 0, 0, 0, 0, 0, 0],
  ]

  const knightPositionBonus = [
    [-50, -40, -30, -30, -30, -30, -40, -50],
    [-40, -20, 0, 0, 0, 0, -20, -40],
    [-30, 0, 10, 15, 15, 10, 0, -30],
    [-30, 5, 15, 20, 20, 15, 5, -30],
    [-30, 0, 15, 20, 20, 15, 0, -30],
    [-30, 5, 10, 15, 15, 10, 5, -30],
    [-40, -20, 0, 5, 5, 0, -20, -40],
    [-50, -40, -30, -30, -30, -30, -40, -50],
  ]

  // Evaluate each piece
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = gameState[row][col]
      if (!piece) continue

      let value = pieceValues[piece.type]

      // Add position bonus
      if (piece.type === "pawn") {
        value += piece.color === "white" ? pawnPositionBonus[row][col] : pawnPositionBonus[7 - row][col]
      } else if (piece.type === "knight") {
        value += knightPositionBonus[row][col]
      }

      // Add or subtract value based on piece color
      if (piece.color === color) {
        score += value
      } else {
        score -= value
      }
    }
  }

  // Check if king is in check and penalize
  const kingPos = findKingPosition(gameState, color)
  if (kingPos && isKingInCheck(gameState, kingPos, color)) {
    score -= 150 // Penalty for being in check
  }

  // Bonus for opponent king in check
  const opponentColor = color === "white" ? "black" : "white"
  const opponentKingPos = findKingPosition(gameState, opponentColor)
  if (opponentKingPos && isKingInCheck(gameState, opponentKingPos, opponentColor)) {
    score += 150 // Bonus for putting opponent in check
  }

  return score
}

// Get all valid moves for a specific color
export function getAllValidMoves(
  gameState: GameState,
  color: "white" | "black",
  moveHistory: Move[],
): {
  from: Position
  to: Position
  score: number
  resolveCheck: boolean
  captureAttacker: boolean
  blockCheck: boolean
}[] {
  const allMoves = []

  // Find if king is in check and the attacking piece
  const kingPos = findKingPosition(gameState, color)
  const isInCheck = kingPos && isKingInCheck(gameState, kingPos, color)
  const checkingPiecePos = isInCheck ? findCheckingPiece(gameState, kingPos, color) : null

  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = gameState[row][col]
      if (piece && piece.color === color) {
        const from = { row, col }
        const moves = getValidMoves(gameState, from, moveHistory)

        for (const [key, moveInfo] of Object.entries(moves)) {
          const [toRow, toCol] = key.split(",").map(Number)
          const to = { row: toRow, col: toCol }

          // Simulate the move
          const moveResult = makeMove(gameState, from, to, moveHistory)
          if (moveResult) {
            const { newState } = moveResult

            // Evaluate the resulting position
            const score = evaluateBoard(newState, color)

            // Check if this move resolves a check
            const kingPosAfter = findKingPosition(newState, color)
            const isStillInCheck = kingPosAfter && isKingInCheck(newState, kingPosAfter, color)
            const resolveCheck = isInCheck && !isStillInCheck

            // Check if this move captures the attacking piece
            const captureAttacker =
              checkingPiecePos && to.row === checkingPiecePos.row && to.col === checkingPiecePos.col

            // Check if this move blocks the check (only for sliding pieces)
            let blockCheck = false
            if (isInCheck && checkingPiecePos && kingPos) {
              const checkingPiece = gameState[checkingPiecePos.row][checkingPiecePos.col]
              if (checkingPiece && ["queen", "rook", "bishop"].includes(checkingPiece.type)) {
                // Check if the move is between the king and the checking piece
                blockCheck = isMoveBetween(to, kingPos, checkingPiecePos)
              }
            }

            allMoves.push({
              from,
              to,
              score,
              resolveCheck,
              captureAttacker,
              blockCheck,
            })
          }
        }
      }
    }
  }

  // Sort moves by priority:
  // 1. Moves that resolve check
  // 2. Moves that capture the attacking piece
  // 3. Moves that block the check
  // 4. All other moves by score
  allMoves.sort((a, b) => {
    // If in check, prioritize moves that resolve check
    if (isInCheck) {
      if (a.resolveCheck && !b.resolveCheck) return -1
      if (!a.resolveCheck && b.resolveCheck) return 1

      // If both resolve check, prioritize capturing the attacker
      if (a.resolveCheck && b.resolveCheck) {
        if (a.captureAttacker && !b.captureAttacker) return -1
        if (!a.captureAttacker && b.captureAttacker) return 1

        // If neither captures, prioritize king moves (safer)
        const pieceA = gameState[a.from.row][a.from.col]
        const pieceB = gameState[b.from.row][b.from.col]
        if (pieceA?.type === "king" && pieceB?.type !== "king") return -1
        if (pieceA?.type !== "king" && pieceB?.type === "king") return 1

        // Then prioritize blocking moves
        if (a.blockCheck && !b.blockCheck) return -1
        if (!a.blockCheck && b.blockCheck) return 1
      }
    }

    // Otherwise sort by score
    return b.score - a.score
  })

  return allMoves
}

// Check if a position is between two other positions (for blocking checks)
function isMoveBetween(pos: Position, kingPos: Position, attackerPos: Position): boolean {
  // For horizontal lines
  if (kingPos.row === attackerPos.row && pos.row === kingPos.row) {
    const minCol = Math.min(kingPos.col, attackerPos.col)
    const maxCol = Math.max(kingPos.col, attackerPos.col)
    return pos.col > minCol && pos.col < maxCol
  }

  // For vertical lines
  if (kingPos.col === attackerPos.col && pos.col === kingPos.col) {
    const minRow = Math.min(kingPos.row, attackerPos.row)
    const maxRow = Math.max(kingPos.row, attackerPos.row)
    return pos.row > minRow && pos.row < maxRow
  }

  // For diagonal lines
  const rowDiff = attackerPos.row - kingPos.row
  const colDiff = attackerPos.col - kingPos.col

  // Check if it's a diagonal
  if (Math.abs(rowDiff) === Math.abs(colDiff)) {
    const rowDir = rowDiff > 0 ? 1 : -1
    const colDir = colDiff > 0 ? 1 : -1

    // Check all positions along the diagonal
    let r = kingPos.row + rowDir
    let c = kingPos.col + colDir

    while (r !== attackerPos.row && c !== attackerPos.col) {
      if (r === pos.row && c === pos.col) {
        return true
      }
      r += rowDir
      c += colDir
    }
  }

  return false
}

// AI: Minimax algorithm with alpha-beta pruning
export function minimax(
  gameState: GameState,
  depth: number,
  alpha: number,
  beta: number,
  isMaximizing: boolean,
  moveHistory: Move[],
): { score: number; from?: Position; to?: Position } {
  const color = isMaximizing ? "black" : "white"

  // Base case: reached maximum depth or game over
  if (depth === 0) {
    return { score: evaluateBoard(gameState, "black") }
  }

  // Check for checkmate or stalemate
  if (isCheckmate(gameState, color, moveHistory)) {
    return { score: isMaximizing ? -10000 : 10000 }
  }

  if (isStalemate(gameState, color, moveHistory)) {
    return { score: 0 }
  }

  // Get all valid moves, sorted by preliminary evaluation
  const allMoves = getAllValidMoves(gameState, color, moveHistory)

  // If no valid moves, return appropriate score
  if (allMoves.length === 0) {
    // This should not happen as we already checked for checkmate and stalemate
    return { score: isMaximizing ? -10000 : 10000 }
  }

  let bestMove: { score: number; from?: Position; to?: Position }

  if (isMaximizing) {
    bestMove = { score: Number.NEGATIVE_INFINITY }

    // Try all possible moves
    for (const move of allMoves) {
      const { from, to } = move

      const moveResult = makeMove(gameState, from, to, moveHistory)
      if (!moveResult) continue

      const { newState, moveDetails } = moveResult

      const result = minimax(newState, depth - 1, alpha, beta, false, [...moveHistory, moveDetails])

      if (result.score > bestMove.score) {
        bestMove = { score: result.score, from, to }
      }

      alpha = Math.max(alpha, bestMove.score)
      if (beta <= alpha) break // Alpha-beta pruning
    }
  } else {
    bestMove = { score: Number.POSITIVE_INFINITY }

    // Try all possible moves
    for (const move of allMoves) {
      const { from, to } = move

      const moveResult = makeMove(gameState, from, to, moveHistory)
      if (!moveResult) continue

      const { newState, moveDetails } = moveResult

      const result = minimax(newState, depth - 1, alpha, beta, true, [...moveHistory, moveDetails])

      if (result.score < bestMove.score) {
        bestMove = { score: result.score, from, to }
      }

      beta = Math.min(beta, bestMove.score)
      if (beta <= alpha) break // Alpha-beta pruning
    }
  }

  return bestMove
}
