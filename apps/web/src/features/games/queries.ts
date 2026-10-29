import { queryOptions } from "@tanstack/react-query"

import { getGame } from "./api"

export const gameQueries = {
  all: () => ["games"],
  details: () => [...gameQueries.all(), "detail"],
  detail: (gameId: string) =>
    queryOptions({
      queryKey: [...gameQueries.details(), gameId],
      queryFn: () => getGame(gameId),
    }),
}
