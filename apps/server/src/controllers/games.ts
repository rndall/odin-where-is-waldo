import createHttpError from "http-errors"
import { z } from "zod"

import { db } from "@workspace/db"
import { makeValidatedEndpoint } from "../utils/endpoint"

export const startGame = makeValidatedEndpoint(
  {
    body: z.object({
      levelNumber: z.number().int().positive(),
    }),
  },
  async (req, res) => {
    const { levelNumber } = req.body

    const level = await db.orm.public.Level.where({
      number: levelNumber,
    }).first()

    if (!level) {
      throw createHttpError(400, "No level with corresponding level number")
    }

    const game = await db.orm.public.Game.create({ levelId: level.id })

    res.status(201).json({ gameId: game.id })
  }
)
