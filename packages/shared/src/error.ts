import { z } from "zod"

export const ApiErrorSchema = z.object({
  message: z.string(),
})

export type ApiError = z.infer<typeof ApiErrorSchema>
