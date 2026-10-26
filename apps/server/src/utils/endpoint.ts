/* eslint-disable @typescript-eslint/no-explicit-any */

import type { Request, Response } from "express"
import { z, type ZodType } from "zod"

export const makeValidatedEndpoint =
  <TParams, TBody, TQuery>(
    {
      params,
      query,
      body,
    }: {
      params?: ZodType<TParams>
      query?: ZodType<TQuery>
      body?: ZodType<TBody>
    },
    cb: (
      req: Request<TParams, any, TBody, TQuery>,
      res: Response
    ) => Promise<void> | void
  ) =>
  (req: Request, res: Response) => {
    const paramsResult = params?.safeParse(req.params)
    const queryResult = query?.safeParse(req.query)
    const bodyResult = body?.safeParse(req.body)

    const errors: Record<
      string,
      z.core.$ZodFlattenedError<TParams | TBody | TQuery>
    > = {}

    if (paramsResult && !paramsResult.success) {
      errors.params = z.flattenError(paramsResult.error)
    }

    if (queryResult && !queryResult.success) {
      errors.query = z.flattenError(queryResult.error)
    }

    if (bodyResult && !bodyResult.success) {
      errors.body = z.flattenError(bodyResult.error)
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
