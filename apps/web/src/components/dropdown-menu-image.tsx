import { useRef, useState, type ImgHTMLAttributes } from "react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import type { Level } from "@workspace/shared"
import { LevelImage } from "./level-image"
import { titleCase } from "@/utils/utils"

interface DropdownMenuImageProps {
  imgProps: ImgHTMLAttributes<HTMLImageElement>
  characters: Level["characters"]
}

export function DropdownMenuImage({
  imgProps,
  characters,
}: DropdownMenuImageProps) {
  const [menu, setMenu] = useState<{ open: boolean; x: number; y: number }>({
    open: false,
    x: 0,
    y: 0,
  })
  const [coords, setCoords] = useState({ x: 0, y: 0 })
  const imageRef = useRef<HTMLImageElement | null>(null)

  const anchor = () => ({
    getBoundingClientRect: () => new DOMRect(menu.x, menu.y, 0, 0),
  })

  const handleSetCoords = (e: MouseEvent) => {
    const el = imageRef.current
    if (!el) return

    const rect = el.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const xCoord = Math.floor((x / rect.width) * 10000) / 100
    const yCoord = Math.floor((y / rect.height) * 10000) / 100
    setCoords({ x: xCoord, y: yCoord })
    console.log({ xCoord, yCoord })
  }

  return (
    <DropdownMenu
      open={menu.open}
      onOpenChange={(open, e) => {
        if (e.reason === "trigger-press" && e.event instanceof MouseEvent) {
          setMenu({ open: true, x: e.event.clientX, y: e.event.clientY })
          handleSetCoords(e.event)
          return
        }
        setMenu((prev) => ({ ...prev, open }))
      }}
    >
      <DropdownMenuTrigger
        nativeButton={false}
        render={<LevelImage ref={imageRef} {...imgProps} />}
      />
      <DropdownMenuContent key={`${menu.x}-${menu.y}`} anchor={anchor}>
        <DropdownMenuGroup>
          {characters.map((c) => (
            <DropdownMenuItem key={c.id}>
              <img
                className="size-8 object-cover"
                src={`${import.meta.env.VITE_ASSET_BASE_URL}${c.imagePath}`}
              />
              <span>{titleCase(c.name)}</span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
