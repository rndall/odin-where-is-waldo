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
  playerName: z.string().nullable(),
})

export type Game = z.infer<typeof GameSchema>

// GET /:gameId
export const GameSetPlayerNameBodySchema = z.object({
  playerName: z.string().trim().nonempty("Player name is required."),
})
export type GameSetPlayerNameBody = z.infer<typeof GameSetPlayerNameBodySchema>

export const GameSetPlayerNameReturnSchema = z.object({
  id: z.uuid(),
  startedAt: z.string(),
  finishedAt: z.string(),
  elapsedMs: NumericalIntPositiveSchema,
  levelId: NumericalIntPositiveSchema,
  playerName: z.string().nonempty(),
})
export type GameSetPlayerNameReturn = z.infer<
  typeof GameSetPlayerNameReturnSchema
>

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
