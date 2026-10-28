import { afterAll, beforeEach, describe, expect, test } from "@jest/globals"

import request from "supertest"

import { db } from "@workspace/db"
import { StartGameReturnSchema } from "@workspace/shared"
import { app } from "../app"
import { createLevel } from "../utils/levels"
import { resetDb } from "../utils/tests"

describe("Game", () => {
  beforeEach(async () => {
    await resetDb()
  })

  afterAll(async () => {
    await db.close()
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

  describe("find route", () => {
    const startGame = async (levelNumber: number) => {
      const res = await request(app)
        .post("/api/games")
        .send({ levelNumber })
        .set("Accept", "application/json")

      expect(res.status).toBe(201)

      return StartGameReturnSchema.parse(res.body)
    }

    test("returns found on correct target", async () => {
      const level = await createLevel()
      const { gameId } = await startGame(level.number)

      const res = await request(app)
        .post(`/api/games/${gameId}/find`)
        .send({ characterId: 2, x: 53.02, y: 50.39 })
        .set("Accept", "application/json")

      expect(res.headers["content-type"]).toMatch(/json/)
      expect(res.status).toBe(200)
      expect(res.body).toStrictEqual({
        message: "You found Waldo",
        found: true,
        finished: false,
      })
    })

    test("returns not found on incorrect target", async () => {
      const level = await createLevel()
      const { gameId } = await startGame(level.number)

      const res = await request(app)
        .post(`/api/games/${gameId}/find`)
        .send({ characterId: 1, x: 53.02, y: 50.39 })
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
        .post("/api/games/3f2504e0-4f89-41d3-9a0c-0305e82c3301/find")
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
        .send({ characterId: 2, x: 57.02, y: 50.39 })
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
        .send({ characterId: 2, x: 57.03, y: 50.39 })
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
        .send({ characterId: 2, x: 53.02, y: 54.4 })
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
          .send({ characterId: 2, x: 53.02, y: 50.39 })
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

        expect(res.status).toBe(200)
        expect(res.body).toMatchObject({
          found: true,
          finished: index === targets.length - 1,
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
})
