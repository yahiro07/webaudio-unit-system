import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { viteStaticCopy } from "vite-plugin-static-copy";

const outDir = process.env.WUS_OUT_DIR;

export default defineConfig({
  base: "./",
  plugins: [
    react(),
    tailwindcss(),
    viteStaticCopy({ targets: [{ src: "unit-meta.json", dest: "./" }] }),
  ],
  resolve: { tsconfigPaths: true, dedupe: ["react", "react-dom"] },
  build: outDir ? { outDir, emptyOutDir: true } : undefined,
});
