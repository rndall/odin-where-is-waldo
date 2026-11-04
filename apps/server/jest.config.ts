import type { Config } from "jest"
import { createDefaultEsmPreset, type TsJestTransformerOptions } from "ts-jest"

const presetConfig = createDefaultEsmPreset({
  tsconfig: "tsconfig.spec.json",
} satisfies TsJestTransformerOptions)

export default {
  ...presetConfig,
} as Config
