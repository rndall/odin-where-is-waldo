import { afterAll, beforeEach, describe, expect, test } from "@jest/globals"
import { db } from "@workspace/db"
import {
  expectedLevel,
  resetDatabase,
  seedLevel,
} from "@workspace/core-service/testing"
import request from "supertest"

import { app } from "../app"

beforeEach(async () => {
  await resetDatabase()
})

afterAll(async () => {
  await db.close()
})

describe("Levels", () => {
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
