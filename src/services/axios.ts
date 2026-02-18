import axios from "axios";
import { extractServerMessageFromAny } from "../utils/apiErrorHanlder";
// import { StorageService } from "../utils/storage";
// import { hashString } from "../utils/crypto";
import { TokenService } from "./tokenService";
import { StorageService } from "../utils/storage";
import { fetchAuthSession } from "aws-amplify/auth";

const flightApis = [
  "/flightSearch",
  "/moreFareSearch",
  "/flightProvBooking",
  "/fareRuleSearch",
  "/reservationFlightBooking",
  "/retrieveFlightBooking",
  "/myBooking",
  "/uploadImagePreSignedUrl",
  "/uploadTicket",
];
const paymentApis = ["/pay"];
const flightAncillaryApis = ["/ancillarySearch", "/bookAncillary"];
const hotelApis = [
  "/hotelSearch",
  "/hotelDetail",
  "/getMoreRooms",
  "/hotelPreBook",
];
const locationApis = ["/countries/cities", "/countries"];
// const resonApis = ["/countries/cities", "/countries"];
const ticketApis = ["/ticket"];

export const API_BASE =
  import.meta.env.VITE_API_BASE ||
  "https://ie7eaxnxpg.execute-api.eu-west-1.amazonaws.com/dev";

export const FLIGHT_API_BASE =
  "https://y0v4qcjjo5.execute-api.eu-west-1.amazonaws.com/dev2";

export const PAYMENT_API_BASE =
  "https://3cbnpbnuii.execute-api.eu-west-1.amazonaws.com/dev";

export const FLIGHT_ANCILLARY_API_BASE =
  "https://4wt7s595a8.execute-api.eu-west-1.amazonaws.com/dev";

export const HOTEL_API_BASE =
  "https://hfus5c7uw2.execute-api.eu-west-1.amazonaws.com/dev";

export const LOCATION_API_BASE = "https://countriesnow.space/api/v0.1";

export const TICKET_API_BASE =
  "https://roj8jj0e3h.execute-api.eu-west-1.amazonaws.com/dev";

export const axiosClient = axios.create({
  baseURL: API_BASE,
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
  const token = await TokenService.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (flightApis.some((prefix) => config.url?.startsWith(prefix))) {
    config.baseURL = FLIGHT_API_BASE;
  } else if (
    flightAncillaryApis.some((prefix) => config.url?.startsWith(prefix))
  ) {
    config.baseURL = FLIGHT_ANCILLARY_API_BASE;
  } else if (paymentApis.some((prefix) => config.url?.startsWith(prefix))) {
    config.baseURL = PAYMENT_API_BASE;
  } else if (hotelApis.some((prefix) => config.url?.startsWith(prefix))) {
    config.baseURL = HOTEL_API_BASE;
  } else if (locationApis.some((prefix) => config.url?.startsWith(prefix))) {
    config.baseURL = LOCATION_API_BASE;
  } else if (ticketApis.some((prefix) => config.url?.startsWith(prefix))) {
    config.baseURL = TICKET_API_BASE;
  }

  return config;
});

axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
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
