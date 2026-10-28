import { afterAll, beforeEach, describe, expect, test } from "@jest/globals"
import { db, LEVEL_CHARACTERS, LEVEL_TARGETS } from "@workspace/db"
import request from "supertest"

import { app } from "../app"

const LEVEL = LEVEL_TARGETS.find((level) => level.levelId === 1)

if (!LEVEL) throw new Error("Missing level fixtures in LEVEL_TARGETS")

const createLevel = () =>
  db.transaction(async (tx) => {
    for (const character of LEVEL_CHARACTERS)
      await tx.orm.public.Character.create(character)

    const created = await tx.orm.public.Level.create({
      id: LEVEL.levelId,
      number: LEVEL.levelId,
      imagePath: "/images/levels/level1-scene.webp",
    })

    for (const target of LEVEL.targets)
      await tx.orm.public.Target.create({
        levelId: LEVEL.levelId,
        ...target,
      })

    return created
  })

describe("Level", () => {
  beforeEach(async () => {
    await db.transaction(async (tx) => {
      await tx.orm.public.Target.where({}).deleteAll()
      await tx.orm.public.Character.where({}).deleteAll()
      await tx.orm.public.Level.where({}).deleteAll()
    })
  })

  afterAll(async () => {
    await db.close()
  })

  describe("route", () => {
    test("returns the correct level", async () => {
      const level = await createLevel()

      const res = await request(app).get(`/api/levels/${level.number}`)

      expect(res.headers["content-type"]).toMatch(/json/)
      expect(res.status).toBe(200)
      expect(res.body).toStrictEqual({
        id: 1,
        imagePath: "/images/levels/level1-scene.webp",
        number: 1,
        characters: [
          {
            id: 1,
            imagePath: "/images/icons/odlaw.png",
            name: "odlaw",
          },
          {
            id: 2,
            imagePath: "/images/icons/waldo.png",
            name: "waldo",
          },
          {
            id: 3,
            imagePath: "/images/icons/wizard.webp",
            name: "wizard",
          },
        ],
      })
    })

    test("returns 404 on missing level", async () => {
      const res = await request(app).get("/api/levels/1")

      expect(res.headers["content-type"]).toMatch(/json/)
      expect(res.status).toBe(404)
      expect(res.body).toStrictEqual({ message: "Level not found" })
    })

    describe("path params", () => {
      test.each(["a", "0", "-1", "1.5"])(
        "returns 400 on invalid param %s",
        async (param) => {
          const res = await request(app).get(`/api/levels/${param}`)

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
    })
  })

  describe("validate find route", () => {
    test("returns found on correct target", async () => {
      const level = await createLevel()

      const res = await request(app)
        .post(`/api/levels/${level.number}/find`)
        .send({ characterId: 2, x: 53.02, y: 50.39 })
        .set("Accept", "application/json")

      expect(res.headers["content-type"]).toMatch(/json/)
      expect(res.status).toBe(200)
      expect(res.body).toStrictEqual({
        message: "You found Waldo",
        found: true,
      })
    })

    test("returns not found on incorrect target", async () => {
      const level = await createLevel()

      const res = await request(app)
        .post(`/api/levels/${level.number}/find`)
        .send({ characterId: 1, x: 53.02, y: 50.39 })
        .set("Accept", "application/json")

      expect(res.headers["content-type"]).toMatch(/json/)
      expect(res.status).toBe(200)
      expect(res.body).toStrictEqual({
        message: "You didn't find anyone",
        found: false,
      })
    })

    test("returns 404 on missing level", async () => {
      const res = await request(app)
        .post("/api/levels/1/find")
        .send({ characterId: 2, x: 53.02, y: 50.39 })
        .set("Accept", "application/json")

      expect(res.headers["content-type"]).toMatch(/json/)
      expect(res.status).toBe(404)
      expect(res.body).toStrictEqual({ message: "Level not found" })
    })

    test("returns 400 when character is not in this level", async () => {
      const level = await createLevel()

      // Character id 4 exists in no fixture level
      const res = await request(app)
        .post(`/api/levels/${level.number}/find`)
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

      // Target is at x 53.02, allowance is 4, so 57.02 is exactly at the edge
      const res = await request(app)
        .post(`/api/levels/${level.number}/find`)
        .send({ characterId: 2, x: 57.02, y: 50.39 })
        .set("Accept", "application/json")

      expect(res.headers["content-type"]).toMatch(/json/)
      expect(res.status).toBe(200)
      expect(res.body).toStrictEqual({
        message: "You found Waldo",
        found: true,
      })
    })

    test("returns not found when a guess exceeds the allowance", async () => {
      const level = await createLevel()

      // |57.03 - 53.02| = 4.01 exceeds the allowance of 4
      const res = await request(app)
        .post(`/api/levels/${level.number}/find`)
        .send({ characterId: 2, x: 57.03, y: 50.39 })
        .set("Accept", "application/json")

      expect(res.headers["content-type"]).toMatch(/json/)
      expect(res.status).toBe(200)
      expect(res.body).toStrictEqual({
        message: "You didn't find anyone",
        found: false,
      })
    })

    test("returns not found when x or y alone exceeds the allowance", async () => {
      const level = await createLevel()

      const res = await request(app)
        .post(`/api/levels/${level.number}/find`)
        .send({ characterId: 2, x: 53.02, y: 54.4 })
        .set("Accept", "application/json")

      expect(res.headers["content-type"]).toMatch(/json/)
      expect(res.status).toBe(200)
      expect(res.body).toStrictEqual({
        message: "You didn't find anyone",
        found: false,
      })
    })

    describe("body", () => {
      test("returns 400 on missing fields", async () => {
        const level = await createLevel()

        const res = await request(app)
          .post(`/api/levels/${level.number}/find`)
          .send({})
          .set("Accept", "application/json")

        expect(res.headers["content-type"]).toMatch(/json/)
        expect(res.status).toBe(400)
        expect(res.body).toMatchObject({
          message: "Validation failed",
          errors: {
            body: {
              fieldErrors: {
                characterId: [expect.any(String)],
                x: [expect.any(String)],
                y: [expect.any(String)],
              },
            },
          },
        })
      })

      test.each([
        { characterId: 0 },
        { characterId: 1.5 },
        { characterId: "a" },
        { x: -1 },
        { x: "a" },
        { y: -1 },
        { y: "a" },
      ])("returns 400 on invalid body %o", async (invalid) => {
        const level = await createLevel()

        const res = await request(app)
          .post(`/api/levels/${level.number}/find`)
          .send({
            characterId: 2,
            x: 53.02,
            y: 50.39,
            ...invalid,
          })
          .set("Accept", "application/json")

        expect(res.headers["content-type"]).toMatch(/json/)
        expect(res.status).toBe(400)
        expect(res.body).toMatchObject({
          message: "Validation failed",
          errors: {
            body: {
              fieldErrors: expect.any(Object),
            },
          },
        })
      })
    })

    describe("path params", () => {
      test.each(["a", "0", "-1", "1.5"])(
        "returns 400 on invalid param %s",
        async (param) => {
          const res = await request(app)
            .post(`/api/levels/${param}/find`)
            .send({ characterId: 2, x: 53.02, y: 50.39 })
            .set("Accept", "application/json")

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
    })
  })
})
