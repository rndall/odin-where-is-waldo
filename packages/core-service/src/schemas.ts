import z from "zod"

export const numericalIdSchema = z.coerce.number().int().positive()
