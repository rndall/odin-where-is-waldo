import { Router } from "express";

export const levelsRouter: Router = Router()

levelsRouter.get("/:levelNumber", (req, res) => {
  res.json({ levelNumber: req.params.levelNumber })
})

