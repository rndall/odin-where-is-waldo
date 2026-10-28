import { db, LEVEL_CHARACTERS, LEVEL_TARGETS } from "@workspace/db"

const LEVEL = LEVEL_TARGETS.find((level) => level.levelId === 1)

if (!LEVEL) throw new Error("Missing level fixtures in LEVEL_TARGETS")

export const createLevel = () =>
  db.transaction(async (tx) => {
    for (const character of LEVEL_CHARACTERS)
      await tx.orm.public.Character.create(character)

    const created = await tx.orm.public.Level.create({
      id: LEVEL.levelId,
      number: LEVEL.levelId,
      imagePath: "/images/levels/level1-scene.webp",
    })

    for (const target of LEVEL.targets)
      await tx.orm.public.Target.create({
        levelId: LEVEL.levelId,
        ...target,
      })

    return created
  })
