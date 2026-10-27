import { Check } from "lucide-react"

import {
  Avatar,
  AvatarBadge,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar"
import { cn } from "@workspace/ui/lib/utils"
import type { Level } from "@workspace/shared"

interface CharacterIconProps {
  characters: Level["characters"]
  foundCharacters: number[]
}
export default function CharacterIcons({
  characters,
  foundCharacters,
}: CharacterIconProps) {
  return (
    <ul className="my-4 flex gap-3">
      {characters.map(({ id, ...c }) => (
        <li key={id}>
          <CharacterIcon {...c} found={foundCharacters.includes(id)} />
        </li>
      ))}
    </ul>
  )
}

function CharacterIcon({
  imagePath,
  name,
  found,
}: {
  imagePath: string
  name: string
  found: boolean
}) {
  return (
    <Avatar size="lg">
      <AvatarImage
        className={cn(found && "grayscale")}
        src={`${import.meta.env.VITE_ASSET_BASE_URL}${imagePath}`}
      />
      <AvatarFallback>{name}</AvatarFallback>
      {found && (
        <AvatarBadge className="bg-green-600">
          <Check />
        </AvatarBadge>
      )}
    </Avatar>
  )
}
