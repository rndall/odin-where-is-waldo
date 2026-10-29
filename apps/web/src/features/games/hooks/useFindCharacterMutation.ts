import { useMutation } from "@tanstack/react-query"

import { findCharacter } from "../api"
import { gameQueries } from "../queries"

export function useFindCharacterMutation() {
  return useMutation({
    mutationFn: findCharacter,
    onSuccess: (_data, { gameId }, _onMutateResult, context) => {
      context.client.invalidateQueries({
        queryKey: gameQueries.detail(gameId).queryKey,
      })
    },
  })
}
