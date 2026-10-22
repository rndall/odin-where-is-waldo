import { afterAll, beforeEach, describe, expect, test } from "@jest/globals"
import { db, LEVEL_CHARACTERS, LEVEL_TARGETS } from "@workspace/db"
import request from "supertest"

import { app } from "../app"

const LEVEL = LEVEL_TARGETS.find((level) => level.levelId === 1)

if (!LEVEL) throw new Error("Missing level fixtures in LEVEL_TARGETS")

describe("Level", () => {
  beforeEach(async () => {
    await db.transaction(async (tx) => {
      await tx.orm.public.Target.where({}).deleteAll()
      await Promise.all([
        tx.orm.public.Character.where({}).deleteAll(),
        tx.orm.public.Level.where({}).deleteAll(),
      ])
    })
  })

  afterAll(async () => {
    await db.close()
  })

  describe("find route", () => {
    test("returns the correct level", async () => {
      const level = await db.transaction(async (tx) => {
        for (const character of LEVEL_CHARACTERS)
          await tx.orm.public.Character.create(character)

        const created = await tx.orm.public.Level.create({
          id: LEVEL.levelId,
          number: LEVEL.levelId,
          imagePath: "/images/levels/level1-scene.webp",
        })

        for (const [index, target] of LEVEL.targets.entries())
          await tx.orm.public.Target.create({
            id: index + 1,
            levelId: LEVEL.levelId,
            ...target,
          })

        return created
      })

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
})
