import { Router } from "express"

import { getLevelLeaderboard, getLevels } from "../controllers/levels"

export const levelsRouter: Router = Router()

levelsRouter.get("/", getLevels)
levelsRouter.get("/:levelNumber/leaderboard", getLevelLeaderboard)
