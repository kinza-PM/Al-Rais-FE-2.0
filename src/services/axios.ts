import axios from "axios";
import { extractServerMessageFromAny } from "../utils/apiErrorHanlder";
import { TokenService } from "./tokenService";
import { StorageService } from "../utils/storage";
import { fetchAuthSession } from "aws-amplify/auth";
import {
  VITE_API_BASE,
  VITE_ACTIVITIES_API_BASE,
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
const flightCancellation = ["/flightCancellationCharge", "/flightCancel"];
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
const ticketApis = ["/ticket"];
const hotelFavouriteApis = ["/addHotelFavourites","/getHotelFavourites"];

export const API_BASE = VITE_API_BASE;

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
export const ACTIVITIES_API_BASE = VITE_ACTIVITIES_API_BASE;

type WindowWithInjectedActivitiesEnv = Window & {
  __AR_ENV__?: {
    VITE_ACTIVITIES_API_KEY?: string;
    VITE_ACTIVITIES_BROWSER_BASE?: string;
  };
};

function readInjectedActivitiesEnv():
  | WindowWithInjectedActivitiesEnv["__AR_ENV__"]
  | undefined {
  if (typeof window === "undefined") return undefined;
  return (window as WindowWithInjectedActivitiesEnv).__AR_ENV__;
}

function resolveActivitiesApiKey(): string | undefined {
  const injected = readInjectedActivitiesEnv()?.VITE_ACTIVITIES_API_KEY?.trim();
  if (injected) return injected;
  const fromBuild = import.meta.env.VITE_ACTIVITIES_API_KEY;
  if (typeof fromBuild === "string" && fromBuild.trim() !== "") {
    return fromBuild.trim();
  }
  return undefined;
}

function resolveActivitiesClientBase(): string {
  if (import.meta.env.DEV) {
    return "/api/activities-proxy";
  }
  const fromBuild = import.meta.env.VITE_ACTIVITIES_BROWSER_BASE?.trim();
  if (fromBuild) return fromBuild.replace(/\/+$/, "");
  const fromWindow =
    readInjectedActivitiesEnv()?.VITE_ACTIVITIES_BROWSER_BASE?.trim();
  if (fromWindow) return fromWindow.replace(/\/+$/, "");
  return ACTIVITIES_API_BASE.replace(/\/+$/, "");
}

const activitiesApis = [
  "/destinationByOurCountry",
  "/getAvailability",
  "/activitiesDetail",
  "/preConfirmBooking",
  "/confirmBooking",
  "/cancelBooking",
];

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

function activitiesShouldUseBearerInBrowser(): boolean {
  if (import.meta.env.DEV) return false;
  const raw = import.meta.env.VITE_ACTIVITIES_USE_BEARER;
  if (raw === "false" || raw === "0") return false;
  return true;
}

function pathIsActivities(url: string | undefined): boolean {
  const path = requestUrlPath(url);
  return activitiesApis.some((prefix) => path.startsWith(prefix));
}

function pathSkipsJwtGuestRetry(url: string | undefined): boolean {
  if (!pathIsActivities(url)) return false;
  if (import.meta.env.DEV) return true;
  if (import.meta.env.VITE_ACTIVITIES_USE_BEARER === "false") return true;
  return false;
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
  const useBearerOnActivities = activitiesShouldUseBearerInBrowser();
  /**
   * Sightseeing hits execute-api with a JWT authorizer. If `getToken()` runs before
   * guest-token bootstrap finishes, the first request can leave without `Authorization`.
   * Warm guest session first for these routes (no-op if already cached).
   */
  if (isActivities && useBearerOnActivities) {
    await TokenService.ensureGuestToken();
  }
  const token = await TokenService.getToken();
  if (token && (!isActivities || useBearerOnActivities)) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (flightApis.some((prefix) => path.startsWith(prefix))) {
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

    const activitiesBase = resolveActivitiesClientBase();
    config.baseURL = `${activitiesBase.replace(/\/+$/, "")}/`;
  }

  if (isActivities) {
    if (!useBearerOnActivities) {
      config.headers.delete("Authorization");
    }
    const ak = resolveActivitiesApiKey();
    if (ak) {
      config.headers.set("x-api-key", ak);
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
    if (pathSkipsJwtGuestRetry(originalRequest?.url)) {
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
      const cognitoActive = await hasCognitoSession();

      if (!cognitoActive) {

        try {
          StorageService.clearAuth?.();
        } catch {
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


      if (!originalRequest._authRetry) {
        originalRequest._authRetry = true;
        const refreshed = await refreshCognitoToken();
        if (refreshed) {
          originalRequest.headers = originalRequest.headers || {};
          originalRequest.headers.Authorization = `Bearer ${refreshed}`;
          return axiosClient(originalRequest);
        }
      }


      try {
        StorageService.clearAuth?.();
      } catch {
        // ignore
      }
      try {
        TokenService.clearToken();
      } catch {
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
    options?: { signal?: AbortSignal; headers?: Record<string, string> },
  ) => {
    const res = await axiosClient.post<T>(url, data, {
      signal: options?.signal,
      headers: options?.headers,
    });
    return res.data;
  },
};
