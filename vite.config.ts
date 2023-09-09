import { defineConfig } from "vite";
import basicSsl from "@vitejs/plugin-basic-ssl";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [basicSsl()],
  server: {
    https: true,
    proxy: {
      "/api": {
        target: "https://localhost:8443",
        secure: false,
      },
    },
  },
});
