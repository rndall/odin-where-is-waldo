import { queryOptions } from "@tanstack/react-query"

import { getLevels } from "./api"

export const levelQueries = {
  all: () => ["levels"],
  lists: () => [...levelQueries.all(), "list"],
  list: () =>
    queryOptions({
      queryKey: [...levelQueries.lists()],
      queryFn: getLevels,
    }),
}
