import type { Response } from "express"
import createHttpError from "http-errors"
import { z } from "zod"

import { db } from "@workspace/db"
import {
  GameFindBodySchema,
  StartGameBodySchema,
  titleCase,
  type Game,
  type GameFindReturn,
  type StartGameReturn,
} from "@workspace/shared"
import { makeValidatedEndpoint } from "../utils/endpoint"
import { checkTarget } from "../utils/games"

export const startGame = makeValidatedEndpoint(
  {
    body: StartGameBodySchema,
  },
  async (req, res: Response<StartGameReturn>) => {
    const { levelNumber } = req.body

    const level = await db.orm.public.Level.where({
      number: levelNumber,
    })
      .select("id")
      .first()

    if (!level) {
      throw createHttpError(400, "No level with corresponding level number")
    }

    const game = await db.orm.public.Game.create({ levelId: level.id })

    res.status(201).json({ gameId: game.id })
  }
)

export const getGameById = makeValidatedEndpoint(
  {
    params: z.object({
      gameId: z.uuid(),
    }),
  },
  async (req, res: Response<Game>) => {
    const { gameId } = req.params

    const game = await db.orm.public.Game.where({ id: gameId })
      .select("id", "startedAt", "finishedAt", "elapsedMs")
      .include("foundCharacters", (character) =>
        character
          .select("characterId")
          .orderBy((character) => character.characterId.asc())
      )
      .include("level", (level) =>
        level.include("targets", (target) =>
          target
            .select("characterId", "x", "y")
            .orderBy((target) => target.characterId.asc())
            .include("character")
        )
      )
      .first()

    if (!game) {
      throw createHttpError(404, "Game not found")
    }

    const foundCharacters = game.foundCharacters.flatMap(({ characterId }) => {
      const target = game.level?.targets.find(
        (t) => t.characterId === characterId
      )

      if (!target) return []

      return [{ characterId, x: target.x, y: target.y }]
    })

    res.json({
      ...game,
      foundCharacters,
      level: game.level
        ? {
            ...game.level,
            targets: game.level.targets.map(({ character }) => character),
          }
        : game.level,
    })
  }
)

export const findCharacter = makeValidatedEndpoint(
  {
    params: z.object({
      gameId: z.uuid(),
    }),
    body: GameFindBodySchema,
  },
  async (req, res: Response<GameFindReturn>) => {
    const { gameId } = req.params
    const { characterId, ...guess } = req.body

    const result = await db.transaction(async (tx) => {
      const lockedGame = await tx.orm.public.Game.where({ id: gameId })
        .select("id")
        .forNoKeyUpdate()
        .first()

      if (!lockedGame) {
        throw createHttpError(404, "Game not found")
      }

      const game = await tx.orm.public.Game.where({ id: gameId })
        .include("level", (level) =>
          level
            .select("id")
            .include("targets", (target) => target.select("characterId"))
        )
        .include("foundCharacters")
        .select("id", "startedAt", "finishedAt")
        .firstOrThrow()

      if (game.finishedAt) {
        return {
          message: "All characters have been found already",
          found: false,
          finished: true,
        }
      }

      const foundCharacterIds = new Set(
        game.foundCharacters.map(({ characterId }) => characterId)
      )

      if (foundCharacterIds.has(characterId)) {
        return {
          message: "Character has already been found",
          found: false,
          finished: false,
        }
      }

      if (!game.level) {
        throw createHttpError(500, "Game not yet started on a level")
      }

      const target = await tx.orm.public.Target.where({
        levelId: game.level.id,
        characterId,
      })
        .include("character")
        .first()

      if (!target) {
        throw createHttpError(400, "Character is not in this level")
      }

      const allowance = 4
      if (!checkTarget({ guess, target, allowance })) {
        return {
          message: "You didn't find anyone",
          found: false,
          finished: false,
        }
      }

      await tx.orm.public.FoundCharacter.create({
        gameId: game.id,
        characterId,
      })
      foundCharacterIds.add(characterId)

      const hasFoundAllChars = game.level.targets.every(({ characterId }) =>
        foundCharacterIds.has(characterId)
      )

      if (hasFoundAllChars) {
        const finishedAt = new Date()

        const elapsedMs =
          finishedAt.getTime() - new Date(game.startedAt).getTime()

        await tx.orm.public.Game.where({
          id: game.id,
        }).update({
          finishedAt: finishedAt.toISOString(),
          elapsedMs,
        })
      }

      return {
        message: `You found ${titleCase(target.character.name)}`,
        found: true,
        finished: hasFoundAllChars,
      }
    })

    res.json(result)
  }
)
