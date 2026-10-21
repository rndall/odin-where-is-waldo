import { queryOptions } from "@tanstack/react-query"

import { getLevel } from "./api"

export const levelQueries = {
  all: () => ["levels"],
  details: () => [...levelQueries.all(), "detail"],
  detail: (levelNumber: number) =>
    queryOptions({
      queryKey: [...levelQueries.details(), levelNumber],
      queryFn: () => getLevel(levelNumber),
    }),
}
