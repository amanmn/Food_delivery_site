import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import fs from "fs";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());
  return {
    plugins: [react(), tailwindcss()],
    server: {
      // https: {
      //   key: fs.readFileSync("./localhost+1-key.pem"),
      //   cert: fs.readFileSync("./localhost+1.pem"),
      // },
      https: false,
      host: "localhost",
      port: 5173,

      // 🔥 PROXY MUST BE HERE
      proxy: {
        "/api": {
          // target: "https://fooddeliveryhub.duckdns.org",
          target: env.VITE_SERVERURL,
          changeOrigin: true,
          secure: false,
        },
      },
    },
    base: "/",
  };
});
