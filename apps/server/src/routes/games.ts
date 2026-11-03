import { Router } from "express"
import {
  findCharacter,
  getGameById,
  setPlayerName,
  startGame,
} from "../controllers/games"

export const gamesRouter: Router = Router()

gamesRouter.post("/", startGame)
gamesRouter.get("/:gameId", getGameById)
gamesRouter.patch("/:gameId", setPlayerName)
gamesRouter.post("/:gameId/find", findCharacter)
