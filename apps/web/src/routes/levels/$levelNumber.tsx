import { createFileRoute } from "@tanstack/react-router"
import { useSuspenseQuery } from "@tanstack/react-query"

import DropdownMenuImage from "@/components/dropdown-menu-image"
import { levelQueries } from "@/features/levels/queries"
import CharacterIcons from "@/components/character-icons"
import { useState } from "react"

export const Route = createFileRoute("/levels/$levelNumber")({
  context: ({ params }) => ({
    levelQueryOptions: levelQueries.detail(Number(params.levelNumber)),
  }),
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
