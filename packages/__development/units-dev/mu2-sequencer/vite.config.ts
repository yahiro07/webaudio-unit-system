import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import solid from "vite-plugin-solid";

export default defineConfig({
  base: "./",
  plugins: [solid(), tailwindcss()],
  resolve: { tsconfigPaths: true },
  build: { outDir: "../dist/mu2-sequencer", emptyOutDir: true },
});
