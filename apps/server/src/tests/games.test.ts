import { afterAll, beforeEach, describe, expect, test } from "@jest/globals"

import request from "supertest"

import { db, resetDb } from "@workspace/db"
import { StartGameReturnSchema } from "@workspace/shared"
import { app } from "../app"
import { createLevel } from "../utils/levels"

describe("Game", () => {
  beforeEach(async () => {
    await resetDb()
  })

  afterAll(async () => {
    await db.close()
  })

  const startGame = async (levelNumber: number) => {
    const res = await request(app)
      .post("/api/games")
      .send({ levelNumber })
      .set("Accept", "application/json")

    expect(res.status).toBe(201)

    return StartGameReturnSchema.parse(res.body)
  }

  const finishGame = async (gameId: string, levelId: number) => {
    const level = await db.orm.public.Level.where({ id: levelId })
      .include("targets")
      .firstOrThrow()

    let lastRes: request.Response | undefined

    for (const target of level.targets) {
      lastRes = await request(app)
        .post(`/api/games/${gameId}/find`)
        .send({
          characterId: target.characterId,
          x: target.x,
          y: target.y,
        })
        .set("Accept", "application/json")

      expect(lastRes.status).toBe(200)
    }

    return lastRes
  }

  describe("get by id route", () => {
    test("returns the correct game", async () => {
      const level = await createLevel()
      const { gameId } = await startGame(level.number)

      const res = await request(app).get(`/api/games/${gameId}`)

      expect(res.headers["content-type"]).toMatch(/json/)
      expect(res.status).toBe(200)
      expect(res.body).toStrictEqual({
        id: gameId,
        startedAt: expect.any(String),
        finishedAt: null,
        elapsedMs: null,
        foundCharacters: [],
        playerName: null,
        level: {
          ...level,
          targets: [
            {
              id: 1,
              imagePath: "/images/icons/waldo.png",
              name: "waldo",
            },
            {
              id: 2,
              imagePath: "/images/icons/odlaw.png",
              name: "odlaw",
            },
            {
              id: 3,
              imagePath: "/images/icons/wizard.webp",
              name: "wizard",
            },
          ],
        },
      })
    })

    test("returns 404 on missing game", async () => {
      const res = await request(app).get(`/api/games/${crypto.randomUUID()}`)

      expect(res.headers["content-type"]).toMatch(/json/)
      expect(res.status).toBe(404)
      expect(res.body).toStrictEqual({ message: "Game not found" })
    })

    test("returns 404 on invalid uuid", async () => {
      const res = await request(app).get("/api/games/1")

      expect(res.headers["content-type"]).toMatch(/json/)
      expect(res.status).toBe(400)
      expect(res.body).toMatchObject({
        message: "Validation failed",
        errors: {
          params: {
            fieldErrors: {
              gameId: ["Invalid UUID"],
            },
          },
        },
      })
    })
  })

  describe("post route", () => {
    test("returns created game id on existing level", async () => {
      const level = await db.orm.public.Level.create({
        number: 1,
        imagePath: "/images/levels/level1-scene.webp",
      })

      const res = await request(app)
        .post("/api/games")
        .send({ levelNumber: level.number })
        .set("Accept", "application/json")

      expect(res.headers["content-type"]).toMatch(/json/)
      expect(res.status).toBe(201)
      expect(res.body).toStrictEqual({
        gameId: expect.any(String),
      })

      const { gameId } = StartGameReturnSchema.parse(res.body)
      expect(gameId).toBeTruthy()

      const game = await db.orm.public.Game.where({ id: gameId }).first()
      expect(game?.levelId).toBe(level.id)
    })

    test("returns 400 when no corresponding level", async () => {
      const res = await request(app)
        .post("/api/games")
        .send({ levelNumber: 1 })
        .set("Accept", "application/json")

      expect(res.headers["content-type"]).toMatch(/json/)
      expect(res.status).toBe(400)
      expect(res.body).toStrictEqual({
        message: "No level with corresponding level number",
      })
    })

    describe("body", () => {
      test("returns 400 on missing fields", async () => {
        const res = await request(app)
          .post("/api/games")
          .send({})
          .set("Accept", "application/json")

        expect(res.headers["content-type"]).toMatch(/json/)
        expect(res.status).toBe(400)
        expect(res.body).toMatchObject({
          message: "Validation failed",
          errors: {
            body: {
              fieldErrors: {
                levelNumber: [expect.any(String)],
              },
            },
          },
        })
      })

      test.each(["a", 0, -1, 1.5])(
        "returns 400 on invalid param %s",
        async (param) => {
          const res = await request(app)
            .post("/api/games")
            .send({ levelNumber: param })
            .set("Accept", "application/json")

          expect(res.headers["content-type"]).toMatch(/json/)
          expect(res.status).toBe(400)
          expect(res.body).toMatchObject({
            message: "Validation failed",
            errors: {
              body: {
                fieldErrors: {
                  levelNumber: [expect.any(String)],
                },
              },
            },
          })
        }
      )
    })
  })

  describe("set player name route", () => {
    const setPlayerName = (gameId: string, playerName: string) =>
      request(app)
        .patch(`/api/games/${gameId}`)
        .send({ playerName })
        .set("Accept", "application/json")

    test("returns updated game on success", async () => {
      const level = await createLevel()
      const { gameId } = await startGame(level.number)

      await finishGame(gameId, level.id)

      const playerName = "Player One"
      const res = await setPlayerName(gameId, playerName)

      expect(res.headers["content-type"]).toMatch(/json/)
      expect(res.status).toBe(200)
      expect(res.body).toMatchObject({
        id: gameId,
        playerName,
        finishedAt: expect.any(String),
      })
    })

    test("returns 404 on missing game", async () => {
      const res = await setPlayerName(crypto.randomUUID(), "Player One")

      expect(res.headers["content-type"]).toMatch(/json/)
      expect(res.status).toBe(404)
      expect(res.body).toStrictEqual({
        message: "Game not found",
      })
    })

    test("returns 409 when game isn't finished yet", async () => {
      const level = await createLevel()
      const { gameId } = await startGame(level.number)

      const gameBefore = await db.orm.public.Game.where({
        id: gameId,
      }).firstOrThrow()

      const res = await setPlayerName(gameId, "Player One")

      expect(res.headers["content-type"]).toMatch(/json/)
      expect(res.status).toBe(409)
      expect(res.body).toStrictEqual({
        message: "Game isn't finished yet",
      })

      const gameAfter = await db.orm.public.Game.where({
        id: gameId,
      }).firstOrThrow()

      expect(gameAfter.playerName).toBe(gameBefore.playerName)
    })

    describe("params", () => {
      test("returns 400 on invalid uuid", async () => {
        const res = await setPlayerName("1", "Player One")

        expect(res.headers["content-type"]).toMatch(/json/)
        expect(res.status).toBe(400)
        expect(res.body).toMatchObject({
          message: "Validation failed",
          errors: {
            params: {
              fieldErrors: {
                gameId: ["Invalid UUID"],
              },
            },
          },
        })
      })
    })

    describe("body", () => {
      test.each([{}, { playerName: 123 }])(
        "returns 400 on invalid param %s",
        async (param) => {
          const res = await request(app)
            .patch(`/api/games/${crypto.randomUUID()}`)
            .send(param)
            .set("Accept", "application/json")

          expect(res.headers["content-type"]).toMatch(/json/)
          expect(res.status).toBe(400)
          expect(res.body).toMatchObject({
            message: "Validation failed",
            errors: {
              body: {
                fieldErrors: {
                  playerName: [expect.any(String)],
                },
              },
            },
          })
        }
      )
    })
  })

  describe("find route", () => {
    test("returns found on correct target", async () => {
      const level = await createLevel()
      const { gameId } = await startGame(level.number)

      const characterId = 1

      const res = await request(app)
        .post(`/api/games/${gameId}/find`)
        .send({ characterId, x: 53.02, y: 50.39 })
        .set("Accept", "application/json")

      expect(res.headers["content-type"]).toMatch(/json/)
      expect(res.status).toBe(200)
      expect(res.body).toStrictEqual({
        message: "You found Waldo",
        found: true,
        finished: false,
      })

      const getRes = await request(app).get(`/api/games/${gameId}`)
      expect(getRes.headers["content-type"]).toMatch(/json/)
      expect(getRes.status).toBe(200)
      expect(getRes.body).toMatchObject({
        foundCharacters: [{ characterId }],
      })
    })

    test("returns not found on incorrect target", async () => {
      const level = await createLevel()
      const { gameId } = await startGame(level.number)

      const res = await request(app)
        .post(`/api/games/${gameId}/find`)
        .send({ characterId: 2, x: 53.02, y: 50.39 })
        .set("Accept", "application/json")

      expect(res.headers["content-type"]).toMatch(/json/)
      expect(res.status).toBe(200)
      expect(res.body).toStrictEqual({
        message: "You didn't find anyone",
        found: false,
        finished: false,
      })
    })

    test("returns 404 on missing game", async () => {
      const res = await request(app)
        .post(`/api/games/${crypto.randomUUID()}/find`)
        .send({ characterId: 2, x: 53.02, y: 50.39 })
        .set("Accept", "application/json")

      expect(res.headers["content-type"]).toMatch(/json/)
      expect(res.status).toBe(404)
      expect(res.body).toStrictEqual({ message: "Game not found" })
    })

    test("returns 400 when character is not in this level", async () => {
      const level = await createLevel()
      const { gameId } = await startGame(level.number)

      // Character id 4 exists in no fixture level
      const res = await request(app)
        .post(`/api/games/${gameId}/find`)
        .send({ characterId: 4, x: 53.02, y: 50.39 })
        .set("Accept", "application/json")

      expect(res.headers["content-type"]).toMatch(/json/)
      expect(res.status).toBe(400)
      expect(res.body).toStrictEqual({
        message: "Character is not in this level",
      })
    })

    test("returns found on guess within allowance", async () => {
      const level = await createLevel()
      const { gameId } = await startGame(level.number)

      // Target is at x 53.02, allowance is 4, so 57.02 is exactly at the edge
      const res = await request(app)
        .post(`/api/games/${gameId}/find`)
        .send({ characterId: 1, x: 57.02, y: 50.39 })
        .set("Accept", "application/json")

      expect(res.headers["content-type"]).toMatch(/json/)
      expect(res.status).toBe(200)
      expect(res.body).toStrictEqual({
        message: "You found Waldo",
        found: true,
        finished: false,
      })
    })

    test("returns not found when a guess exceeds the allowance", async () => {
      const level = await createLevel()
      const { gameId } = await startGame(level.number)

      // |57.03 - 53.02| = 4.01 exceeds the allowance of 4
      const res = await request(app)
        .post(`/api/games/${gameId}/find`)
        .send({ characterId: 1, x: 57.03, y: 50.39 })
        .set("Accept", "application/json")

      expect(res.headers["content-type"]).toMatch(/json/)
      expect(res.status).toBe(200)
      expect(res.body).toStrictEqual({
        message: "You didn't find anyone",
        found: false,
        finished: false,
      })
    })

    test("returns not found when x or y alone exceeds the allowance", async () => {
      const level = await createLevel()
      const { gameId } = await startGame(level.number)

      const res = await request(app)
        .post(`/api/games/${gameId}/find`)
        .send({ characterId: 1, x: 53.02, y: 54.4 })
        .set("Accept", "application/json")

      expect(res.headers["content-type"]).toMatch(/json/)
      expect(res.status).toBe(200)
      expect(res.body).toStrictEqual({
        message: "You didn't find anyone",
        found: false,
        finished: false,
      })
    })

    test("returns already found when character was found previously", async () => {
      const level = await createLevel()
      const { gameId } = await startGame(level.number)

      const postReq = () =>
        request(app)
          .post(`/api/games/${gameId}/find`)
          .send({ characterId: 1, x: 53.02, y: 50.39 })
          .set("Accept", "application/json")

      const res1 = await postReq()

      expect(res1.headers["content-type"]).toMatch(/json/)
      expect(res1.status).toBe(200)
      expect(res1.body).toStrictEqual({
        message: "You found Waldo",
        found: true,
        finished: false,
      })

      const res2 = await postReq()

      expect(res2.headers["content-type"]).toMatch(/json/)
      expect(res2.status).toBe(200)
      expect(res2.body).toStrictEqual({
        message: "Character has already been found",
        found: false,
        finished: false,
      })
    })

    test("returns finished when all characters are found", async () => {
      const level = await createLevel()
      const { gameId } = await startGame(level.number)

      const dbLevel = await db.orm.public.Level.where({ id: level.id })
        .include("targets")
        .firstOrThrow()

      const targets = dbLevel.targets
      expect(targets.length).toBeGreaterThan(0)

      for (const [index, target] of targets.entries()) {
        const res = await request(app)
          .post(`/api/games/${gameId}/find`)
          .send({
            characterId: target.characterId,
            x: target.x,
            y: target.y,
          })
          .set("Accept", "application/json")

        expect(res.headers["content-type"]).toMatch(/json/)
        expect(res.status).toBe(200)
        expect(res.body).toMatchObject({
          found: true,
          finished: index === targets.length - 1,
        })

        const getRes = await request(app).get(`/api/games/${gameId}`)
        expect(getRes.headers["content-type"]).toMatch(/json/)
        expect(getRes.status).toBe(200)
        expect(getRes.body).toMatchObject({
          foundCharacters: expect.arrayContaining([
            expect.objectContaining({
              characterId: target.characterId,
            }),
          ]),
        })
      }

      const firstTarget = dbLevel.targets[0]

      if (!firstTarget) {
        throw new Error("Expected level to have at least one target")
      }

      const res = await request(app)
        .post(`/api/games/${gameId}/find`)
        .send({
          characterId: firstTarget.characterId,
          x: firstTarget.x,
          y: firstTarget.y,
        })
        .set("Accept", "application/json")

      expect(res.headers["content-type"]).toMatch(/json/)
      expect(res.status).toBe(200)
      expect(res.body).toStrictEqual({
        message: "All characters have been found already",
        found: false,
        finished: true,
      })
    })
  })

  describe("leaderboard qualification", () => {
    const seedFinishedGame = async ({
      levelNumber,
      elapsedMs,
      playerName = "Player",
      finishedAt = new Date().toISOString(),
    }: {
      levelNumber: number
      elapsedMs: number
      playerName?: string | null
      finishedAt?: string | null
    }) => {
      const { gameId } = await startGame(levelNumber)

      await db.orm.public.Game.where({ id: gameId }).update({
        elapsedMs,
        ...(playerName !== null ? { playerName } : {}),
        ...(finishedAt !== null ? { finishedAt } : {}),
      })

      return gameId
    }

    const backdateGameStart = async (gameId: string) =>
      db.orm.public.Game.where({ id: gameId }).update({
        startedAt: new Date(Date.now() - 60_000).toISOString(),
      })

    test("qualifies when no games finished yet", async () => {
      const level = await createLevel()
      const { gameId } = await startGame(level.number)
      await backdateGameStart(gameId)

      const res = await finishGame(gameId, level.id)

      if (!res) return

      expect(res.body).toMatchObject({
        found: true,
        finished: true,
        qualifiesForLeaderboard: true,
      })
    })

    test("qualifies when less than ten entries exist", async () => {
      const level = await createLevel()

      // Entries are all faster than the tested game will be
      for (const elapsedMs of [1, 2, 3, 4])
        await seedFinishedGame({ levelNumber: level.number, elapsedMs })

      const { gameId } = await startGame(level.number)

      const res = await finishGame(gameId, level.id)

      if (!res) return

      expect(res.body).toMatchObject({
        found: true,
        finished: true,
        qualifiesForLeaderboard: true,
      })
    })

    test("qualifies when faster than the tenth entry", async () => {
      const level = await createLevel()

      for (const index of Array.from({ length: 10 }, (_, index) => index))
        await seedFinishedGame({
          levelNumber: level.number,
          elapsedMs: 1_000_000 + index * 1_000,
        })

      const { gameId } = await startGame(level.number)
      await backdateGameStart(gameId)

      const res = await finishGame(gameId, level.id)

      if (!res) return

      expect(res.body).toMatchObject({
        found: true,
        finished: true,
        qualifiesForLeaderboard: true,
      })
    })

    test("doesn't qualify when slower than the tenth entry", async () => {
      const level = await createLevel()

      for (const elapsedMs of [1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
        await seedFinishedGame({ levelNumber: level.number, elapsedMs })

      const { gameId } = await startGame(level.number)
      await backdateGameStart(gameId)

      const res = await finishGame(gameId, level.id)

      if (!res) {
        throw new Error("Expected level to have at least one target")
      }

      expect(res.body).toMatchObject({
        found: true,
        finished: true,
        qualifiesForLeaderboard: false,
      })
    })

    test("doesn't qualify when tied with the tenth entry time", async () => {
      const level = await createLevel()

      for (const elapsedMs of [1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
        await seedFinishedGame({ levelNumber: level.number, elapsedMs })

      const { gameId } = await startGame(level.number)
      await finishGame(gameId, level.id)

      // Board's tenth entry elapsed is 10
      await db.orm.public.Game.where({ id: gameId }).update({ elapsedMs: 10 })

      const res = await request(app).get(`/api/games/${gameId}`)

      expect(res.headers["content-type"]).toMatch(/json/)
      expect(res.status).toBe(200)
      expect(res.body).toMatchObject({
        finishedAt: expect.any(String),
        qualifiesForLeaderboard: false,
      })
    })

    test("get route returns qualifiesForLeaderboard true when faster than the tenth entry", async () => {
      const level = await createLevel()

      for (const index of Array.from({ length: 10 }, (_, index) => index))
        await seedFinishedGame({
          levelNumber: level.number,
          elapsedMs: 1_000_000 + index * 1_000,
        })

      const { gameId } = await startGame(level.number)
      await finishGame(gameId, level.id)

      const res = await request(app).get(`/api/games/${gameId}`)

      expect(res.headers["content-type"]).toMatch(/json/)
      expect(res.status).toBe(200)
      expect(res.body).toMatchObject({
        finishedAt: expect.any(String),
        qualifiesForLeaderboard: true,
      })
    })

    test("ignores finished games without a player name", async () => {
      const level = await createLevel()

      // Nine eligible entries and one unnamed
      for (const elapsedMs of [1, 2, 3, 4, 5, 6, 7, 8, 9])
        await seedFinishedGame({ levelNumber: level.number, elapsedMs })
      await seedFinishedGame({
        levelNumber: level.number,
        elapsedMs: 0,
        playerName: null,
      })

      const { gameId } = await startGame(level.number)

      const res = await finishGame(gameId, level.id)

      if (!res) return

      expect(res.body).toMatchObject({
        found: true,
        finished: true,
        qualifiesForLeaderboard: true,
      })
    })

    test("ignores unfinished games", async () => {
      const level = await createLevel()

      // Nine eligible entries and one unfinished
      for (const elapsedMs of [1, 2, 3, 4, 5, 6, 7, 8, 9])
        await seedFinishedGame({ levelNumber: level.number, elapsedMs })
      await seedFinishedGame({
        levelNumber: level.number,
        elapsedMs: 0,
        playerName: "Player",
        finishedAt: null,
      })

      const { gameId } = await startGame(level.number)

      const res = await finishGame(gameId, level.id)

      if (!res) return

      expect(res.body).toMatchObject({
        found: true,
        finished: true,
        qualifiesForLeaderboard: true,
      })
    })

    test("only counts entries on the same level", async () => {
      const level = await createLevel()

      const otherLevel = await db.orm.public.Level.create({
        number: 2,
        imagePath: "/images/levels/level2-scene.webp",
      })

      for (const index of Array.from({ length: 10 }, (_, index) => index))
        await seedFinishedGame({
          levelNumber: otherLevel.number,
          elapsedMs: index,
        })

      const { gameId } = await startGame(level.number)

      const res = await finishGame(gameId, level.id)

      if (!res) return

      expect(res.body).toMatchObject({
        found: true,
        finished: true,
        qualifiesForLeaderboard: true,
      })
    })
  })
})
