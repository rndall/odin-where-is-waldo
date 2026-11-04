import type { Response } from "express"
import createHttpError from "http-errors"
import { z } from "zod"

import { and, db } from "@workspace/db"
import {
  LeaderboardSchema,
  NumericalIdSchema,
  type Leaderboard,
  type Level,
} from "@workspace/shared"

import { makeValidatedEndpoint } from "../utils/endpoint"

export const getLevels = makeValidatedEndpoint(
  {},
  async (_req, res: Response<Level[]>) => {
    const levels = await db.orm.public.Level.include("targets", (target) =>
      target
        .select("characterId")
        .orderBy(({ characterId }) => characterId.asc())
        .include("character")
    ).all()

    res.json(
      levels.map((l) => ({
        ...l,
        targets: l.targets.map(({ character }) => character),
      }))
    )
  }
)

export const getLevelLeaderboard = makeValidatedEndpoint(
  {
    params: z.object({
      levelNumber: NumericalIdSchema,
    }),
  },
  async (req, res: Response<Leaderboard[]>) => {
    const { levelNumber } = req.params

    const level = await db.orm.public.Level.where({
      number: levelNumber,
    }).first()

    if (!level) {
      throw createHttpError(404, "Level not found")
    }

    const leaderboard = await db.orm.public.Game.where({
      levelId: level.id,
    })
      .where((g) =>
        and(
          g.finishedAt.isNotNull(),
          g.elapsedMs.isNotNull(),
          g.playerName.isNotNull()
        )
      )
      .orderBy([(g) => g.elapsedMs.asc(), (g) => g.finishedAt.asc()])
      .select("playerName", "elapsedMs", "finishedAt")
      .limit(10)
      .all()

    res.json(z.array(LeaderboardSchema).parse(leaderboard))
  }
)
