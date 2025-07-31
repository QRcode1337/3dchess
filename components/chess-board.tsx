"use client"

import { useRef, useState } from "react"
import { Canvas } from "@react-three/fiber"
import { OrbitControls, PerspectiveCamera } from "@react-three/drei"
import type { Position, GameState, ValidMoves } from "@/types/chess"
import ChessPieceModel from "./chess-piece-model"
import ChessSquare from "./chess-square"
import SuggestedMoveIndicator from "./suggested-move-indicator"
import CosmicBackground from "./cosmic-background"
import CheckIndicator from "./check-indicator"
import RimLight from "./rim-light"

interface ChessBoardProps {
  gameState: GameState
  selectedPiece: Position | null
  setSelectedPiece: (position: Position | null) => void
  validMoves: ValidMoves
  movePiece: (from: Position, to: Position) => void
  isWhiteTurn: boolean
  singlePlayerMode?: boolean
  suggestedMove: { from: Position; to: Position } | null
  checkingPiece: Position | null
}

export default function ChessBoard({
  gameState,
  selectedPiece,
  setSelectedPiece,
  validMoves,
  movePiece,
  isWhiteTurn,
  singlePlayerMode = true,
  suggestedMove,
  checkingPiece,
}: ChessBoardProps) {
  const controlsRef = useRef<any>(null)
  // Set a fixed camera position
  const [cameraPosition] = useState([0, 10, 10])

  return (
    <div className="w-full h-full">
      <Canvas shadows>
        {/* Cosmic background */}
        <CosmicBackground />

        {/* Add rim lighting for better visibility of black pieces */}
        <RimLight />

        <PerspectiveCamera makeDefault position={cameraPosition} fov={45} />
        <OrbitControls
          ref={controlsRef}
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minPolarAngle={0.1}
          maxPolarAngle={Math.PI / 2 - 0.1}
          minDistance={5}
          maxDistance={20}
        />

        {/* Chessboard */}
        <group position={[-3.5, 0, -3.5]}>
          {/* Board squares */}
          {Array.from({ length: 8 }, (_, row) =>
            Array.from({ length: 8 }, (_, col) => {
              const position: Position = { row, col }
              const isSelected = selectedPiece?.row === row && selectedPiece?.col === col
              const isValidMove = validMoves[`${row},${col}`]
              const isSuggestedFrom = suggestedMove?.from.row === row && suggestedMove?.from.col === col
              const isSuggestedTo = suggestedMove?.to.row === row && suggestedMove?.to.col === col
              const isCheckingPiece = checkingPiece?.row === row && checkingPiece?.col === col

              return (
                <ChessSquare
                  key={`${row}-${col}`}
                  position={position}
                  isLight={(row + col) % 2 === 0}
                  isSelected={isSelected}
                  isValidMove={!!isValidMove}
                  isSuggestedFrom={isSuggestedFrom}
                  isSuggestedTo={isSuggestedTo}
                  isCheckingPiece={isCheckingPiece}
                  onClick={() => {
                    const piece = gameState[row][col]

                    // If a valid move square is clicked, move the selected piece
                    if (selectedPiece && isValidMove) {
                      movePiece(selectedPiece, position)
                      setSelectedPiece(null)
                      return
                    }

                    // In single player mode, only allow selecting white pieces when it's white's turn
                    if (
                      piece &&
                      ((piece.color === "white" && isWhiteTurn) ||
                        (piece.color === "black" && !isWhiteTurn && !singlePlayerMode))
                    ) {
                      setSelectedPiece(position)
                    } else if (!isValidMove) {
                      setSelectedPiece(null)
                    }
                  }}
                />
              )
            }),
          )}

          {/* Suggested move indicators - only shown during white's turn */}
          {isWhiteTurn && suggestedMove && (
            <>
              <SuggestedMoveIndicator position={suggestedMove.from} type="from" />
              <SuggestedMoveIndicator position={suggestedMove.to} type="to" />
            </>
          )}

          {/* Check indicator for the checking piece */}
          {checkingPiece && <CheckIndicator position={checkingPiece} />}

          {/* Chess pieces */}
          {gameState.flatMap((row, rowIndex) =>
            row
              .map((piece, colIndex) => {
                if (!piece) return null

                return (
                  <ChessPieceModel
                    key={`piece-${rowIndex}-${colIndex}`}
                    piece={piece}
                    position={{ row: rowIndex, col: colIndex }}
                  />
                )
              })
              .filter(Boolean),
          )}
        </group>
      </Canvas>
    </div>
  )
}

