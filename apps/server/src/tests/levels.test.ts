import { afterAll, beforeEach, describe, expect, test } from "@jest/globals"

import request from "supertest"

import { db, resetDb } from "@workspace/db"
import { app } from "../app"
import { createLevel } from "../utils/levels"

describe("Level", () => {
  beforeEach(async () => {
    await resetDb()
  })

  afterAll(async () => {
    await db.close()
  })

  describe("list route", () => {
    test("returns no levels on empty database", async () => {
      const res = await request(app).get("/api/levels")

      expect(res.headers["content-type"]).toMatch(/json/)
      expect(res.status).toBe(200)
      expect(res.body).toStrictEqual([])
    })

    test("returns levels with targets mapped to their characters", async () => {
      await createLevel()

      const res = await request(app).get("/api/levels")

      expect(res.headers["content-type"]).toMatch(/json/)
      expect(res.status).toBe(200)
      expect(res.body).toStrictEqual([
        {
          id: 1,
          number: 1,
          imagePath: "/images/levels/level1-scene.webp",
          targets: [
            { id: 1, name: "waldo", imagePath: "/images/icons/waldo.png" },
            { id: 2, name: "odlaw", imagePath: "/images/icons/odlaw.png" },
            { id: 3, name: "wizard", imagePath: "/images/icons/wizard.webp" },
          ],
        },
      ])
    })
  })

  describe("leaderboard route", () => {
    const getLeaderboard = (levelNumber: number | string) =>
      request(app).get(`/api/levels/${levelNumber}/leaderboard`)

    const createFinishedGame = (
      levelId: number,
      elapsedMs: number,
      playerName: string
    ) =>
      db.orm.public.Game.create({
        levelId,
        finishedAt: new Date().toISOString(),
        elapsedMs,
        playerName,
      })

    test("returns empty leaderboard on level without games", async () => {
      const level = await createLevel()

      const res = await getLeaderboard(level.number)

      expect(res.headers["content-type"]).toMatch(/json/)
      expect(res.status).toBe(200)
      expect(res.body).toStrictEqual([])
    })

    test("returns 404 on missing level", async () => {
      const res = await getLeaderboard(1)

      expect(res.headers["content-type"]).toMatch(/json/)
      expect(res.status).toBe(404)
      expect(res.body).toStrictEqual({ message: "Level not found" })
    })

    test.each(["a", 0, -1, 1.5])(
      "returns 400 on invalid level number %s",
      async (levelNumber) => {
        const res = await getLeaderboard(levelNumber)

        expect(res.headers["content-type"]).toMatch(/json/)
        expect(res.status).toBe(400)
        expect(res.body).toMatchObject({
          message: "Validation failed",
          errors: {
            params: {
              fieldErrors: {
                levelNumber: [expect.any(String)],
              },
            },
          },
        })
      }
    )

    test("returns only leaderboard entries with player name and elapsed ms", async () => {
      const level = await createLevel()

      const playerName = "Player One"
      const elapsedMs = 12345
      const finishedAt = new Date().toISOString()
      await db.orm.public.Game.create({
        levelId: level.id,
        finishedAt,
        elapsedMs,
        playerName,
      })

      // Unfinished game (no finishedAt / elapsedMs)
      await db.orm.public.Game.create({ levelId: level.id })

      // Finished game without a player name
      await db.orm.public.Game.create({
        levelId: level.id,
        finishedAt: new Date().toISOString(),
        elapsedMs: 1000,
        playerName: null,
      })

      const res = await getLeaderboard(level.number)

      expect(res.headers["content-type"]).toMatch(/json/)
      expect(res.status).toBe(200)
      expect(res.body).toStrictEqual([
        {
          finishedAt: expect.any(String),
          playerName,
          elapsedMs,
        },
      ])
    })

    test("excludes games from other levels", async () => {
      const level1 = await createLevel()
      const level2 = await db.orm.public.Level.create({
        number: 2,
        imagePath: "/images/levels/level2-scene.webp",
      })

      await createFinishedGame(level1.id, 1000, "Player One")
      await createFinishedGame(level2.id, 500, "Player Two")

      const res = await getLeaderboard(level1.number)

      expect(res.headers["content-type"]).toMatch(/json/)
      expect(res.status).toBe(200)
      expect(res.body).toStrictEqual([
        {
          playerName: "Player One",
          elapsedMs: 1000,
          finishedAt: expect.any(String),
        },
      ])
    })

    test("returns entries sorted by elapsed time ascending", async () => {
      const level = await createLevel()

      await createFinishedGame(level.id, 3000, "Player Three")
      await createFinishedGame(level.id, 1000, "Player One")
      await createFinishedGame(level.id, 2000, "Player Two")

      const res = await getLeaderboard(level.number)

      expect(res.headers["content-type"]).toMatch(/json/)
      expect(res.status).toBe(200)
      expect(res.body).toStrictEqual([
        {
          playerName: "Player One",
          elapsedMs: 1000,
          finishedAt: expect.any(String),
        },
        {
          playerName: "Player Two",
          elapsedMs: 2000,
          finishedAt: expect.any(String),
        },
        {
          playerName: "Player Three",
          elapsedMs: 3000,
          finishedAt: expect.any(String),
        },
      ])
    })

    test("returns at most the 10 fastest entries", async () => {
      const level = await createLevel()

      const times = [
        11000, 10000, 20000, 4000, 5000, 12000, 1000, 16000, 2000, 15000, 3000,
      ]

      for (const elapsedMs of times) {
        await createFinishedGame(level.id, elapsedMs, `Player ${elapsedMs}`)
      }

      const res = await getLeaderboard(level.number)

      expect(res.headers["content-type"]).toMatch(/json/)
      expect(res.status).toBe(200)
      expect(res.body).toHaveLength(10)
      expect(res.body).toStrictEqual(
        times
          .toSorted((a, b) => a - b)
          .slice(0, 10)
          .map((elapsedMs) => ({
            playerName: `Player ${elapsedMs}`,
            elapsedMs,
            finishedAt: expect.any(String),
          }))
      )
    })
  })
})
