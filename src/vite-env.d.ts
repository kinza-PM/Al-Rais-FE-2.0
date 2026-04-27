/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Cognito user pool id (set in `.env.development` / `.env.dev` for dev). */
  readonly VITE_AWS_USER_POOLS_ID?: string;
  readonly VITE_AWS_USER_POOLS_WEB_CLIENT_ID?: string;
  /** Main app API base (Execute API URL including stage). Used by Vite proxy target in dev. */
  readonly VITE_API_BASE?: string;
  readonly VITE_FLIGHT_API_BASE?: string;
  readonly VITE_PAYMENT_API_BASE?: string;
  readonly VITE_FLIGHT_ANCILLARY_API_BASE?: string;
  readonly VITE_HOTEL_API_BASE?: string;
  readonly VITE_LOCATION_API_BASE?: string;
  readonly VITE_TICKET_API_BASE?: string;
  readonly VITE_HOTEL_FAVOURITE_API_BASE?: string;
  readonly VITE_FLIGHT_CANCELLATION_API_BASE?: string;
  /** Legacy alias read by publicEnv for guest REST API */
  readonly VITE_API_URL?: string;
  readonly VITE_GUEST_REST_API_BASE?: string;
  readonly VITE_USER_SVC_BASE_URL?: string;
  readonly VITE_GUEST_TOKEN_API_URL?: string;
  readonly VITE_APPSYNC_URL?: string;
  readonly VITE_APPSYNC_API_KEY?: string;
  readonly VITE_APPSYNC_APIKEY?: string;
  readonly VITE_APPSYNC_KEY?: string;
  readonly VITE_APPSYNC_REGION?: string;
  readonly VITE_AWS_REGION?: string;
  readonly VITE_APPSYNC_AUTH_MODE?: string;
  readonly VITE_PAYFORT_PAYMENT_PAGE_URL?: string;
  readonly VITE_PAYFORT_TOKEN_RETURN_URL?: string;
  readonly VITE_PAYFORT_ACCESS_CODE?: string;
  readonly VITE_PAYFORT_MERCHANT_IDENTIFIER?: string;
  readonly VITE_PAYFORT_SHA_REQUEST_PHRASE?: string;
  readonly VITE_PAYFORT_SHA_RESPONSE_PHRASE?: string;
  readonly VITE_S3_TICKET_PUBLIC_BASE?: string;
  readonly VITE_NOMINATIM_BASE_URL?: string;
  readonly VITE_NETWORK_PING_URL?: string;
  /** Set to `"false"` to call `VITE_API_BASE` directly from the browser in dev (needs CORS on the API). */
  readonly VITE_MAIN_API_PROXY?: string;
  /**
   * Where `POST myActivityBooking` is deployed:
   * `activities` (IAM / same as sightseeing — default in dev), `flight`, `hotel`, or `main` (JWT).
   */
  readonly VITE_MY_ACTIVITY_BOOKING_API?: string;
  /** Sightseeing / activities API (execute-api), optional in dev when using proxy */
  readonly VITE_ACTIVITIES_API_BASE?: string;
  readonly VITE_ACTIVITIES_API_KEY?: string;
  /**
   * Non-dev: browser base for activities (e.g. same-origin `/api/activities-proxy` if CloudFront forwards
   * to a SigV4-capable origin). When unset, requests use `VITE_ACTIVITIES_API_BASE` directly.
   */
  readonly VITE_ACTIVITIES_BROWSER_BASE?: string;
  /** Dev SigV4 proxy only: optional overrides (same semantics as AWS_*). */
  readonly VITE_ACTIVITIES_AWS_ACCESS_KEY_ID?: string;
  readonly VITE_ACTIVITIES_AWS_SECRET_ACCESS_KEY?: string;
  readonly VITE_ACTIVITIES_AWS_SESSION_TOKEN?: string;
  readonly VITE_ACTIVITIES_AWS_PROFILE?: string;
  /** Dev: set to true to force 502 when credentials missing (default mocks destination list). */
  readonly VITE_ACTIVITIES_DISABLE_DEV_MOCK?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

/** Optional runtime overrides (e.g. inject in `index.html` without rebuilding). */
interface Window {
  __AR_ENV__?: {
    VITE_ACTIVITIES_API_KEY?: string;
    VITE_ACTIVITIES_BROWSER_BASE?: string;
  };
}

// Declare module types for static assets
declare module '*.png' {
  const value: string;
  export default value;
}

declare module '*.jpg' {
  const value: string;
  export default value;
}

declare module '*.jpeg' {
  const value: string;
  export default value;
}

declare module '*.gif' {
  const value: string;
  export default value;
}

declare module '*.svg' {
  const value: string;
  export default value;
}

declare module '*.webp' {
  const value: string;
  export default value;
}

declare module '*.ico' {
  const value: string;
  export default value;
}
