import { db, LEVEL_CHARACTERS, LEVEL_TARGETS } from "@workspace/db"

const getLevelFixture = () => {
  const level = LEVEL_TARGETS.find((level) => level.levelId === 1)

  if (!level) throw new Error("Missing level fixtures in LEVEL_TARGETS")

  return level
}

const LEVEL = getLevelFixture()

export const expectedLevel = {
  id: 1,
  imagePath: "/images/levels/level1-scene.webp",
  number: 1,
  targets: [
    {
      id: 1,
      x: 53.02,
      y: 50.39,
      character: {
        id: 2,
        imagePath: "/images/icons/waldo.png",
        name: "waldo",
      },
    },
    {
      id: 2,
      x: 24.41,
      y: 50.65,
      character: {
        id: 1,
        imagePath: "/images/icons/odlaw.png",
        name: "odlaw",
      },
    },
    {
      id: 3,
      x: 62.59,
      y: 50.13,
      character: {
        id: 3,
        imagePath: "/images/icons/wizard.webp",
        name: "wizard",
      },
    },
  ],
}

export const seedLevel = () =>
  db.transaction(async (tx) => {
    for (const character of LEVEL_CHARACTERS)
      await tx.orm.public.Character.create(character)

    const level = await tx.orm.public.Level.create({
      id: LEVEL.levelId,
      number: LEVEL.levelId,
      imagePath: "/images/levels/level1-scene.webp",
    })

    for (const [index, target] of LEVEL.targets.entries())
      await tx.orm.public.Target.create({
        id: index + 1,
        levelId: LEVEL.levelId,
        ...target,
      })

    return level
  })

export const resetDatabase = () =>
  db.transaction(async (tx) => {
    await tx.orm.public.Target.where({}).deleteAll()
    await Promise.all([
      tx.orm.public.Character.where({}).deleteAll(),
      tx.orm.public.Level.where({}).deleteAll(),
    ])
  })
