import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import solid from "vite-plugin-solid";
import { viteStaticCopy } from "vite-plugin-static-copy";

const outDir = process.env.WUS_OUT_DIR;

export default defineConfig({
  base: "./",
  plugins: [
    solid(),
    tailwindcss(),
    viteStaticCopy({ targets: [{ src: "unit-meta.json", dest: "./" }] }),
  ],
  resolve: { tsconfigPaths: true },
  build: outDir ? { outDir, emptyOutDir: true } : undefined,
});
