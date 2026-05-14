import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import solid from "vite-plugin-solid";
import { viteStaticCopy } from "vite-plugin-static-copy";

export default defineConfig({
  base: "./",
  plugins: [
    solid(),
    tailwindcss(),
    viteStaticCopy({ targets: [{ src: "unit-meta.json", dest: "./" }] }),
  ],
  resolve: { tsconfigPaths: true },
  build: { outDir: "../dist/mu5-visualizer", emptyOutDir: true },
});
