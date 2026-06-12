import { defineConfig } from "tsdown";
export default defineConfig({
  platform: "browser",
  format: ["esm"],
  dts: true,
  clean: true,
  outDir: "dist",
  entry: {
    index: "src/index.ts",
    "unit-helper/index": "src/unit-helper/index.ts",
  },
});
