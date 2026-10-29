import {
  GameFindReturnSchema,
  GameSchema,
  StartGameReturnSchema,
  type GameFindBody,
  type StartGameBody,
} from "@workspace/shared"

import { apiUrl, parseJson } from "@/utils/api"

export const startGame = async (body: StartGameBody) => {
  const res = await fetch(apiUrl("/games"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
  return parseJson(res, StartGameReturnSchema)
}

export const getGame = async (gameId: string) => {
  const res = await fetch(apiUrl(`/games/${gameId}`))
  return parseJson(res, GameSchema)
}

export const findCharacter = async ({
  gameId,
  body,
}: {
  gameId: string
  body: GameFindBody
}) => {
  const res = await fetch(apiUrl(`/games/${gameId}/find`), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  })
  return parseJson(res, GameFindReturnSchema)
}
