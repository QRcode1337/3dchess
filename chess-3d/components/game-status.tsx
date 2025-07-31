"use client"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle2, Clock } from "lucide-react"

interface GameStatusProps {
  status: "active" | "check" | "checkmate" | "stalemate" | "draw"
  isWhiteTurn: boolean
  isThinking?: boolean
}

export default function GameStatus({ status, isWhiteTurn, isThinking = false }: GameStatusProps) {
  let title = ""
  let description = ""
  let icon = null
  let variant: "default" | "destructive" = "default"

  switch (status) {
    case "active":
      if (!isWhiteTurn && isThinking) {
        title = "Computer is thinking..."
        description = "The AI is calculating its next move"
        icon = <Clock className="h-4 w-4" />
      } else {
        title = `${isWhiteTurn ? "Your" : "Computer's"} Turn`
        description = isWhiteTurn ? "Make your move" : "Computer is deciding"
        icon = <Clock className="h-4 w-4" />
      }
      break
    case "check":
      title = `${isWhiteTurn ? "You are" : "Computer is"} in Check!`
      description = isWhiteTurn ? "You must move out of check" : "Computer must move out of check"
      icon = <AlertCircle className="h-4 w-4" />
      variant = "destructive"
      break
    case "checkmate":
      title = "Checkmate!"
      description = `${isWhiteTurn ? "Computer" : "You"} win the game`
      icon = <CheckCircle2 className="h-4 w-4" />
      variant = "destructive"
      break
    case "stalemate":
      title = "Stalemate"
      description = "The game is a draw due to stalemate"
      icon = <AlertCircle className="h-4 w-4" />
      break
    case "draw":
      title = "Draw"
      description = "The game is a draw"
      icon = <AlertCircle className="h-4 w-4" />
      break
  }

  return (
    <Alert variant={variant}>
      <div className="flex items-center gap-2">
        {icon}
        <AlertTitle>{title}</AlertTitle>
      </div>
      <AlertDescription>{description}</AlertDescription>
    </Alert>
  )
}
