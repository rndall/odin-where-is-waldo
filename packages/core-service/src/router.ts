import { levelRouter } from "./levels"

export const router = {
  level: levelRouter,
}

export type AppRouter = typeof router
