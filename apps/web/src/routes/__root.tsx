import { Outlet, createRootRouteWithContext } from "@tanstack/react-router"
import type { QueryClient } from "@tanstack/react-query"

import { Toaster } from "@workspace/ui/components/toast"
import { SiteHeader } from "@/components/site-header"

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()(
  {
    component: RootComponent,
  }
)

function RootComponent() {
  return (
    <div className="container mx-auto min-h-svh px-4">
      <SiteHeader />
      <Outlet />
      <Toaster />
    </div>
  )
}
