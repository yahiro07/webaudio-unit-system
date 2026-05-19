import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import solid from "vite-plugin-solid";
import { unitLoaderPlugin } from "../vite-plugins";
import { unitSourceUrls_array } from "./src/unit-source-urls";

export default defineConfig({
  plugins: [
    solid(),
    tailwindcss(),
    unitLoaderPlugin({
      unitSourceUrls: unitSourceUrls_array,
      cacheFolderPath: "./.wus-unit-cache",
    }),
  ],
  appType: "mpa",
  resolve: { tsconfigPaths: true },
  server: { port: 3004 },
});
