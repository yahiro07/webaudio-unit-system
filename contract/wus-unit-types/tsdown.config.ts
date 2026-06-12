import { defineConfig } from "tsdown";
export default defineConfig({
  platform: "browser",
  format: ["esm"],
  dts: true,
  clean: true,
  outDir: "dist",
  entry: {
    "v01/index": "src/v01/index.ts",
    "v02/index": "src/v02/index.ts",
    "unit-helper/index": "src/unit-helper/index.ts",
  },
});
