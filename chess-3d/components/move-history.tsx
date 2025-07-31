"use client"

import { ScrollArea } from "@/components/ui/scroll-area"
import type { Move } from "@/types/chess"

interface MoveHistoryProps {
  moves: Move[]
}

export default function MoveHistory({ moves }: MoveHistoryProps) {
  // Group moves by pairs (white and black)
  const movesByTurn = []
  for (let i = 0; i < moves.length; i += 2) {
    movesByTurn.push({
      number: Math.floor(i / 2) + 1,
      white: moves[i],
      black: i + 1 < moves.length ? moves[i + 1] : null,
    })
  }

  return (
    <div className="border rounded-md">
      <div className="p-2 bg-muted font-medium">Move History</div>
      <ScrollArea className="h-[200px]">
        <div className="p-2">
          {movesByTurn.length === 0 ? (
            <div className="text-center text-muted-foreground py-4">No moves yet</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th className="text-left">#</th>
                  <th className="text-left">White</th>
                  <th className="text-left">Black</th>
                </tr>
              </thead>
              <tbody>
                {movesByTurn.map((turn) => (
                  <tr key={turn.number}>
                    <td>{turn.number}.</td>
                    <td>{formatMove(turn.white)}</td>
                    <td>{turn.black ? formatMove(turn.black) : ""}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}

// Helper function to format moves in algebraic notation
function formatMove(move: Move | null): string {
  if (!move) return ""

  const { piece, from, to, isCapture, isCheck, isCheckmate, isCastle, promotion } = move

  if (isCastle) {
    return to.col > from.col ? "O-O" : "O-O-O"
  }

  let notation = ""

  // Add piece letter (except for pawns)
  if (piece.type !== "pawn") {
    notation += piece.type.charAt(0).toUpperCase()
  }

  // Add from position if needed for disambiguation
  // (simplified here, would need more logic in a real implementation)

  // Add capture symbol
  if (isCapture) {
    if (piece.type === "pawn") {
      notation += String.fromCharCode(97 + from.col)
    }
    notation += "x"
  }

  // Add destination square
  notation += String.fromCharCode(97 + to.col) + (8 - to.row)

  // Add promotion piece
  if (promotion) {
    notation += "=" + promotion.charAt(0).toUpperCase()
  }

  // Add check or checkmate symbol
  if (isCheckmate) {
    notation += "#"
  } else if (isCheck) {
    notation += "+"
  }

  return notation
}
