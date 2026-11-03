import { Router } from "express"

import { getLevels } from "../controllers/levels"

export const levelsRouter: Router = Router()

levelsRouter.get("/", getLevels)
