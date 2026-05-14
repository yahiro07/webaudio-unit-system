import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  base: "./",
  plugins: [react(), tailwindcss()],
  resolve: { tsconfigPaths: true },
  build: { outDir: "../dist/mu4-keyboard", emptyOutDir: true },
});
