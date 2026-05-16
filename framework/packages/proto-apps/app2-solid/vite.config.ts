import tailwindcss from "@tailwindcss/vite";
import { unitsSummaryPlugin } from "@wus/host-system/vite-plugins";
import { defineConfig } from "vite";
import solid from "vite-plugin-solid";

export default defineConfig({
  plugins: [
    solid(),
    tailwindcss(),
    unitsSummaryPlugin({ output: "src/units-summary.json" }),
  ],
  appType: "mpa",
  resolve: { tsconfigPaths: true },
  server: {
    port: 3004,
  },
});
