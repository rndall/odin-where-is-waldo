import { z } from "zod"

import { NumericalIntPositiveSchema } from "../utils"

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
