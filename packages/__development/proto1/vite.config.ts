import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import solid from "vite-plugin-solid";

export default defineConfig({
  plugins: [
    react({
      include: [
        /src\/root\/.*\.tsx$/,
        /src\/.*-react\.tsx$/,
      ],
    }),
    solid({
      include: [/src\/.*-solid\.tsx$/],
    }),
    tailwindcss(),
  ],
  resolve: { tsconfigPaths: true },
  appType: "mpa",
  build: {
    rollupOptions: {
      input: {
        root: "./index.html",
        mu1: "./units/mu1.html",
        mu2: "./units/mu2.html",
      },
    },
  },
  server: {
    port: 3004,
  },
});
