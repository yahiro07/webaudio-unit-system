import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import solid from "vite-plugin-solid";

export default defineConfig({
  plugins: [
    solid(),
    tailwindcss(),
    // unitsSummaryPlugin({ output: "src/units-summary.json" }),
  ],
  appType: "mpa",
  resolve: { tsconfigPaths: true },
  server: { port: 3004 },
});
