import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { unitsSummaryPlugin } from "../vite-plugins";

export default defineConfig({
  plugins: [react(), tailwindcss(), unitsSummaryPlugin()],
  appType: "mpa",
  resolve: { tsconfigPaths: true },
  server: { port: 3004 },
});
