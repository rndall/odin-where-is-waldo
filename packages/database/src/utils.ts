import { db } from "./index"

export const resetDb = async () => {
  await db.orm.public.FoundCharacter.where({}).deleteAll()
  await db.orm.public.Game.where({}).deleteAll()
  await db.orm.public.Target.where({}).deleteAll()
  await db.orm.public.Character.where({}).deleteAll()
  await db.orm.public.Level.where({}).deleteAll()
}
