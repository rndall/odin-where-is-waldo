import { Router } from "express"

import { getLevelByLevelNumber } from "../controllers/levels"

export const levelsRouter: Router = Router()

levelsRouter.get("/:levelNumber", getLevelByLevelNumber)
