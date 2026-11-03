import { createFileRoute } from "@tanstack/react-router"

import LevelGrid from "@/features/levels/components/level-grid"
import { levelQueries } from "@/features/levels/queries"
import { useSuspenseQuery } from "@tanstack/react-query"

export const Route = createFileRoute("/")({
  context: () => ({
    levelsQueryOptions: levelQueries.list(),
  }),
  loader: ({ context }) => {
    context.queryClient.query({
      ...context.levelsQueryOptions,
      staleTime: "static",
    })
  },
  component: RouteComponent,
})

function RouteComponent() {
  const context = Route.useRouteContext()
  const { data: levels } = useSuspenseQuery(context.levelsQueryOptions)

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 p-4">
      <div>
        <h1 className="text-3xl font-bold">Choose your next level</h1>
        <p>Pick a scene and find every hidden character.</p>
      </div>
      <LevelGrid levels={levels} />
    </div>
  )
}
