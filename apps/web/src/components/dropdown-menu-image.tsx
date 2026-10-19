import { useRef, useState, type ImgHTMLAttributes } from "react"

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
          <DropdownMenuItem onClick={() => console.log(coords)}>
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
