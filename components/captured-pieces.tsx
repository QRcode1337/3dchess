"use client"

import { useMemo } from "react"
import type { ChessPiece } from "@/types/chess"
import { ChessPiece as ChessPieceIcon } from "./chess-piece-icons"

interface CapturedPiecesProps {
  capturedPieces: ChessPiece[]
}

export default function CapturedPieces({ capturedPieces }: CapturedPiecesProps) {
  // Separate pieces by color and sort by value
  const { whiteCaptured, blackCaptured } = useMemo(() => {
    const whitePieces = capturedPieces.filter((piece) => piece.color === "white")
    const blackPieces = capturedPieces.filter((piece) => piece.color === "black")

    // Sort function by piece value
    const sortByValue = (a: ChessPiece, b: ChessPiece) => {
      const pieceValues: Record<string, number> = {
        pawn: 1,
        knight: 3,
        bishop: 3,
        rook: 5,
        queen: 9,
        king: 0, // Kings shouldn't be captured, but just in case
      }
      return pieceValues[b.type] - pieceValues[a.type]
    }

    return {
      whiteCaptured: whitePieces.sort(sortByValue),
      blackCaptured: blackPieces.sort(sortByValue),
    }
  }, [capturedPieces])

  // Calculate material advantage
  const materialAdvantage = useMemo(() => {
    const pieceValues: Record<string, number> = {
      pawn: 1,
      knight: 3,
      bishop: 3,
      rook: 5,
      queen: 9,
      king: 0,
    }

    const whiteValue = blackCaptured.reduce((sum, piece) => sum + pieceValues[piece.type], 0)
    const blackValue = whiteCaptured.reduce((sum, piece) => sum + pieceValues[piece.type], 0)

    return whiteValue - blackValue
  }, [whiteCaptured, blackCaptured])

  return (
    <div className="border rounded-md">
      <div className="p-2 bg-muted font-medium">Captured Pieces</div>

      <div className="p-3">
        {/* Material advantage indicator */}
        {materialAdvantage !== 0 && (
          <div className="text-center mb-2">
            <span className="font-medium">
              Material:{" "}
              {materialAdvantage > 0 ? (
                <span className="text-green-500">+{materialAdvantage} White</span>
              ) : (
                <span className="text-red-500">{materialAdvantage} White</span>
              )}
            </span>
          </div>
        )}

        {/* Black's captures (pieces captured by white) */}
        <div className="mb-3">
          <div className="text-sm font-medium mb-1">White captured:</div>
          <div className="flex flex-wrap gap-1">
            {blackCaptured.length > 0 ? (
              blackCaptured.map((piece, index) => (
                <div key={index} className="w-6 h-6">
                  <ChessPieceIcon piece={piece} />
                </div>
              ))
            ) : (
              <div className="text-sm text-muted-foreground">None</div>
            )}
          </div>
        </div>

        {/* White's captures (pieces captured by black) */}
        <div>
          <div className="text-sm font-medium mb-1">Black captured:</div>
          <div className="flex flex-wrap gap-1">
            {whiteCaptured.length > 0 ? (
              whiteCaptured.map((piece, index) => (
                <div key={index} className="w-6 h-6">
                  <ChessPieceIcon piece={piece} />
                </div>
              ))
            ) : (
              <div className="text-sm text-muted-foreground">None</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

