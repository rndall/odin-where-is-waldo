import { z } from "zod"

// GET /:levelNumber
const CharacterSchema = z.object({
  id: z.number().int().positive(),
  imagePath: z.string(),
  name: z.string(),
})

export const LevelSchema = z.object({
  id: z.number().int().positive(),
  imagePath: z.string(),
  number: z.number().int().positive(),
  characters: z.array(CharacterSchema),
})

export type Level = z.infer<typeof LevelSchema>

// POST /:levelNumber/find
export const LevelFindBodySchema = z.object({
  characterId: z.number().int().positive(),
  x: z.number().nonnegative(),
  y: z.number().nonnegative(),
})
export type LevelFindBody = z.infer<typeof LevelFindBodySchema>

export const LevelFindReturnSchema = z.object({
  message: z.string(),
  found: z.boolean(),
})
export type LevelFindReturn = z.infer<typeof LevelFindReturnSchema>
