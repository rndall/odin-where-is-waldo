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
})
