import { db } from "@workspace/db"

export const resetDb = () =>
  db.transaction(async (tx) => {
    await tx.orm.public.FoundCharacter.where({}).deleteAll()
    await tx.orm.public.Game.where({}).deleteAll()
    await tx.orm.public.Target.where({}).deleteAll()
    await tx.orm.public.Character.where({}).deleteAll()
    await tx.orm.public.Level.where({}).deleteAll()
  })
