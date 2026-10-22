import { ApiErrorSchema } from "@workspace/shared"
import type { ZodType } from "zod"

export class ApiError extends Error {
  readonly status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = "ApiError"
    this.status = status
  }
}

export const apiUrl = (path: string) =>
  `${import.meta.env.VITE_API_BASE_URL}${path}`

export const parseJson = async <T>(
  res: Response,
  schema: ZodType<T>
): Promise<T> => {
  if (!res.ok) {
    const body = ApiErrorSchema.safeParse(await res.json().catch(() => null))
    throw new ApiError(
      body.success
        ? body.data.message
        : `Request failed with status ${res.status}`,
      res.status
    )
  }

  const text = await res.text()
  let data: unknown
  try {
    data = text ? JSON.parse(text) : undefined
  } catch {
    throw new ApiError("Invalid response from server", res.status)
  }

  const result = schema.safeParse(data)
  if (!result.success) {
    console.error(result.error)
    throw new ApiError("Invalid response from server", res.status)
  }

  return result.data
}
