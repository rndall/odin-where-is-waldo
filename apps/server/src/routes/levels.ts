import { db } from "@workspace/db"
import { type Level, NumericalIdSchema } from "@workspace/shared"
import { type Response, Router } from "express"
import createHttpError from "http-errors"
import { z } from "zod"

import { makeValidatedEndpoint } from "../utils/endpoint"

export const levelsRouter: Router = Router()

levelsRouter.get(
  "/:levelNumber",
  makeValidatedEndpoint(
    {
      params: z.object({
        levelNumber: NumericalIdSchema,
      }),
    },
    async (req, res: Response<Level>) => {
      const { levelNumber } = req.params

      const level = await db.orm.public.Level.where({
        number: levelNumber,
      }).first()

      if (!level) {
        throw createHttpError(404, "Level not found")
      }

      const characters = await db.orm.public.Character.where((c) =>
        c.targets.some((t) => t.levelId.eq(level.id))
      )
        .orderBy((c) => c.id.asc())
        .all()

      res.json({ ...level, characters })
    }
  )
)
