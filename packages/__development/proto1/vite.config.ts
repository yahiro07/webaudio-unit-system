import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import solid from "vite-plugin-solid";

export default defineConfig({
  plugins: [
    react({
      include: [
        /src\/react\/.*\.tsx$/,
        /mylib\/mo-react\/.*\.tsx$/,
        /host-system\/react\/.*\.tsx$/,
      ],
    }),
    solid({
      include: [
        /src\/solid\/.*\.tsx$/,
        /mylib\/mo-solid\/.*\.tsx$/,
        /host-system\/solid\/.*\.tsx$/,
      ],
    }),
    tailwindcss(),
  ],
  resolve: { tsconfigPaths: true },
  appType: "mpa",
  build: {
    rollupOptions: {
      input: {
        root: "./index.html",
        // mu1: "./units/mu1.html",
        // mu2: "./units/mu2.html",
      },
    },
  },
  server: {
    port: 3004,
  },
});
