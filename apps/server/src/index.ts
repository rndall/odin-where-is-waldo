import express, { Router } from "express"
import { join} from "node:path"

import { levelsRouter } from "./routes/levels"

const app = express()

const PORT = process.env.PORT || 3000

app.use(
  "/images",
  express.static(join(import.meta.dirname, "../public/images"))
)

const apiRouter = Router()
apiRouter.use('/levels', levelsRouter)

app.use("/api", apiRouter)

app.listen(PORT, () => {
  console.log("Listening on port", PORT)
})
