import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

/** Must stay in sync with `src/config/publicEnv.ts` default for `VITE_HOTEL_API_BASE`. */
const DEFAULT_HOTEL_API_BASE =
  "https://9sk9buwtq8.execute-api.eu-west-1.amazonaws.com/qa";

function hotelProxyFromBase(raw: string | undefined): {
  target: string;
  pathPrefix: string;
} {
  const base = (raw?.trim() || DEFAULT_HOTEL_API_BASE).replace(/\/$/, "");
  try {
    const u = new URL(base);
    let pathPrefix = u.pathname.replace(/\/$/, "");
    if (!pathPrefix) pathPrefix = "/qa";
    return { target: u.origin, pathPrefix };
  } catch {
    const u = new URL(DEFAULT_HOTEL_API_BASE);
    return {
      target: u.origin,
      pathPrefix: u.pathname.replace(/\/$/, "") || "/qa",
    };
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const { target, pathPrefix } = hotelProxyFromBase(env.VITE_HOTEL_API_BASE);

  return {
    plugins: [react(), tailwindcss()],
    server: {
      allowedHosts: [
        "spectroheliographic-mariko-subterrestrial.ngrok-free.dev",
      ],
      host: true,
      proxy: {
        // Same path the axios dev interceptor uses (`src/services/axios.ts`).
        "/api/hotel-proxy": {
          target,
          changeOrigin: true,
          rewrite: (path) =>
            path.replace(/^\/api\/hotel-proxy/, pathPrefix || ""),
        },
      },
    },
  };
});
