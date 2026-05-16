import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { unitsSummaryPlugin } from "@wus/host-system/vite-plugins";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react(), tailwindcss(), unitsSummaryPlugin()],
  appType: "mpa",
  resolve: { tsconfigPaths: true },
  server: {
    port: 3004,
  },
});
