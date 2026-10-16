import { useState, type ImgHTMLAttributes } from "react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import { LevelImage } from "./level-image"

interface DropdownMenuImageProps {
  imgProps: ImgHTMLAttributes<HTMLImageElement>
  characters: unknown[]
}

export function DropdownMenuImage({ imgProps }: DropdownMenuImageProps) {
  const [menu, setMenu] = useState<{ open: boolean; x: number; y: number }>({
    open: false,
    x: 0,
    y: 0,
  })

  const anchor = () => ({
    getBoundingClientRect: () => new DOMRect(menu.x, menu.y, 0, 0),
  })

  return (
    <DropdownMenu
      open={menu.open}
      onOpenChange={(open, e) => {
        if (e.reason === "trigger-press" && e.event instanceof MouseEvent) {
          setMenu({ open: true, x: e.event.clientX, y: e.event.clientY })
          return
        }
        setMenu((prev) => ({ ...prev, open }))
      }}
    >
      <DropdownMenuTrigger
        nativeButton={false}
        render={<LevelImage {...imgProps} />}
      />
      <DropdownMenuContent key={`${menu.x}-${menu.y}`} anchor={anchor}>
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <img
              className="size-8 object-cover"
              src="https://imgs.search.brave.com/mllWmd6eU9HsOaqg76Mw-bEt5dfho5b8ovMmkA_yuBk/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9pLnJl/ZGQuaXQveG0xaXZ3/a2RpdWpmMS5qcGc"
            />
            <span>test</span>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <img
              className="size-8 object-cover"
              src="https://imgs.search.brave.com/59mewaK9f2-Q-KPX1gQ_OJRkzPrn5TVphUCxJ4sJt9Y/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9pLnJl/ZGQuaXQvbGFzODBj/dmltazlkMS5qcGVn"
            />
            <span>test</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
