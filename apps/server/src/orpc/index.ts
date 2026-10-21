import { OpenAPIGenerator } from "@orpc/openapi"
import { OpenAPIHandler } from "@orpc/openapi/node"
import { OpenAPIReferenceHandlerPlugin } from "@orpc/openapi/plugins"
import { onError } from "@orpc/server"
import { ZodToJsonSchemaConverter } from "@orpc/zod"

import { router } from "./router"

export const generator = new OpenAPIGenerator({
  converters: [new ZodToJsonSchemaConverter()],
})

export const handler = new OpenAPIHandler(router, {
  interceptors: [
    onError((error) => {
      console.error(error)
    }),
  ],
  plugins: [
    new OpenAPIReferenceHandlerPlugin({
      spec: () =>
        generator.generate(router, {
          base: {
            info: {
              title: "Odin Where's Waldo",
              version: "1.0.0",
            },
            servers: [{ url: "/rpc" }],
          },
        }),
    }),
  ],
})
