import { db } from "@workspace/db"
import {
  type Level,
  LevelFindBodySchema,
  NumericalIdSchema,
  titleCase,
} from "@workspace/shared"
import { type Response, Router } from "express"
import createHttpError from "http-errors"
import { z } from "zod"

import { makeValidatedEndpoint } from "../utils/endpoint"
import { checkTarget } from "../utils/level"

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

levelsRouter.post(
  "/:levelNumber/find",
  makeValidatedEndpoint(
    {
      params: z.object({
        levelNumber: NumericalIdSchema,
      }),
      body: LevelFindBodySchema,
    },
    async (req, res) => {
      const { levelNumber } = req.params
      const { characterId, ...guess } = req.body

      const level = await db.orm.public.Level.where({
        number: levelNumber,
      }).first()

      if (!level) {
        throw createHttpError(404, "Level not found")
      }

      const target = await db.orm.public.Target.where({
        levelId: level.id,
        characterId,
      })
        .include("character")
        .first()

      if (!target) {
        throw createHttpError(400, "Character is not in this level")
      }

      const allowance = 4
      if (!checkTarget({ guess, target, allowance })) {
        res.json({
          message: "You didn't find anyone",
          found: false,
        })
        return
      }

      res.json({
        message: `You found ${titleCase(target.character.name)}`,
        found: true,
      })
    }
  )
)
