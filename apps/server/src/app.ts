import express, { type Express, Router } from "express"
import { join } from "node:path"

import { levelsRouter } from "./routes/levels"

const app: Express = express()

app.use(
  "/images",
  express.static(join(import.meta.dirname, "../public/images"))
)

const apiRouter = Router()
apiRouter.use("/levels", levelsRouter)

app.use("/api", apiRouter)

export { app }
