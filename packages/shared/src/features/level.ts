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
