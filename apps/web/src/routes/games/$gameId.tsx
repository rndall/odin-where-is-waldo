import { createFileRoute } from "@tanstack/react-router"
import { useSuspenseQuery } from "@tanstack/react-query"
import { useState } from "react"

import { Button } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"
import DropdownMenuImage from "@/components/dropdown-menu-image"
import LevelCompletedDialog from "@/components/level-completed-dialog"
import GameHeader from "@/features/games/components/game-header"
import { gameQueries } from "@/features/games/queries"
import { useStartGame } from "@/hooks/useStartGame"

export const Route = createFileRoute("/games/$gameId")({
  context: ({ params }) => ({
    gameQueryOptions: gameQueries.detail(params.gameId),
  }),
  loader: ({ context }) => {
    context.queryClient.query({
      ...context.gameQueryOptions,
      staleTime: "static",
    })
  },
  component: RouteComponent,
})

function RouteComponent() {
  const context = Route.useRouteContext()
  const { data } = useSuspenseQuery(context.gameQueryOptions)

  const [open, setOpen] = useState(!!data.finishedAt && !data.playerName)

  const startGame = useStartGame()

  const characters = data.level?.targets ?? []

  if (!data.level) return

  const handlePlayAgain = () => {
    if (!data.level) return
    startGame(data.level.number)
    setOpen(false)
  }

  return (
    <div className="flex flex-col items-center">
      <GameHeader
        levelNumber={data.level.number}
        startedAt={data.startedAt}
        characters={characters}
        foundCharacters={data.foundCharacters}
        elapsedMs={data.elapsedMs}
      />
      <div className="relative">
        <div className={cn(data.finishedAt && "pointer-events-none blur-sm")}>
          <DropdownMenuImage
            imgProps={{
              src: `${import.meta.env.VITE_ASSET_BASE_URL}${data.level?.imagePath}`,
            }}
            characters={characters}
            foundCharacters={data.foundCharacters}
            onFinish={() => {
              setOpen(true)
            }}
          />
        </div>
        {data.finishedAt && (
          <div className="absolute inset-0 flex items-center justify-center gap-4">
            {!data.playerName && (
              <Button size="lg" onClick={() => setOpen(true)}>
                Save Time
              </Button>
            )}
            <Button
              size="lg"
              onClick={() => {
                if (!data.level) return
                startGame(data.level.number)
              }}
            >
              Play Again
            </Button>
          </div>
        )}
      </div>
      <LevelCompletedDialog
        elapsedMs={data.elapsedMs}
        levelNumber={data.level.number}
        open={open}
        onOpenChange={setOpen}
        onPlayAgain={handlePlayAgain}
        onSuccess={() => setOpen(false)}
      />
    </div>
  )
}
