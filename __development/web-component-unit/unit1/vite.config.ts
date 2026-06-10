import preact from "@preact/preset-vite";
import { resolve } from "path";
import { defineConfig } from "vite";
// import { analyzer } from "vite-bundle-analyzer";

export default defineConfig({
  plugins: [
    preact(),
    //analyzer()
  ],
  resolve: {
    alias: {
      react: "preact/compat",
      "react-dom": "preact/compat",
      "react/jsx-runtime": "preact/jsx-runtime",
    },
  },
  build: {
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      formats: ["es"],
      fileName: "index",
    },
    outDir: resolve(__dirname, "../app/public/unit1"),
  },
});
