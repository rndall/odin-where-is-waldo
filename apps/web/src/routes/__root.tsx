import { Outlet, createRootRoute } from "@tanstack/react-router"

import { SiteHeader } from "@/components/site-header"

export const Route = createRootRoute({
  component: RootComponent,
})

function RootComponent() {
  return (
    <div className="container mx-auto">
      <SiteHeader />
      <Outlet />
    </div>
  )
}
