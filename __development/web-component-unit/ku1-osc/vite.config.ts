import preact from "@preact/preset-vite";
// import { analyzer } from "vite-bundle-analyzer";
import tailwind from "@tailwindcss/vite";
import { resolve } from "path";
import { defineConfig } from "vite";

export default defineConfig({
  define: {
    "process.env.NODE_ENV": JSON.stringify("production"),
  },
  plugins: [
    preact(),
    //analyzer()
    tailwind(),
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
    emptyOutDir: true,
  },
});
