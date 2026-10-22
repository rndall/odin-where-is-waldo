import { afterAll, beforeEach, describe, expect, test } from "@jest/globals"
import { call } from "@orpc/server"
import { db } from "@workspace/db"

import { router } from "../router"
import { expectedLevel, resetDatabase, seedLevel } from "./testing"

beforeEach(async () => {
  await resetDatabase()
})

afterAll(async () => {
  await db.close()
})

describe("Levels", () => {
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
