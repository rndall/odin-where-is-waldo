import { db } from "@workspace/db"
import { Router } from "express"
import createHttpError from "http-errors"
import { z } from "zod"

import { makeValidatedEndpoint } from "../utils/endpoint"
import { numericalIdSchema } from "../utils/schemas"

export const levelsRouter: Router = Router()

levelsRouter.get(
  "/:levelNumber",
  makeValidatedEndpoint(
    {
      params: z.object({
        levelNumber: numericalIdSchema,
      }),
    },
    async (req, res) => {
      const { levelNumber } = req.params

      const level = await db.orm.public.Level.where({
        number: levelNumber,
      })
        .include("targets", (target) =>
          target
            .select("id", "x", "y")
            .orderBy((target) => target.id.asc())
            .include("character")
        )
        .first()

      if (!level) {
        throw createHttpError(404, "Level not found")
      }

      res.json({ level })
    }
  )
)
