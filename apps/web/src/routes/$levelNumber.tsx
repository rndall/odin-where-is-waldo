import { createFileRoute } from "@tanstack/react-router"

import { DropdownMenuImage } from "@/components/dropdown-menu-image"

import levelScene from "@/assets/images/level-scene.webp"

export const Route = createFileRoute("/$levelNumber")({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div>
      <DropdownMenuImage imgProps={{ src: levelScene }} characters={[]} />
    </div>
  )
}
