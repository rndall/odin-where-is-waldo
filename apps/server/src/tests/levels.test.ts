import { afterAll, beforeEach, describe, expect, test } from "@jest/globals"
import { call } from "@orpc/server"
import { db, LEVEL_CHARACTERS, LEVEL_TARGETS } from "@workspace/db"
import request from "supertest"

import { app } from "../app"
import { router } from "../orpc/router"

const getLevelFixture = () => {
  const level = LEVEL_TARGETS.find((level) => level.levelId === 1)

  if (!level) throw new Error("Missing level fixtures in LEVEL_TARGETS")

  return level
}

const LEVEL = getLevelFixture()

const expectedLevel = {
  id: 1,
  imagePath: "/images/levels/level1-scene.webp",
  number: 1,
  targets: [
    {
      id: 1,
      x: 53.02,
      y: 50.39,
      character: {
        id: 2,
        imagePath: "/images/icons/waldo.png",
        name: "waldo",
      },
    },
    {
      id: 2,
      x: 24.41,
      y: 50.65,
      character: {
        id: 1,
        imagePath: "/images/icons/odlaw.png",
        name: "odlaw",
      },
    },
    {
      id: 3,
      x: 62.59,
      y: 50.13,
      character: {
        id: 3,
        imagePath: "/images/icons/wizard.webp",
        name: "wizard",
      },
    },
  ],
}

const seedLevel = () =>
  db.transaction(async (tx) => {
    for (const character of LEVEL_CHARACTERS)
      await tx.orm.public.Character.create(character)

    const level = await tx.orm.public.Level.create({
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

    return level
  })

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

describe("Levels", () => {
  describe("route", () => {
    test("returns the correct level", async () => {
      const level = await seedLevel()

      const res = await request(app).get(`/rpc/levels/${level.number}`)

      expect(res.headers["content-type"]).toMatch(/json/)
      expect(res.status).toBe(200)
      expect(res.body).toStrictEqual({ level: expectedLevel })
    })

    test("returns 404 on missing level", async () => {
      const res = await request(app).get("/rpc/levels/1")

      expect(res.headers["content-type"]).toMatch(/json/)
      expect(res.status).toBe(404)
      expect(res.body).toStrictEqual({
        defined: true,
        code: "NOT_FOUND",
        message: "Level not found",
      })
    })

    describe("path params", () => {
      test.each(["a", "0", "-1", "1.5"])(
        "returns 400 on invalid param %s",
        async (param) => {
          const res = await request(app).get(`/rpc/levels/${param}`)

          expect(res.headers["content-type"]).toMatch(/json/)
          expect(res.status).toBe(400)
          expect(res.body).toMatchObject({
            code: "BAD_REQUEST",
            data: {
              issues: expect.arrayContaining([
                expect.objectContaining({
                  path: ["levelNumber"],
                  message: expect.any(String),
                }),
              ]),
            },
          })
        }
      )
    })
  })

  describe("procedure", () => {
    test("returns the correct level", async () => {
      const level = await seedLevel()

      await expect(
        call(router.level.find, {
          levelNumber: level.number,
        })
      ).resolves.toEqual({ level: expectedLevel })
    })

    test("throws NOT_FOUND on missing level", async () => {
      await expect(
        call(router.level.find, { levelNumber: 1 })
      ).rejects.toMatchObject({
        code: "NOT_FOUND",
        message: "Level not found",
      })
    })

    test("throws BAD_REQUEST on invalid input", async () => {
      await expect(
        call(router.level.find, { levelNumber: 0 })
      ).rejects.toMatchObject({
        code: "BAD_REQUEST",
      })
    })
  })
})
