import { createFileRoute, redirect } from "@tanstack/react-router"
import { useSuspenseQuery } from "@tanstack/react-query"
import { useState } from "react"
import { z } from "zod"

import CharacterIcons from "@/components/character-icons"
import DropdownMenuImage from "@/components/dropdown-menu-image"
import { levelQueries } from "@/features/levels/queries"
import { startGame } from "@/features/games/api"

export const Route = createFileRoute("/levels/$levelNumber")({
  validateSearch: z.object({
    gameId: z.uuid().catch(""),
  }),
  context: ({ params }) => ({
    levelQueryOptions: levelQueries.detail(Number(params.levelNumber)),
  }),
  beforeLoad: async ({ search, params }) => {
    if (search.gameId) return
    const { gameId } = await startGame({
      levelNumber: Number(params.levelNumber),
    })
    throw redirect({ params, search: { gameId }, replace: true })
  },
  loader: ({ context }) => {
    context.queryClient.query({
      ...context.levelQueryOptions,
      staleTime: "static",
    })
  },
  component: RouteComponent,
})

export interface CharacterFindMarker {
  characterId: number
  x: number
  y: number
}

function RouteComponent() {
  const context = Route.useRouteContext()
  const { data } = useSuspenseQuery(context.levelQueryOptions)

  const [correctFinds, setCorrectFinds] = useState<CharacterFindMarker[]>([])

  return (
    <div className="flex flex-col items-center">
      <CharacterIcons
        characters={data.characters}
        foundCharacters={correctFinds.map(({ characterId }) => characterId)}
      />
      <DropdownMenuImage
        imgProps={{
          src: `${import.meta.env.VITE_ASSET_BASE_URL}${data.imagePath}`,
        }}
        characters={data.characters}
        foundCharacters={correctFinds}
        onCorrectSelection={(selection) => {
          setCorrectFinds((c) => [...c, selection])
        }}
      />
    </div>
  )
}
