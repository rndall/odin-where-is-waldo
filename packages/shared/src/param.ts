import { z } from "zod"

export const NumericalIdSchema = z.coerce.number().int().positive()
