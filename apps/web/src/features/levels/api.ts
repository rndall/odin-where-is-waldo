import { LevelSchema } from "@workspace/shared"

import { apiUrl, parseJson } from "@/utils/api"

export const getLevel = async (levelNumber: number) => {
  const res = await fetch(apiUrl(`/levels/${levelNumber}`))
  return parseJson(res, LevelSchema)
}
