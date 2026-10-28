import express, {
  type Express,
  type NextFunction,
  type Request,
  type Response,
  Router,
} from "express"
import createError from "http-errors"
import { join } from "node:path"

import { gamesRouter } from "./routes/games"
import { levelsRouter } from "./routes/levels"

const app: Express = express()

app.use(express.json())

app.use(
  "/images",
  express.static(join(import.meta.dirname, "../public/images"))
)

const apiRouter = Router()
apiRouter.use("/games", gamesRouter)
apiRouter.use("/levels", levelsRouter)

app.use("/api", apiRouter)

app.use((_req, _res, next) => {
  next(createError(404))
})

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err)

  const isHttpError = createError.isHttpError(err)

  const status = isHttpError ? err.status : 500
  const message =
    isHttpError && err.expose ? err.message : "Internal Server Error"

  return res.status(status).json({ message })
})

export { app }
