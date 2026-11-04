import { queryOptions } from "@tanstack/react-query"

import { getLevelLeaderboard, getLevels } from "./api"

export const levelQueries = {
  all: () => ["levels"],
  details: () => [...levelQueries.all(), "detail"],
  detail: (levelNumber: number) => [...levelQueries.details(), levelNumber],
  leaderboard: (levelNumber: number) =>
    queryOptions({
      queryKey: [...levelQueries.detail(levelNumber), "leaderboard"],
      queryFn: () => getLevelLeaderboard(levelNumber),
    }),
  lists: () => [...levelQueries.all(), "list"],
  list: () =>
    queryOptions({
      queryKey: [...levelQueries.lists()],
      queryFn: getLevels,
    }),
}
