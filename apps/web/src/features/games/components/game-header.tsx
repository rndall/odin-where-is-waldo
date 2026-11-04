import type { Game } from "@workspace/shared"

import CharacterIcons from "@/components/character-icons"
import Timer from "@/components/timer"

interface GameHeaderProps {
  levelNumber: NonNullable<Game["level"]>["number"]
  startedAt: Game["startedAt"]
  characters: NonNullable<Game["level"]>["targets"]
  foundCharacters: Game["foundCharacters"]
  elapsedMs?: Game["elapsedMs"]
}

export default function GameHeader({
  levelNumber,
  startedAt,
  characters,
  foundCharacters,
  elapsedMs,
}: GameHeaderProps) {
  return (
    <div className="mx-auto grid w-full max-w-5xl grid-cols-[1fr_auto_1fr] items-center">
      <h1 className="text-xl font-bold">Level {levelNumber}</h1>
      <Timer startedAt={startedAt} elapsedMs={elapsedMs} />
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
