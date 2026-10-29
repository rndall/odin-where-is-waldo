import { createFileRoute } from "@tanstack/react-router"
import { useSuspenseQuery } from "@tanstack/react-query"

import CharacterIcons from "@/components/character-icons"
import DropdownMenuImage from "@/components/dropdown-menu-image"
import { gameQueries } from "@/features/games/queries"

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

  const characters = data.level?.targets ?? []

  return (
    <div className="flex flex-col items-center">
      <CharacterIcons
        characters={characters}
        foundCharacters={data.foundCharacters.map(
          ({ characterId }) => characterId
        )}
      />
      <DropdownMenuImage
        imgProps={{
          src: `${import.meta.env.VITE_ASSET_BASE_URL}${data.level?.imagePath}`,
        }}
        characters={characters}
        foundCharacters={data.foundCharacters}
      />
    </div>
  )
}
