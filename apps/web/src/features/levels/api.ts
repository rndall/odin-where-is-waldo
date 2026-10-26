import {
  LevelFindReturnSchema,
  LevelSchema,
  type LevelFindBody,
} from "@workspace/shared"

import { apiUrl, parseJson } from "@/utils/api"

export const getLevel = async (levelNumber: number) => {
  const res = await fetch(apiUrl(`/levels/${levelNumber}`))
  return parseJson(res, LevelSchema)
}

export const findCharacter = async ({
  levelNumber,
  body,
}: {
  levelNumber: number
  body: LevelFindBody
}) => {
  const res = await fetch(apiUrl(`/levels/${levelNumber}/find`), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  })
  return parseJson(res, LevelFindReturnSchema)
}
