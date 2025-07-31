"use client"

import { useState, useCallback, useEffect } from "react"
import type { Position, GameState, ValidMoves, Move } from "@/types/chess"
import { initializeChessBoard } from "@/lib/chess-init"
import {
  getValidMoves,
  isKingInCheck,
  makeMove,
  isCheckmate,
  isStalemate,
  minimax,
  findKingPosition,
  getAllValidMoves,
  findCheckingPiece,
} from "@/lib/chess-rules"

export function useChessGame() {
  const [singlePlayerMode, setSinglePlayerMode] = useState(true)
  const [gameState, setGameState] = useState<GameState>(initializeChessBoard())
  const [selectedPiece, setSelectedPiece] = useState<Position | null>(null)
  const [validMoves, setValidMoves] = useState<ValidMoves>({})
  const [isWhiteTurn, setIsWhiteTurn] = useState(true)
  const [moveHistory, setMoveHistory] = useState<Move[]>([])
  const [gameStatus, setGameStatus] = useState<"active" | "check" | "checkmate" | "stalemate" | "draw">("active")
  const [isThinking, setIsThinking] = useState(false)
  const [difficulty, setDifficulty] = useState("medium")
  const [suggestedMove, setSuggestedMove] = useState<{ from: Position; to: Position } | null>(null)
  const [isSuggesting, setIsSuggesting] = useState(false)
  const [checkingPiece, setCheckingPiece] = useState<Position | null>(null)

  // Update valid moves when a piece is selected
  useEffect(() => {
    if (selectedPiece) {
      const moves = getValidMoves(gameState, selectedPiece, moveHistory)
      setValidMoves(moves)
    } else {
      setValidMoves({})
    }
  }, [selectedPiece, gameState, moveHistory])

  // Check game status after each move
  useEffect(() => {
    const kingPos = findKingPosition(gameState, isWhiteTurn ? "white" : "black")
    if (!kingPos) return

    const inCheck = isKingInCheck(gameState, kingPos, isWhiteTurn ? "white" : "black")

    // Update checking piece for visualization
    if (inCheck) {
      const attacker = findCheckingPiece(gameState, kingPos, isWhiteTurn ? "white" : "black")
      setCheckingPiece(attacker)
    } else {
      setCheckingPiece(null)
    }

    if (inCheck) {
      if (isCheckmate(gameState, isWhiteTurn ? "white" : "black", moveHistory)) {
        setGameStatus("checkmate")
      } else {
        setGameStatus("check")
      }
    } else if (isStalemate(gameState, isWhiteTurn ? "white" : "black", moveHistory)) {
      setGameStatus("stalemate")
    } else {
      setGameStatus("active")
    }
  }, [gameState, isWhiteTurn, moveHistory])

  // Move a piece
  const movePiece = useCallback(
    (from: Position, to: Position) => {
      const piece = gameState[from.row][from.col]
      if (!piece) return

      const result = makeMove(gameState, from, to, moveHistory)
      if (!result) return

      const { newState, moveDetails } = result

      setGameState(newState)
      setMoveHistory([...moveHistory, moveDetails])
      setIsWhiteTurn(!isWhiteTurn)

      // Always clear suggested move after making any move
      setSuggestedMove(null)
    },
    [gameState, isWhiteTurn, moveHistory],
  )

  // Undo the last move
  const undoMove = useCallback(() => {
    if (moveHistory.length === 0) return

    // In single player mode, undo both computer and player moves
    const movesToUndo = singlePlayerMode && moveHistory.length > 1 ? 2 : 1
    const newHistory = [...moveHistory]

    let newState = JSON.parse(JSON.stringify(gameState))

    for (let i = 0; i < movesToUndo; i++) {
      const lastMove = newHistory.pop()
      if (!lastMove) break

      // Create a new game state
      newState = JSON.parse(JSON.stringify(i === 0 ? gameState : newState))

      // Move the piece back
      newState[lastMove.from.row][lastMove.from.col] = lastMove.piece

      // If it was a promotion, put a pawn back
      if (lastMove.promotion) {
        newState[lastMove.from.row][lastMove.from.col] = {
          type: "pawn",
          color: lastMove.piece.color,
          hasMoved: true,
        }
      }

      // Restore captured piece if any
      if (lastMove.captured) {
        newState[lastMove.to.row][lastMove.to.col] = lastMove.captured
      } else {
        newState[lastMove.to.row][lastMove.to.col] = null
      }

      // Handle castling
      if (lastMove.isCastle && lastMove.rookMove) {
        const { from: rookFrom, to: rookTo } = lastMove.rookMove
        newState[rookFrom.row][rookFrom.col] = newState[rookTo.row][rookTo.col]
        newState[rookTo.row][rookTo.col] = null
      }

      if (i === movesToUndo - 1) {
        setGameState(newState)
      }
    }

    setMoveHistory(newHistory)
    setIsWhiteTurn(true) // Always set to white's turn after undoing in single player
    setSuggestedMove(null)
  }, [gameState, moveHistory, singlePlayerMode])

  // Reset the game
  const resetGame = useCallback(() => {
    setGameState(initializeChessBoard())
    setSelectedPiece(null)
    setValidMoves({})
    setIsWhiteTurn(true)
    setMoveHistory([])
    setGameStatus("active")
    setSuggestedMove(null)
    setCheckingPiece(null)
  }, [])

  // AI move
  const makeAIMove = useCallback(
    (difficultyLevel?: string) => {
      if (gameStatus === "checkmate" || gameStatus === "stalemate" || gameStatus === "draw") {
        return
      }

      setIsThinking(true)

      // Use provided difficulty or fall back to state
      const aiDifficulty = difficultyLevel || difficulty

      // Use setTimeout to allow the UI to update before the AI calculation
      setTimeout(() => {
        // Set depth based on difficulty
        let depth = 2
        switch (aiDifficulty) {
          case "easy":
            depth = 2
            break
          case "medium":
            depth = 3
            break
          case "hard":
            depth = 4
            break
        }

        // Get all valid moves, sorted by priority
        const allMoves = getAllValidMoves(gameState, "black", moveHistory)

        if (allMoves.length > 0) {
          // Check if king is in check
          const kingPos = findKingPosition(gameState, "black")
          const isInCheck = kingPos && isKingInCheck(gameState, kingPos, "black")

          let bestMove

          if (isInCheck) {
            // If in check, use the highest priority move that resolves check
            // These are already sorted by the getAllValidMoves function
            bestMove = allMoves[0]
          } else {
            // If not in check, use minimax for normal play
            bestMove = minimax(
              gameState,
              depth,
              Number.NEGATIVE_INFINITY,
              Number.POSITIVE_INFINITY,
              true, // true for black's perspective
              moveHistory,
            )
          }

          if (bestMove && bestMove.from && bestMove.to) {
            movePiece(bestMove.from, bestMove.to)
          } else {
            // Fallback: use the first valid move
            movePiece(allMoves[0].from, allMoves[0].to)
          }
        }

        setIsThinking(false)
      }, 100)
    },
    [gameState, gameStatus, moveHistory, movePiece, difficulty],
  )

  // Find the best move for white
  const findBestWhiteMove = useCallback(() => {
    // Get all valid moves for white pieces, sorted by score
    const allMoves = getAllValidMoves(gameState, "white", moveHistory)

    // Return the best move
    return allMoves.length > 0 ? allMoves[0] : null
  }, [gameState, moveHistory])

  // Suggest move for white player
  const suggestMove = useCallback(() => {
    // Only allow suggesting moves during white's turn
    if (!isWhiteTurn || gameStatus !== "active") {
      return
    }

    setIsSuggesting(true)

    // Use setTimeout to allow the UI to update before the calculation
    setTimeout(() => {
      // Find the best move for white
      const bestMove = findBestWhiteMove()

      if (bestMove && bestMove.from && bestMove.to) {
        setSuggestedMove({
          from: bestMove.from,
          to: bestMove.to,
        })
      }

      setIsSuggesting(false)
    }, 100)
  }, [gameState, isWhiteTurn, gameStatus, findBestWhiteMove])

  // Apply suggested move
  const applySuggestedMove = useCallback(() => {
    if (suggestedMove && isWhiteTurn) {
      movePiece(suggestedMove.from, suggestedMove.to)
    }
  }, [suggestedMove, isWhiteTurn, movePiece])

  // Auto-play AI moves in single player mode
  useEffect(() => {
    if (singlePlayerMode && !isWhiteTurn && gameStatus !== "checkmate" && gameStatus !== "stalemate" && !isThinking) {
      // Small delay to make the game feel more natural
      const timer = setTimeout(() => {
        makeAIMove(difficulty)
      }, 500)

      return () => clearTimeout(timer)
    }
  }, [isWhiteTurn, singlePlayerMode, gameStatus, isThinking, makeAIMove, difficulty])

  useEffect(() => {
    // Clear any suggested moves when it's not white's turn
    if (!isWhiteTurn) {
      setSuggestedMove(null)
    }
  }, [isWhiteTurn])

  return {
    gameState,
    selectedPiece,
    setSelectedPiece,
    validMoves,
    movePiece,
    undoMove,
    resetGame,
    makeAIMove,
    gameStatus,
    moveHistory,
    isWhiteTurn,
    isThinking,
    singlePlayerMode,
    setSinglePlayerMode,
    difficulty,
    setDifficulty,
    suggestedMove,
    suggestMove,
    applySuggestedMove,
    isSuggesting,
    checkingPiece,
  }
}

