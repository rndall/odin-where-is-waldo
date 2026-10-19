import { join, parse } from "node:path"
import { db } from "./index"
import { readdir } from "fs/promises"
import { LEVEL_TARGETS } from "./constants"

const IMAGES_DIR = "../../../apps/server/public/images"

const existing = await db.orm.public.Level.select("id").all()
if (existing.length === 0) {
  const characterIconsDir = join(import.meta.dirname, `${IMAGES_DIR}/icons`)
  try {
    const files = await readdir(characterIconsDir)
    for (const file of files)
      await db.orm.public.Character.create({
        name: parse(file).name,
        imagePath: `/images/icons/${file}`,
      })
  } catch (err) {
    console.error("Error reading directory:", err)
  }

  const levelScenesDir = join(import.meta.dirname, `${IMAGES_DIR}/levels`)
  try {
    const files = await readdir(levelScenesDir)
    for (const [index, file] of files.entries())
      await db.orm.public.Level.create({
        number: index + 1,
        imagePath: `/images/levels/${file}`,
      })
  } catch (err) {
    console.error("Error reading directory:", err)
  }

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
  await db.orm.public.Character.select("id", "name", "imagePath").all()
)
console.log(await db.orm.public.Level.select("id", "number", "imagePath").all())
console.log(
  await db.orm.public.Target.select(
    "id",
    "characterId",
    "levelId",
    "x",
    "y"
  ).all()
)
await db.close()
