import { useMutation } from "@tanstack/react-query"

import { setPlayerName } from "../api"
import { gameQueries } from "../queries"

export function useSetPlayerNameMutation() {
  return useMutation({
    mutationFn: setPlayerName,
    onSuccess: (_data, { gameId }, _onMutateResult, context) => {
      context.client.invalidateQueries({
        queryKey: gameQueries.detail(gameId).queryKey,
      })
    },
  })
}
