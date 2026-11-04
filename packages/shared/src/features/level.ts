import { z } from "zod"

import { NumericalIntPositiveSchema } from "../utils"

// GET /
const TargetSchema = z.object({
  id: NumericalIntPositiveSchema,
  imagePath: z.string().nonempty(),
  name: z.string(),
})

export const LevelSchema = z.object({
  id: NumericalIntPositiveSchema,
  imagePath: z.string().nonempty(),
  number: NumericalIntPositiveSchema,
  targets: z.array(TargetSchema),
})
export type Level = z.infer<typeof LevelSchema>

// GET /:levelNumber/leaderboard
export const LeaderboardSchema = z.object({
  playerName: z.string(),
  elapsedMs: z.number(),
  finishedAt: z.string(),
})
export type Leaderboard = z.infer<typeof LeaderboardSchema>
