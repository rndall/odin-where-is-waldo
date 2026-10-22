import { describe, expect, test } from "@jest/globals"
import request from "supertest"

import { app } from "../app"

describe("Images route", () => {
  test("serves an existing image", async () => {
    const res = await request(app).get("/images/levels/level1-scene.webp")

    expect(res.headers["content-type"]).toMatch(/^image\/webp/)
    expect(res.status).toBe(200)
  })

  test("returns 404 on missing image", async () => {
    const res = await request(app).get("/images/levels/level0-scene.webp")

    expect(res.headers["content-type"]).toMatch(/json/)
    expect(res.status).toBe(404)
    expect(res.body).toStrictEqual({ message: "Not Found" })
  })
})
