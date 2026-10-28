import { z } from "zod"

// POST /
export const StartGameBodySchema = z.object({
  levelNumber: z.number().int().positive(),
})
export type StartGameBody = z.infer<typeof StartGameBodySchema>

export const StartGameReturnSchema = z.object({
  gameId: z.uuid(),
})
export type StartGameReturn = z.infer<typeof StartGameReturnSchema>

// POST /:gameId/find
export const GameFindBodySchema = z.object({
  characterId: z.number().int().positive(),
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
