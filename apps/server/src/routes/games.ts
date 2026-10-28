import { Router } from "express"
import { findCharacter, startGame } from "../controllers/games"

export const gamesRouter: Router = Router()

gamesRouter.post("/", startGame)
gamesRouter.post("/:gameId/find", findCharacter)
