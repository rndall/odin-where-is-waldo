import { z } from "zod"

export const StartGameSchema = z.object({
  gameId: z.uuid(),
})

export type StartGame = z.infer<typeof StartGameSchema>
