import type { Config } from "jest"
import { createDefaultEsmPreset } from "ts-jest"

const presetConfig = createDefaultEsmPreset({
  tsconfig: "<rootDir>/tsconfig.spec.json",
})

export default {
  ...presetConfig,
} as Config
