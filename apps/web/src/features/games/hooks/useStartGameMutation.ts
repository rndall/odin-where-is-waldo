import { useMutation } from "@tanstack/react-query"

import { startGame } from "../api"

export function useStartGameMutation() {
  return useMutation({
    mutationFn: startGame,
  })
}
