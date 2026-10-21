/* eslint-disable @typescript-eslint/no-explicit-any */

import type { Request, Response } from "express"
import { z, type ZodType } from "zod"

export const makeValidatedEndpoint =
  <TParams, TQuery>(
    { params, query }: { params?: ZodType<TParams>; query?: ZodType<TQuery> },
    cb: (
      req: Request<TParams, any, any, TQuery>,
      res: Response
    ) => Promise<void> | void
  ) =>
  (req: Request, res: Response) => {
    const paramsResult = params?.safeParse(req.params)
    const queryResult = query?.safeParse(req.query)

    const errors: Record<
      string,
      z.core.$ZodFlattenedError<TParams | TQuery>
    > = {}

    if (paramsResult && !paramsResult.success) {
      errors.params = z.flattenError(paramsResult.error)
    }

    if (queryResult && !queryResult.success) {
      errors.query = z.flattenError(queryResult.error)
    }

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        message: "Validation failed",
        errors,
      })
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    return cb(req as any, res)
  }
