import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    allowedHosts: ["pyritic-juliane-introductory.ngrok-free.dev"],
    host: true,
    proxy: {
      "/api/hotel-proxy": {
        target: "https://hfus5c7uw2.execute-api.eu-west-1.amazonaws.com",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/hotel-proxy/, "/dev"),
      },
    },
  },
});