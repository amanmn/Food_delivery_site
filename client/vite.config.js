import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import fs from "fs";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    https: {
      key: fs.readFileSync("./localhost+1-key.pem"),
      cert: fs.readFileSync("./localhost+1.pem"),
    },
    host: "localhost",
    port: 5173,

    // 🔥 PROXY MUST BE HERE
    proxy: {
      "/api": {
        target: "http://13.200.251.6:8000",
        changeOrigin: true,
        secure: false,
      },
    },
  },
  base: "/",
});
