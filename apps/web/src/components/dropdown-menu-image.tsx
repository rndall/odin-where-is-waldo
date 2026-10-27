import { getRouteApi } from "@tanstack/react-router"
import { useRef, useState, type ImgHTMLAttributes } from "react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import { Spinner } from "@workspace/ui/components/spinner"
import { titleCase, type Level } from "@workspace/shared"
import { useFindCharacterMutation } from "@/features/levels/hooks/useFindCharacterMutation"
import type { CharacterFindMarker } from "@/routes/levels/$levelNumber"
import LevelImage from "./level-image"
import CharacterFindMarkers from "./character-find-marker"

interface DropdownMenuImageProps {
  imgProps: ImgHTMLAttributes<HTMLImageElement>
  characters: Level["characters"]
  foundCharacters: CharacterFindMarker[]
  onCorrectSelection: (selection: CharacterFindMarker) => void
}

const route = getRouteApi("/levels/$levelNumber")

export default function DropdownMenuImage({
  imgProps,
  characters,
  foundCharacters,
  onCorrectSelection,
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
  }

  const { mutate, isPending, variables } = useFindCharacterMutation()
  const { levelNumber } = route.useParams()

  const handleFindChar = (characterId: number) => {
    mutate(
      {
        levelNumber: Number(levelNumber),
        body: { ...coords, characterId },
      },
      {
        onSuccess: ({ found }, { body }) => {
          if (found) {
            onCorrectSelection(body)
          }
          setMenu((m) => ({ ...m, open: false }))
        },
      }
    )
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
        render={
          <div className="relative mx-auto w-fit max-w-full">
            <LevelImage ref={imageRef} {...imgProps} />
            <CharacterFindMarkers markers={foundCharacters} />
          </div>
        }
      />
      <DropdownMenuContent key={`${menu.x}-${menu.y}`} anchor={anchor}>
        <DropdownMenuGroup>
          {characters.map((c) => (
            <DropdownMenuItem
              closeOnClick={false}
              key={c.id}
              disabled={
                !!foundCharacters.find((find) => find.characterId === c.id)
              }
              onClick={() => handleFindChar(c.id)}
            >
              <img
                className="size-8 object-cover"
                src={`${import.meta.env.VITE_ASSET_BASE_URL}${c.imagePath}`}
              />
              {titleCase(c.name)}
              {isPending && variables.body.characterId === c.id && (
                <Spinner className="ml-auto" />
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
