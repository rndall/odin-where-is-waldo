import type { Config } from "jest"
import { createDefaultEsmPreset, type TsJestTransformerOptions } from "ts-jest"

const presetConfig = createDefaultEsmPreset({
  tsconfig: "tsconfig.spec.json",
} satisfies TsJestTransformerOptions)

export default {
  ...presetConfig,
  // Tests share one database, so they must not run concurrently.
  maxWorkers: 1,
} as Config
