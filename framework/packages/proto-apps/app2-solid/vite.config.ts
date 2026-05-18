import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import solid from "vite-plugin-solid";
import { unitLoaderPlugin } from "../vite-plugins";
import { unitSourceUrls } from "./src/unit-source-urls";

export default defineConfig({
  plugins: [solid(), tailwindcss(), unitLoaderPlugin({ unitSourceUrls })],
  appType: "mpa",
  resolve: { tsconfigPaths: true },
  server: { port: 3004 },
});
