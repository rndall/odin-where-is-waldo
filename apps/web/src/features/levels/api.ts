import z from "zod"

import { LevelSchema } from "@workspace/shared"

import { apiUrl, parseJson } from "@/utils/api"

export const getLevels = async () => {
  const res = await fetch(apiUrl("/levels"))
  return parseJson(res, z.array(LevelSchema))
}
