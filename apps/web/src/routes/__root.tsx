import { Outlet, createRootRouteWithContext } from "@tanstack/react-router"
import type { QueryClient } from "@tanstack/react-query"

import { SiteHeader } from "@/components/site-header"

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()(
  {
    component: RootComponent,
  }
)

function RootComponent() {
  return (
    <div className="container mx-auto">
      <SiteHeader />
      <Outlet />
    </div>
  )
}
