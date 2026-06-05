import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { viteStaticCopy } from "vite-plugin-static-copy";

export default defineConfig({
  base: "./",
  plugins: [
    react(),
    tailwindcss(),
    viteStaticCopy({ targets: [{ src: "unit-meta.json", dest: "./" }] }),
  ],
  resolve: { tsconfigPaths: true },
  build: { outDir: "../../dist/mu1-instrument", emptyOutDir: true },
});
