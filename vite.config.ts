import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import {
  activitiesSigV4ProxyPlugin,
  parseActivitiesTargetFromEnv,
} from "./vite/activitiesSigV4Proxy";
import { mergeActivitiesProxyProcessEnv } from "./vite/mergeActivitiesProxyEnv";

/**
 * Used only when `VITE_HOTEL_API_BASE` is unset (should not happen if `.env.development` exists).
 * Must not default to QA — local dev should not proxy to QA backends by accident.
 */
const DEFAULT_HOTEL_API_BASE =
  "https://hfus5c7uw2.execute-api.eu-west-1.amazonaws.com/dev";

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
  mergeActivitiesProxyProcessEnv(env);

  const { target, pathPrefix } = hotelProxyFromBase(env.VITE_HOTEL_API_BASE);
  const activitiesTarget = parseActivitiesTargetFromEnv(
    env.VITE_ACTIVITIES_API_BASE || "",
  );

  const mainApiRaw =
    env.VITE_API_BASE?.trim() ||
    "https://ie7eaxnxpg.execute-api.eu-west-1.amazonaws.com/dev";
  let mainApiProxyTarget: string;
  let mainApiProxyStagePath: string;
  try {
    const u = new URL(mainApiRaw);
    mainApiProxyTarget = u.origin;
    mainApiProxyStagePath = u.pathname.replace(/\/$/, "") || "/dev";
  } catch {
    mainApiProxyTarget =
      "https://ie7eaxnxpg.execute-api.eu-west-1.amazonaws.com";
    mainApiProxyStagePath = "/dev";
  }

  return {
    plugins: [
      /**
       * Activities execute-api is IAM-only; JWT Bearer breaks SigV4 parsing.
       * In dev, this re-signs `/api/activities-proxy/*` with local AWS credentials.
       */
      activitiesSigV4ProxyPlugin(activitiesTarget),
      react(),
      tailwindcss(),
    ],
    server: {
      allowedHosts: [
        "gloomily-tranquil-release.ngrok-free.dev",
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
        /** Used for `POST /myActivityBooking` when routed to flight API in dev (see `axios.ts`). */
        "/api/flight-proxy": {
          target: "https://y0v4qcjjo5.execute-api.eu-west-1.amazonaws.com",
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/flight-proxy/, "/dev2"),
        },
        /**
         * Main app API (`VITE_API_BASE`, e.g. …/dev). Same-origin in dev so routes like
         * POST /myActivityBooking are not blocked by API Gateway CORS from localhost.
         */
        "/api/app-proxy": {
          target: mainApiProxyTarget,
          changeOrigin: true,
          configure: (proxy) => {
            proxy.on("proxyReq", (proxyReq) => {
              proxyReq.setHeader("origin", mainApiProxyTarget);
            });
          },
          rewrite: (path) =>
            path.replace(/^\/api\/app-proxy/, mainApiProxyStagePath),
        },
      },
    },
  };
});
