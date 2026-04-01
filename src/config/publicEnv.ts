/**
 * Non-secret API URLs from Vite env (VITE_*).
 * Defaults preserve previous hardcoded values so local dev works without a full .env.
 */
function envUrl(key: string, fallback: string): string {
  const raw = import.meta.env[key as keyof ImportMetaEnv];
  if (typeof raw === "string" && raw.trim() !== "") {
    return raw.trim().replace(/\/$/, "");
  }
  return fallback.replace(/\/$/, "");
}

function firstEnv(keys: string[], fallback: string): string {
  for (const key of keys) {
    const raw = import.meta.env[key as keyof ImportMetaEnv];
    if (typeof raw === "string" && raw.trim() !== "") {
      return raw.trim().replace(/\/$/, "");
    }
  }
  return fallback.replace(/\/$/, "");
}

/** Main axios default base (paths not routed to another host). */
export const VITE_API_BASE = /* @__PURE__ */ envUrl(
  "VITE_API_BASE",
  "https://ie7eaxnxpg.execute-api.eu-west-1.amazonaws.com/dev",
);

/** Flight search / booking API Gateway base. */
export const VITE_FLIGHT_API_BASE = /* @__PURE__ */ envUrl(
  "VITE_FLIGHT_API_BASE",
  "https://le9ey3bd4m.execute-api.eu-west-1.amazonaws.com/qa",
);

/** Payment (PayFort proxy, etc.) API Gateway base. */
export const VITE_PAYMENT_API_BASE = /* @__PURE__ */ envUrl(
  "VITE_PAYMENT_API_BASE",
  "https://tfv8l0ppad.execute-api.eu-west-1.amazonaws.com/qa",
);

/** Flight ancillary API Gateway base. */
export const VITE_FLIGHT_ANCILLARY_API_BASE = /* @__PURE__ */ envUrl(
  "VITE_FLIGHT_ANCILLARY_API_BASE",
  "https://3ws94glls6.execute-api.eu-west-1.amazonaws.com/qa",
);

/** Hotel API Gateway base. */
export const VITE_HOTEL_API_BASE = /* @__PURE__ */ envUrl(
  "VITE_HOTEL_API_BASE",
  "https://9sk9buwtq8.execute-api.eu-west-1.amazonaws.com/qa",
);

/** Countries / cities listing (countriesnow.space). */
export const VITE_LOCATION_API_BASE = /* @__PURE__ */ envUrl(
  "VITE_LOCATION_API_BASE",
  "https://countriesnow.space/api/v0.1",
);

/** Ticket upload / retrieval API Gateway base. */
export const VITE_TICKET_API_BASE = /* @__PURE__ */ envUrl(
  "VITE_TICKET_API_BASE",
  "https://roj8jj0e3h.execute-api.eu-west-1.amazonaws.com/dev",
);

/** Hotel favourites API Gateway base. */
export const VITE_HOTEL_FAVOURITE_API_BASE = /* @__PURE__ */ envUrl(
  "VITE_HOTEL_FAVOURITE_API_BASE",
  "https://4fb18kpcba.execute-api.eu-west-1.amazonaws.com/qa",
);

/** Flight cancellation API Gateway base. */
export const VITE_FLIGHT_CANCELLATION_API_BASE = /* @__PURE__ */ envUrl(
  "VITE_FLIGHT_CANCELLATION_API_BASE",
  "https://wfyy7adwqh.execute-api.eu-west-1.amazonaws.com/qa",
);

/**
 * Guest user + session REST API (`fetch` apiClient: /users, /sessions).
 * `VITE_API_URL` is supported as a legacy alias.
 */
export const VITE_GUEST_REST_API_BASE = /* @__PURE__ */ firstEnv(
  ["VITE_GUEST_REST_API_BASE", "VITE_API_URL"],
  "https://aj8e5f03b6.execute-api.eu-west-1.amazonaws.com/dev",
);
/**
 * Authenticated remote user profile service (same family as AuthService remote helpers).
 */
export const VITE_USER_SERVICE_BASE_URL = /* @__PURE__ */ envUrl(
  "VITE_USER_SVC_BASE_URL",
  "https://6le202qw69.execute-api.eu-west-1.amazonaws.com",
);

/** Full URL to guest JWT/token endpoint (POST). */
export const VITE_GUEST_TOKEN_API_URL = /* @__PURE__ */ envUrl(
  "VITE_GUEST_TOKEN_API_URL",
  "https://lxwyy0x3f5.execute-api.eu-west-1.amazonaws.com/qa/guest-token",
);

/** AppSync GraphQL HTTP endpoint (override aws-exports default). */
export const VITE_APPSYNC_GRAPHQL_ENDPOINT = /* @__PURE__ */ envUrl(
  "VITE_APPSYNC_URL",
  "https://q24kjogjhbaufln5mlqcajiwmq.appsync-api.eu-west-1.amazonaws.com/graphql",
);

/** PayFort Hosted Payment Page URL (tokenization / payment POST). */
export const VITE_PAYFORT_PAYMENT_PAGE_URL = /* @__PURE__ */ envUrl(
  "VITE_PAYFORT_PAYMENT_PAGE_URL",
  "https://sbcheckout.payfort.com/FortAPI/paymentPage",
);

/** Public base URL for ticket PDFs stored in S3 (no trailing path). */
export const VITE_S3_TICKET_PUBLIC_BASE = /* @__PURE__ */ envUrl(
  "VITE_S3_TICKET_PUBLIC_BASE",
  "https://booked-ticket-dev2.s3.eu-west-1.amazonaws.com",
);

/** Nominatim search (geocoding). */
export const VITE_NOMINATIM_BASE_URL = /* @__PURE__ */ envUrl(
  "VITE_NOMINATIM_BASE_URL",
  "https://nominatim.openstreetmap.org",
);

/** Optional connectivity probe (see NetworkStatusContext). */
export const VITE_NETWORK_PING_URL = /* @__PURE__ */ envUrl(
  "VITE_NETWORK_PING_URL",
  "https://www.google.com/favicon.ico",
);
