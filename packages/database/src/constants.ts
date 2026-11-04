export const LEVEL_CHARACTERS: {
  id: number
  name: string
  imagePath: string
}[] = [
  { id: 1, name: "waldo", imagePath: "/images/icons/waldo.png" },
  { id: 2, name: "odlaw", imagePath: "/images/icons/odlaw.png" },
  { id: 3, name: "wizard", imagePath: "/images/icons/wizard.webp" },
  { id: 4, name: "wenda", imagePath: "/images/icons/wenda.webp" },
]

export const LEVEL_TARGETS: {
  levelId: number
  targets: { characterId: number; x: number; y: number }[]
}[] = [
  {
    levelId: 1,
    targets: [
      { characterId: 1, x: 53.02, y: 50.39 },
      { characterId: 2, x: 24.41, y: 50.65 },
      { characterId: 3, x: 62.59, y: 50.13 },
    ],
  },
  {
    levelId: 2,
    targets: [{ characterId: 1, x: 84.85, y: 30.3 }],
  },
  {
    levelId: 3,
    targets: [
      { characterId: 1, x: 96.12, y: 6.25 },
      { characterId: 2, x: 92.04, y: 58.32 },
      { characterId: 3, x: 29.61, y: 41.8 },
      { characterId: 4, x: 28.17, y: 66.58 },
    ],
  },
]
