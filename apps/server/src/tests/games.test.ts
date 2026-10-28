import { afterAll, beforeEach, describe, expect, test } from "@jest/globals"

import request from "supertest"

import { app } from "../app"
import { db } from "@workspace/db"
import { StartGameSchema } from "@workspace/shared"

describe("Game", () => {
  beforeEach(async () => {
    await db.transaction(async (tx) => {
      await tx.orm.public.FoundCharacter.where({}).deleteAll()
      await tx.orm.public.Game.where({}).deleteAll()
      await tx.orm.public.Target.where({}).deleteAll()
      await tx.orm.public.Character.where({}).deleteAll()
      await tx.orm.public.Level.where({}).deleteAll()
    })
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

      const { gameId } = StartGameSchema.parse(res.body)
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
})
