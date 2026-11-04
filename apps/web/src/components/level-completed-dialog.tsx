import { Link } from "@tanstack/react-router"
import { type ComponentProps } from "react"

import { Button } from "@workspace/ui/components/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import type { Game } from "@workspace/shared"
import PlayerNameForm from "@/components/player-name-form"
import { formatElapsed } from "@/utils/timer"

interface LevelCompletedDialogProps extends ComponentProps<typeof Dialog> {
  levelNumber: NonNullable<Game["level"]>["number"]
  onPlayAgain: () => void
  onSuccess: () => void
  elapsedMs: Game["elapsedMs"]
  qualifiesForLeaderboard: Game["qualifiesForLeaderboard"]
}

export default function LevelCompletedDialog({
  levelNumber,
  onPlayAgain,
  elapsedMs,
  onSuccess,
  qualifiesForLeaderboard,
  ...props
}: LevelCompletedDialogProps) {
  return (
    <Dialog {...props}>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Level {levelNumber} Completed</DialogTitle>
          {elapsedMs && (
            <DialogDescription>
              Time: {formatElapsed(elapsedMs)}s
            </DialogDescription>
          )}
        </DialogHeader>

        {qualifiesForLeaderboard && <PlayerNameForm onSuccess={onSuccess} />}
        <DialogFooter>
          <Link to="/">
            <Button variant="link">Choose Another Level</Button>
          </Link>
          <Button variant="secondary" onClick={onPlayAgain}>
            Play Again
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
