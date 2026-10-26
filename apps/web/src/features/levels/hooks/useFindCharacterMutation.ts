import { useMutation } from "@tanstack/react-query"

import { findCharacter } from "../api"

export function useFindCharacterMutation() {
  return useMutation({
    mutationFn: findCharacter,
  })
}
