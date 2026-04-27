/**
 * Non-secret API URLs from Vite env (VITE_*).
 * Fallbacks depend on `import.meta.env.MODE` so local dev (`development`) never
 * silently uses QA defaults when a variable is missing.
 */
const MODE = import.meta.env.MODE;

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

/** QA vs dev-build vs local-dev fallback (when env var is absent). */
function fb(qa: string, devBuild: string, localDev: string): string {
  if (MODE === "qa") return qa;
  if (MODE === "dev") return devBuild;
  return localDev;
}

// --- Shared literals (aligned with `.env.development` / `.env.dev` / `.env.qa`) ---

const LOCAL_MAIN = "https://main-api.dev.invalid";
const LOCAL_FLIGHT = "https://flight-api.dev.invalid";
const LOCAL_PAYMENT = "https://payment-api.dev.invalid";
const LOCAL_ANCILLARY = "https://flight-ancillary-api.dev.invalid";
const LOCAL_HOTEL = "https://hotel-api.dev.invalid/dev";
const LOCAL_TICKET = "https://ticket-api.dev.invalid";
const LOCAL_HOTEL_FAV = "https://hotel-favourite-api.dev.invalid";
const LOCAL_FLIGHT_CANCEL = "https://flight-cancellation-api.dev.invalid";
const LOCAL_GUEST_REST = "https://guest-rest-api.dev.invalid";
const LOCAL_USER_SVC = "https://user-svc-api.dev.invalid";
const LOCAL_GUEST_TOKEN = "https://guest-token-api.dev.invalid/guest-token";
const LOCAL_APPSYNC = "https://appsync-dev.example.com/graphql";
const LOCAL_S3_TICKET = "https://ticket-pdf-dev.example.com";

const DEV_MAIN = "https://ie7eaxnxpg.execute-api.eu-west-1.amazonaws.com/dev";
const DEV_FLIGHT =
  "https://y0v4qcjjo5.execute-api.eu-west-1.amazonaws.com/dev2";
const DEV_PAYMENT =
  "https://3cbnpbnuii.execute-api.eu-west-1.amazonaws.com/dev";
const DEV_ANCILLARY =
  "https://4wt7s595a8.execute-api.eu-west-1.amazonaws.com/dev";
const DEV_HOTEL =
  "https://hfus5c7uw2.execute-api.eu-west-1.amazonaws.com/dev";
const DEV_TICKET =
  "https://roj8jj0e3h.execute-api.eu-west-1.amazonaws.com/dev";
const DEV_HOTEL_FAV =
  "https://iqgovf9bf7.execute-api.eu-west-1.amazonaws.com/dev";
const DEV_FLIGHT_CANCEL =
  "https://orvmy7zbb5.execute-api.eu-west-1.amazonaws.com/dev";
const DEV_GUEST_REST =
  "https://aj8e5f03b6.execute-api.eu-west-1.amazonaws.com/dev";
const DEV_USER_SVC = "https://6le202qw69.execute-api.eu-west-1.amazonaws.com";
const DEV_GUEST_TOKEN =
  "https://lxwyy0x3f5.execute-api.eu-west-1.amazonaws.com/dev/guest-token";

const QA_FLIGHT =
  "https://le9ey3bd4m.execute-api.eu-west-1.amazonaws.com/qa";
const QA_PAYMENT =
  "https://tfv8l0ppad.execute-api.eu-west-1.amazonaws.com/qa";
const QA_ANCILLARY =
  "https://3ws94glls6.execute-api.eu-west-1.amazonaws.com/qa";
const QA_HOTEL =
  "https://9sk9buwtq8.execute-api.eu-west-1.amazonaws.com/qa";
const QA_HOTEL_FAV =
  "https://4fb18kpcba.execute-api.eu-west-1.amazonaws.com/qa";
const QA_FLIGHT_CANCEL =
  "https://wfyy7adwqh.execute-api.eu-west-1.amazonaws.com/qa";
const QA_GUEST_TOKEN =
  "https://lxwyy0x3f5.execute-api.eu-west-1.amazonaws.com/qa/guest-token";

const SHARED_APPSYNC =
  "https://q24kjogjhbaufln5mlqcajiwmq.appsync-api.eu-west-1.amazonaws.com/graphql";
const SHARED_S3_TICKET =
  "https://booked-ticket-dev2.s3.eu-west-1.amazonaws.com";

/** Main axios default base (paths not routed to another host). */
export const VITE_API_BASE = /* @__PURE__ */ envUrl(
  "VITE_API_BASE",
  fb(DEV_MAIN, DEV_MAIN, LOCAL_MAIN),
);

/** Flight search / booking API Gateway base. */
export const VITE_FLIGHT_API_BASE = /* @__PURE__ */ envUrl(
  "VITE_FLIGHT_API_BASE",
  fb(QA_FLIGHT, DEV_FLIGHT, LOCAL_FLIGHT),
);

/** Payment (PayFort proxy, etc.) API Gateway base. */
export const VITE_PAYMENT_API_BASE = /* @__PURE__ */ envUrl(
  "VITE_PAYMENT_API_BASE",
  fb(QA_PAYMENT, DEV_PAYMENT, LOCAL_PAYMENT),
);

/** Flight ancillary API Gateway base. */
export const VITE_FLIGHT_ANCILLARY_API_BASE = /* @__PURE__ */ envUrl(
  "VITE_FLIGHT_ANCILLARY_API_BASE",
  fb(QA_ANCILLARY, DEV_ANCILLARY, LOCAL_ANCILLARY),
);

/** Hotel API Gateway base. */
export const VITE_HOTEL_API_BASE = /* @__PURE__ */ envUrl(
  "VITE_HOTEL_API_BASE",
  fb(QA_HOTEL, DEV_HOTEL, LOCAL_HOTEL),
);

/** Countries / cities listing (countriesnow.space). */
export const VITE_LOCATION_API_BASE = /* @__PURE__ */ envUrl(
  "VITE_LOCATION_API_BASE",
  "https://countriesnow.space/api/v0.1",
);

/** Ticket upload / retrieval API Gateway base. */
export const VITE_TICKET_API_BASE = /* @__PURE__ */ envUrl(
  "VITE_TICKET_API_BASE",
  fb(DEV_TICKET, DEV_TICKET, LOCAL_TICKET),
);

/** Hotel favourites API Gateway base. */
export const VITE_HOTEL_FAVOURITE_API_BASE = /* @__PURE__ */ envUrl(
  "VITE_HOTEL_FAVOURITE_API_BASE",
  fb(QA_HOTEL_FAV, DEV_HOTEL_FAV, LOCAL_HOTEL_FAV),
);

/** Flight cancellation API Gateway base. */
export const VITE_FLIGHT_CANCELLATION_API_BASE = /* @__PURE__ */ envUrl(
  "VITE_FLIGHT_CANCELLATION_API_BASE",
  fb(QA_FLIGHT_CANCEL, DEV_FLIGHT_CANCEL, LOCAL_FLIGHT_CANCEL),
);

/**
 * Guest user + session REST API (`fetch` apiClient: /users, /sessions).
 * `VITE_API_URL` is supported as a legacy alias.
 */
export const VITE_GUEST_REST_API_BASE = /* @__PURE__ */ firstEnv(
  ["VITE_GUEST_REST_API_BASE", "VITE_API_URL"],
  fb(DEV_GUEST_REST, DEV_GUEST_REST, LOCAL_GUEST_REST),
);
/**
 * Authenticated remote user profile service (same family as AuthService remote helpers).
 */
export const VITE_USER_SERVICE_BASE_URL = /* @__PURE__ */ envUrl(
  "VITE_USER_SVC_BASE_URL",
  fb(DEV_USER_SVC, DEV_USER_SVC, LOCAL_USER_SVC),
);

/** Full URL to guest JWT/token endpoint (POST). */
export const VITE_GUEST_TOKEN_API_URL = /* @__PURE__ */ envUrl(
  "VITE_GUEST_TOKEN_API_URL",
  fb(QA_GUEST_TOKEN, DEV_GUEST_TOKEN, LOCAL_GUEST_TOKEN),
);

/** AppSync GraphQL HTTP endpoint (override aws-exports default). */
export const VITE_APPSYNC_GRAPHQL_ENDPOINT = /* @__PURE__ */ envUrl(
  "VITE_APPSYNC_URL",
  fb(SHARED_APPSYNC, SHARED_APPSYNC, LOCAL_APPSYNC),
);

/** PayFort Hosted Payment Page URL (tokenization / payment POST). */
export const VITE_PAYFORT_PAYMENT_PAGE_URL = /* @__PURE__ */ envUrl(
  "VITE_PAYFORT_PAYMENT_PAGE_URL",
  "https://sbcheckout.payfort.com/FortAPI/paymentPage",
);

/** Public base URL for ticket PDFs stored in S3 (no trailing path). */
export const VITE_S3_TICKET_PUBLIC_BASE = /* @__PURE__ */ envUrl(
  "VITE_S3_TICKET_PUBLIC_BASE",
  fb(SHARED_S3_TICKET, SHARED_S3_TICKET, LOCAL_S3_TICKET),
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
