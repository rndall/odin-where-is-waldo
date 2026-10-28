import { Router } from "express"
import { startGame } from "../controllers/games"

export const gamesRouter: Router = Router()

gamesRouter.post("/", startGame)
