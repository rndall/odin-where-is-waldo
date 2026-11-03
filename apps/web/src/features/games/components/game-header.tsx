import type { Game } from "@workspace/shared"

import CharacterIcons from "@/components/character-icons"
import Timer from "@/components/timer"

interface GameHeaderProps {
  levelNumber?: number
  startedAt: string
  characters: NonNullable<Game["level"]>["targets"]
  foundCharacters: Game["foundCharacters"]
}

export default function GameHeader({
  levelNumber,
  startedAt,
  characters,
  foundCharacters,
}: GameHeaderProps) {
  return (
    <div className="grid w-full max-w-5xl grid-cols-[1fr_auto_1fr] items-center">
      <h1 className="text-xl font-bold">Level {levelNumber}</h1>
      <Timer startedAt={startedAt} />
      <div className="justify-self-end">
        <CharacterIcons
          characters={characters}
          foundCharacters={foundCharacters.map(
            ({ characterId }) => characterId
          )}
        />
      </div>
    </div>
  )
}
