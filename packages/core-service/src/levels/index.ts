import { openapi } from "@orpc/openapi"
import { os } from "@orpc/server"
import { db } from "@workspace/db"

import z from "zod"
import { findLevelOutputSchema } from "./schemas"
import { numericalIdSchema } from "../schemas"

const levelBuilder = os.meta(openapi({ prefix: "/levels" }))

const findLevel = levelBuilder
  .meta(openapi({ method: "GET", path: "/{levelNumber}" }))
  .errors({
    BAD_REQUEST: {},
    NOT_FOUND: { message: "Level not found" },
  })
  .input(z.object({ levelNumber: numericalIdSchema }))
  .output(findLevelOutputSchema)
  .handler(async ({ errors, input }) => {
    const level = await db.orm.public.Level.where({
      number: input.levelNumber,
    })
      .include("targets", (target) =>
        target
          .select("id", "x", "y")
          .orderBy((target) => target.id.asc())
          .include("character")
      )
      .first()

    if (!level) throw errors.NOT_FOUND()

    return { level }
  })

export const levelRouter = {
  find: findLevel,
}
