"use client"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import ChessBoard from "./chess-board"
import MoveHistory from "./move-history"
import GameStatus from "./game-status"
import { useChessGame } from "@/hooks/use-chess-game"
import { Lightbulb, Check } from "lucide-react"

export default function ChessGame() {
  const {
    gameState,
    selectedPiece,
    setSelectedPiece,
    validMoves,
    movePiece,
    undoMove,
    resetGame,
    gameStatus,
    moveHistory,
    isWhiteTurn,
    isThinking,
    difficulty,
    setDifficulty,
    suggestedMove,
    suggestMove,
    applySuggestedMove,
    isSuggesting,
    checkingPiece,
  } = useChessGame()

  const handleDifficultyChange = (value: string) => {
    setDifficulty(value)
  }

  return (
    <div className="w-full flex flex-col lg:flex-row">
      <div className="w-full lg:w-3/4 h-[80vh]">
        <ChessBoard
          gameState={gameState}
          selectedPiece={selectedPiece}
          setSelectedPiece={setSelectedPiece}
          validMoves={validMoves}
          movePiece={movePiece}
          isWhiteTurn={isWhiteTurn}
          suggestedMove={isWhiteTurn ? suggestedMove : null}
          singlePlayerMode={true}
          checkingPiece={checkingPiece}
        />
      </div>

      <div className="w-full lg:w-1/4 p-4 flex flex-col gap-4">
        <GameStatus status={gameStatus} isWhiteTurn={isWhiteTurn} isThinking={isThinking} />

        <div className="bg-muted/30 p-3 rounded-md">
          <h3 className="font-medium mb-2">Game Mode: Single Player</h3>
          <p className="text-sm text-muted-foreground mb-2">
            You are playing as white against the computer.
            {isWhiteTurn ? " It's your turn." : " Computer is thinking..."}
          </p>

          <div className="flex flex-col gap-2 mt-3">
            <div className="flex items-center gap-2">
              <span className="text-sm">AI Difficulty:</span>
              <Select value={difficulty} onValueChange={handleDifficultyChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Suggest Move Section - Only shown during white's turn */}
        {isWhiteTurn && gameStatus === "active" && (
          <div className="flex flex-col gap-2 mt-2">
            <Button
              onClick={suggestMove}
              disabled={isSuggesting}
              className="w-full flex items-center justify-center gap-2"
              variant="outline"
            >
              <Lightbulb className="h-4 w-4" />
              {isSuggesting ? "Analyzing..." : "Suggest Move"}
            </Button>

            {suggestedMove && (
              <Button
                onClick={applySuggestedMove}
                className="w-full flex items-center justify-center gap-2"
                variant="secondary"
              >
                <Check className="h-4 w-4" />
                Apply Suggested Move
              </Button>
            )}
          </div>
        )}

        <div className="flex gap-2">
          <Button onClick={undoMove} disabled={moveHistory.length === 0} variant="outline" className="flex-1">
            Undo Move
          </Button>
          <Button onClick={resetGame} variant="outline" className="flex-1">
            Reset Game
          </Button>
        </div>

        <MoveHistory moves={moveHistory} />
      </div>
    </div>
  )
}

