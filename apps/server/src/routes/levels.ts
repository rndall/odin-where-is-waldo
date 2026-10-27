import { Router } from "express"

import { findCharacter, getLevelByLevelNumber } from "../controllers/levels"

export const levelsRouter: Router = Router()

levelsRouter.get("/:levelNumber", getLevelByLevelNumber)

levelsRouter.post("/:levelNumber/find", findCharacter)
