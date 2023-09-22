import { defineConfig } from "vite";
import basicSsl from "@vitejs/plugin-basic-ssl";
import { visualizer } from "rollup-plugin-visualizer";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [basicSsl, visualizer()],
  server: {
    https: true,
    proxy: {
      "/api": {
        target: "https://localhost:8443",
        secure: false,
      },
    },
  },
  build: {
    sourcemap: true,
  },
});
