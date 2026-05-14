import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  appType: "mpa",
  resolve: { tsconfigPaths: true },
  server: {
    port: 3004,
  },
});
