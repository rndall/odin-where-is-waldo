import { z } from "zod"

import { NumericalIntPositiveSchema } from "../utils"

// POST /
export const StartGameBodySchema = z.object({
  levelNumber: NumericalIntPositiveSchema,
})
export type StartGameBody = z.infer<typeof StartGameBodySchema>

export const StartGameReturnSchema = z.object({
  gameId: z.uuid(),
})
export type StartGameReturn = z.infer<typeof StartGameReturnSchema>

// GET /:gameId
const TargetSchema = z.object({
  id: NumericalIntPositiveSchema,
  imagePath: z.string().nonempty(),
  name: z.string(),
})

const LevelSchema = z.object({
  id: NumericalIntPositiveSchema,
  imagePath: z.string().nonempty(),
  number: NumericalIntPositiveSchema,
  targets: z.array(TargetSchema),
})

export const GameSchema = z.object({
  id: z.uuid(),
  startedAt: z.string(),
  finishedAt: z.string().nullable(),
  elapsedMs: NumericalIntPositiveSchema.nullable(),
  foundCharacters: z.array(
    z.object({
      characterId: NumericalIntPositiveSchema,
      x: z.number(),
      y: z.number(),
    })
  ),
  level: LevelSchema.nullable(),
})

export type Game = z.infer<typeof GameSchema>

// POST /:gameId/find
export const GameFindBodySchema = z.object({
  characterId: NumericalIntPositiveSchema,
  x: z.number().nonnegative(),
  y: z.number().nonnegative(),
})
export type GameFindBody = z.infer<typeof GameFindBodySchema>

export const GameFindReturnSchema = z.object({
  message: z.string(),
  found: z.boolean(),
  finished: z.boolean(),
})
export type GameFindReturn = z.infer<typeof GameFindReturnSchema>
