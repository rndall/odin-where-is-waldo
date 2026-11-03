import type { Response } from "express"

import { db } from "@workspace/db"
import type { Level } from "@workspace/shared"

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
