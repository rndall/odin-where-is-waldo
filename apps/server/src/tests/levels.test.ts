import { afterAll, beforeEach, describe, expect, test } from "@jest/globals"
import request from "supertest"

import { db } from "@workspace/db"
import { app } from "../app"
import { createLevel } from "../utils/levels"
import { resetDb } from "../utils/tests"

describe("Level", () => {
  beforeEach(async () => {
    await resetDb()
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
})
