import { Router } from "express"
import { findCharacter, getGameById, startGame } from "../controllers/games"

export const gamesRouter: Router = Router()

gamesRouter.post("/", startGame)
gamesRouter.get("/:gameId", getGameById)
gamesRouter.post("/:gameId/find", findCharacter)
