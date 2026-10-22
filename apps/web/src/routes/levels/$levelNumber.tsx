import { createFileRoute } from "@tanstack/react-router"

import { DropdownMenuImage } from "@/components/dropdown-menu-image"

import { levelQueries } from "@/features/levels/queries"
import { useSuspenseQuery } from "@tanstack/react-query"

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

function RouteComponent() {
  const context = Route.useRouteContext()
  const { data } = useSuspenseQuery(context.levelQueryOptions)

  const characters = data.targets.map((target) => target.character)

  return (
    <div>
      <DropdownMenuImage
        imgProps={{
          src: `${import.meta.env.VITE_ASSET_BASE_URL}${data.imagePath}`,
        }}
        characters={characters}
      />
    </div>
  )
}
