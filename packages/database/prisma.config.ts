import { definePrismaConfig } from "@prisma/cli-engine"
import { defineConfig as ormConfig } from "@prisma/orm-postgres/config"
import { getConnectionString } from "./src/prisma/connection"

export default definePrismaConfig({
  orm: ormConfig({
    contract: "./src/prisma/contract.prisma",
    db: { connection: getConnectionString() },
  }),
})
