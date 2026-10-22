import z from "zod"

const CharacterSchema = z.object({
  id: z.number().int().positive(),
  imagePath: z.string(),
  name: z.string(),
})

const TargetSchema = z.object({
  id: z.number().int().positive(),
  x: z.number().min(0).max(100),
  y: z.number().min(0).max(100),
  character: CharacterSchema,
})

export const LevelSchema = z.object({
  id: z.number().int().positive(),
  imagePath: z.string(),
  number: z.number().int().positive(),
  targets: z.array(TargetSchema),
})

export type Level = z.infer<typeof LevelSchema>
