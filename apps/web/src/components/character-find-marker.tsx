import type { CharacterFindMarker } from "@/routes/levels/$levelNumber"

export default function CharacterFindMarkers({
  markers,
}: {
  markers: CharacterFindMarker[]
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
}: Omit<CharacterFindMarker, "characterId">) {
  return (
    <div
      className="absolute size-15 -translate-1/2 rounded-full border-3 border-black"
      style={{ left: `${x}%`, top: `${y}%` }}
    />
  )
}
