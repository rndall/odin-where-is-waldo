import z from "zod"

import { LeaderboardSchema, LevelSchema } from "@workspace/shared"

import { apiUrl, parseJson } from "@/utils/api"

export const getLevels = async () => {
  const res = await fetch(apiUrl("/levels"))
  return parseJson(res, z.array(LevelSchema))
}

export const getLevelLeaderboard = async (levelNumber: number) => {
  const res = await fetch(apiUrl(`/levels/${levelNumber}/leaderboard`))
  return parseJson(res, z.array(LeaderboardSchema))
}
