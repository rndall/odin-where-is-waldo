import z from "zod"

export const findLevelOutputSchema = z.object({
  level: z.object({
    id: z.number(),
    number: z.number(),
    imagePath: z.string(),
    targets: z.array(
      z.object({
        id: z.number(),
        x: z.number(),
        y: z.number(),
        character: z.object({
          id: z.number(),
          name: z.string(),
          imagePath: z.string(),
        }),
      })
    ),
  }),
})
