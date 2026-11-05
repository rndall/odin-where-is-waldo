import type { Game } from "@workspace/shared"

export default function CharacterFindMarkers({
  markers,
}: {
  markers: Game["foundCharacters"]
}) {
  return (
    <div className="pointer-events-none absolute inset-0">
      {markers.map(({ characterId, ...m }) => (
        <CharacterFindMarker key={characterId} {...m} />
      ))}
    </div>
  )
}

function CharacterFindMarker({
  x,
  y,
}: Omit<Game["foundCharacters"][number], "characterId">) {
  return (
    <div
      className="absolute size-15 -translate-1/2 rounded-full border-3 border-black"
      style={{ left: `${x}%`, top: `${y}%` }}
    />
  )
}
