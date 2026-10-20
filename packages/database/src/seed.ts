import { join } from "node:path"
import { db } from "./index"
import { readdir } from "fs/promises"
import { LEVEL_CHARACTERS, LEVEL_TARGETS } from "./constants"

const IMAGES_DIR = "../../../apps/server/public/images"

const existing = await db.orm.public.Level.select("id").all()
if (existing.length === 0) {
  for (const character of LEVEL_CHARACTERS)
    await db.orm.public.Character.create(character)

  const levelScenesDir = join(import.meta.dirname, `${IMAGES_DIR}/levels`)
  const files = await readdir(levelScenesDir)
  for (const [index, file] of files.entries())
    await db.orm.public.Level.create({
      number: index + 1,
      imagePath: `/images/levels/${file}`,
    })

  for (const level of LEVEL_TARGETS) {
    for (const target of level.targets) {
      await db.orm.public.Target.create({
        levelId: level.levelId,
        x: target.x,
        y: target.y,
        characterId: target.characterId,
      })
    }
  }
}

console.log(
  await db.orm.public.Level.select("id", "number", "imagePath")
    .include("targets")
    .all()
)

await db.close()
