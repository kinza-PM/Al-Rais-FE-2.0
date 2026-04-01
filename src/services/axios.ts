import axios from "axios";
import { extractServerMessageFromAny } from "../utils/apiErrorHanlder";
// import { StorageService } from "../utils/storage";
// import { hashString } from "../utils/crypto";
import { TokenService } from "./tokenService";
import { StorageService } from "../utils/storage";
import { fetchAuthSession } from "aws-amplify/auth";
import {
  VITE_API_BASE,
  VITE_FLIGHT_ANCILLARY_API_BASE,
  VITE_FLIGHT_API_BASE,
  VITE_FLIGHT_CANCELLATION_API_BASE,
  VITE_HOTEL_API_BASE,
  VITE_HOTEL_FAVOURITE_API_BASE,
  VITE_LOCATION_API_BASE,
  VITE_PAYMENT_API_BASE,
  VITE_TICKET_API_BASE,
} from "../config/publicEnv";

const flightApis = [
  "/flightSearch",
  "/moreFareSearch",
  "/flightProvBooking",
  "/fareRuleSearch",
  "/ingestFlightsView",
  "/reservationFlightBooking",
  "/retrieveFlightBooking",
  "/myBooking",
  "/uploadImagePreSignedUrl",
  "/uploadTicket",
  "/fetchAddPassengerCache",
];
const paymentApis = ["/pay"];
const flightAncillaryApis = ["/ancillarySearch", "/bookAncillary"];
const flightCancellation = ["/flightCancellationCharge", "/flightCancellation"];
const hotelApis = [
  "/hotelSearch",
  "/hotelDetail",
  "/getMoreRooms",
  "/hotelPreBook",
  "/hotelBooking",
  "/imageProxy",
  "/getHotelCancellationCharges",
  "/hotelCancellation",
  "/myHotelBooking",
  "/hotelRetrieve",
];
const locationApis = ["/countries/cities", "/countries"];
// const resonApis = ["/countries/cities", "/countries"];
const ticketApis = ["/ticket"];
const hotelFavouriteApis = ["/addHotelFavourites","/getHotelFavourites"];

export const API_BASE = VITE_API_BASE;

/** Axios base for the main app gateway: in dev, same-origin proxy (see vite `server.proxy./api/app-proxy`). */
const AXIOS_MAIN_API_CLIENT_BASE =
  import.meta.env.DEV && import.meta.env.VITE_MAIN_API_PROXY !== "false"
    ? "/api/app-proxy"
    : API_BASE;

export const FLIGHT_API_BASE = VITE_FLIGHT_API_BASE;

export const PAYMENT_API_BASE = VITE_PAYMENT_API_BASE;

export const FLIGHT_ANCILLARY_API_BASE = VITE_FLIGHT_ANCILLARY_API_BASE;

export const HOTEL_API_BASE = VITE_HOTEL_API_BASE;

export const LOCATION_API_BASE = VITE_LOCATION_API_BASE;

export const TICKET_API_BASE = VITE_TICKET_API_BASE;

export const HOTEL_FAVOURITE_API_BASE = VITE_HOTEL_FAVOURITE_API_BASE;

export const FLIGHT_CANCELLATION = VITE_FLIGHT_CANCELLATION_API_BASE;

/** Hotel Beds activities — UAT/QA (override with `VITE_ACTIVITIES_API_BASE`). */
export const ACTIVITIES_API_BASE =
  import.meta.env.VITE_ACTIVITIES_API_BASE ||
  "https://vfp63x1v88.execute-api.eu-west-1.amazonaws.com/qa";

const activitiesApis = [
  "/destinationByOurCountry",
  "/getAvailability",
  "/activitiesDetail",
  "/preConfirmBooking",
  "/confirmBooking",
  "/cancelBooking",
];

/**
 * Stable path for prefix matching. Fixes missed routes when `url` is missing a leading `/` or is absolute.
 */
function requestUrlPath(url: string | undefined): string {
  if (!url) return "";
  const noQuery = url.split("?")[0] ?? "";
  if (
    noQuery.startsWith("http://") ||
    noQuery.startsWith("https://")
  ) {
    try {
      const p = new URL(noQuery).pathname;
      return p && p !== "" ? p : "/";
    } catch {
      return noQuery;
    }
  }
  return noQuery.startsWith("/") ? noQuery : `/${noQuery}`;
}

/**
 * Hotel Beds activities API (execute-api, IAM SigV4 where enabled), unlike hotel search which accepts JWT.
 * Sending `Authorization: Bearer` produces IncompleteSignatureException. In dev, `/api/activities-proxy`
 * signs without this header; in prod you need IAM-capable access or a backend BFF.
 */
function pathIsActivities(url: string | undefined): boolean {
  const path = requestUrlPath(url);
  return activitiesApis.some((prefix) => path.startsWith(prefix));
}

export const axiosClient = axios.create({
  baseURL: AXIOS_MAIN_API_CLIENT_BASE,
  timeout: 120000,
  headers: { "Content-Type": "application/json" },
});

async function hasCognitoSession(): Promise<boolean> {
  try {
    const t = await TokenService.getCognitoToken();
    return !!t;
  } catch {
    return false;
  }
}

async function refreshCognitoToken(): Promise<string | null> {
  try {
    await fetchAuthSession({ forceRefresh: true });
    return await TokenService.getCognitoToken();
  } catch {
    return null;
  }
}

axiosClient.interceptors.request.use(async (config) => {
  const path = requestUrlPath(config.url);
  const isActivities = activitiesApis.some((prefix) => path.startsWith(prefix));

  const token = await TokenService.getToken();
  if (token && !isActivities) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  /**
   * `POST /myActivityBooking` must hit an API that accepts Cognito `Bearer` (not IAM SigV4).
   * Main `API_BASE` / app-proxy often returns IncompleteSignatureException for JWT.
   * Override: `VITE_MY_ACTIVITY_BOOKING_API` = `flight` | `hotel` | `main` (default `flight`, same stack as `/myBooking`).
   */
  if (
    path === "/myActivityBooking" ||
    path.startsWith("/myActivityBooking/")
  ) {
    const target = (
      import.meta.env.VITE_MY_ACTIVITY_BOOKING_API ?? "flight"
    ).toLowerCase();
    if (target === "hotel") {
      config.baseURL =
        import.meta.env.DEV ? "/api/hotel-proxy" : HOTEL_API_BASE;
    } else if (target === "main") {
      config.baseURL = AXIOS_MAIN_API_CLIENT_BASE;
    } else {
      config.baseURL =
        import.meta.env.DEV ? "/api/flight-proxy" : FLIGHT_API_BASE;
    }
  } else if (flightApis.some((prefix) => path.startsWith(prefix))) {
    config.baseURL = FLIGHT_API_BASE;
  } else if (
    flightAncillaryApis.some((prefix) => path.startsWith(prefix))
  ) {
    config.baseURL = FLIGHT_ANCILLARY_API_BASE;
  } else if (paymentApis.some((prefix) => path.startsWith(prefix))) {
    config.baseURL = PAYMENT_API_BASE;
  } else if (hotelApis.some((prefix) => path.startsWith(prefix))) {
    config.baseURL =
      import.meta.env.DEV ? "/api/hotel-proxy" : HOTEL_API_BASE;
  } else if (locationApis.some((prefix) => path.startsWith(prefix))) {
    config.baseURL = LOCATION_API_BASE;
  } else if (ticketApis.some((prefix) => path.startsWith(prefix))) {
    config.baseURL = TICKET_API_BASE;
  } else if (hotelFavouriteApis.some((prefix) => path.startsWith(prefix))) {
    config.baseURL = HOTEL_FAVOURITE_API_BASE;
  } else if (activitiesApis.some((prefix) => path.startsWith(prefix))) {
    config.baseURL = import.meta.env.DEV
      ? "/api/activities-proxy"
      : ACTIVITIES_API_BASE;
  }

  if (isActivities) {
    config.headers.delete("Authorization");
    const ak = import.meta.env.VITE_ACTIVITIES_API_KEY;
    if (typeof ak === "string" && ak.trim() !== "") {
      config.headers.set("x-api-key", ak.trim());
    }
  }
  else if (flightCancellation.some((prefix) => config.url?.startsWith(prefix))) {
    config.baseURL = FLIGHT_CANCELLATION;
  }

  return config;
});

axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (pathIsActivities(originalRequest?.url)) {
      return Promise.reject(error);
    }
    const serverMsg =
      error.response?.data?.message ||
      (typeof error.response?.data === "string" ? error.response.data : "") ||
      "";
    if (
      error.response?.status === 401 &&
      serverMsg.includes("Unauthorized: Invalid or expired token")
    ) {
      // IMPORTANT:
      // We must NOT hard-navigate to /auth on API errors. Instead, refresh tokens if possible,
      // and propagate the error so the UI can show "Something went wrong".
      //
      // Also, localStorage auth flags can be stale. Use Cognito session presence as the source of truth.
      const cognitoActive = await hasCognitoSession();

      // If Cognito session is not active, always treat this as a guest flow.
      if (!cognitoActive) {
        // If Cognito session is not active, always treat this as a guest flow.
        // Clear any stale auth flags so we don't accidentally force-login on future requests.
        try {
          StorageService.clearAuth?.();
        } catch {
          // ignore
        }
        if (!originalRequest._guestRetry) {
          originalRequest._guestRetry = true;
          try {
            const newGuestToken = await TokenService.getGuestToken();

            if (newGuestToken) {
              originalRequest.headers = originalRequest.headers || {};
              originalRequest.headers.Authorization = `Bearer ${newGuestToken}`;
              return axiosClient(originalRequest);
            } else {
              TokenService.clearToken();
            }
          } catch (guestErr) {
            console.error("Guest token regeneration failed:", guestErr);
            TokenService.clearToken();
          }
        }

        return Promise.reject(error);
      }

      // Cognito is active but the backend rejected the token.
      // Try to refresh Cognito token once, retry request, otherwise gracefully fall back to guest token.
      if (!originalRequest._authRetry) {
        originalRequest._authRetry = true;
        const refreshed = await refreshCognitoToken();
        if (refreshed) {
          originalRequest.headers = originalRequest.headers || {};
          originalRequest.headers.Authorization = `Bearer ${refreshed}`;
          return axiosClient(originalRequest);
        }
      }

      // If we're here, Cognito refresh didn't help; treat as guest so public flows (like flight search)
      // keep working without forcing a sign-in redirect/toast.
      try {
        // Clear stale local auth state; don't hard sign-out (it may trigger extra bootstrap calls).
        StorageService.clearAuth?.();
      } catch {
        // ignore
      }
      try {
        // Clear cached token so guest token will be used next.
        TokenService.clearToken();
      } catch {
        // ignore
      }
      if (!originalRequest._guestRetry) {
        originalRequest._guestRetry = true;
        const newGuestToken = await TokenService.getGuestToken();
        if (newGuestToken) {
          originalRequest.headers = originalRequest.headers || {};
          originalRequest.headers.Authorization = `Bearer ${newGuestToken}`;
          return axiosClient(originalRequest);
        }
      }

      // If even guest fallback fails, just bubble the error to the UI.
      return Promise.reject(error);
    }

    return Promise.reject(error);
  },
);

export function toApiError(source: string, err: unknown): Error {
  if (axios.isAxiosError(err)) {
    if (err.code === "ERR_CANCELED") {
      return new Error(`${source} aborted (timeout/cancelled)`);
    }
    const status = err.response?.status;
    const data = err.response?.data ?? err.response;
    const serverMsg = extractServerMessageFromAny(data);
    const msg = serverMsg ?? (err as any)?.message ?? "Unknown error";
    return new Error(`${source} failed (${status ?? "no-status"}): ${msg}`);
  }
  return new Error((err as any)?.message || `${source} failed (unknown)`);
}

export const api = {
  get: async <T>(
    url: string,
    params?: Record<string, any>,
    signal?: AbortSignal,
  ) => {
    const res = await axiosClient.get<T>(url, { params, signal });
    return res.data;
  },

  post: async <T>(
    url: string,
    data?: Record<string, any>,
    // signal?: AbortSignal
    options?: { signal?: AbortSignal; headers?: Record<string, string> },
  ) => {
    const res = await axiosClient.post<T>(url, data, {
      signal: options?.signal,
      headers: options?.headers,
    });
    return res.data;
  },
};
