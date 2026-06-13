import { defineConfig } from "tsdown";
export default defineConfig({
  platform: "browser",
  format: ["esm"],
  dts: true,
  clean: true,
  outDir: "dist",
  entry: {
    "host/index": "src/host/index.ts",
    "react/index": "src/react/index.ts",
  },
});
