import type { Config } from "jest"
import { createDefaultEsmPreset, type TsJestTransformerOptions } from "ts-jest"

const presetConfig = createDefaultEsmPreset({
  tsconfig: "<rootDir>/tsconfig.spec.json",
} satisfies TsJestTransformerOptions)

export default {
  testEnvironment: "node",
  ...presetConfig,
} as Config
