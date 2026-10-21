import express, {
  type Express,
  type NextFunction,
  type Request,
  type Response,
} from "express"
import createError from "http-errors"
import { join } from "node:path"

import { handler } from "./orpc"

const app: Express = express()

app.use(
  "/images",
  express.static(join(import.meta.dirname, "../public/images"))
)

app.use("/rpc{/*path}", async (req, res, next) => {
  const { matched } = await handler.handle(req, res, {
    prefix: "/rpc",
    context: {},
  })

  if (matched) {
    return
  }

  next()
})

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
