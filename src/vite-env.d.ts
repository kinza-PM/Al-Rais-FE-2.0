/// <reference types="vite/client" />

interface ImportMetaEnv {
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
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
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