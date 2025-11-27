import axios from "axios";
import { extractServerMessageFromAny } from "../utils/apiErrorHanlder";
// import { StorageService } from "../utils/storage";
// import { hashString } from "../utils/crypto";
import { TokenService } from "./tokenService";
import { StorageService } from "../utils/storage";
import { authServiceSingleton } from "./authServiceSingleton";

const flightApis = [
  "/flightSearch",
  "/moreFareSearch",
  "/flightProvBooking",
  "/fareRuleSearch",
  "/reservationFlightBooking",
  "/retrieveFlightBooking",
];
const paymentApis = ["/pay"];

export const API_BASE =
  import.meta.env.VITE_API_BASE ||
  "https://ie7eaxnxpg.execute-api.eu-west-1.amazonaws.com/dev";

export const FLIGHT_API_BASE =
  "https://y0v4qcjjo5.execute-api.eu-west-1.amazonaws.com/dev2";

export const PAYMENT_API_BASE =
  "https://3cbnpbnuii.execute-api.eu-west-1.amazonaws.com/dev";

export const axiosClient = axios.create({
  baseURL: API_BASE,
  timeout: 120000,
  headers: { "Content-Type": "application/json" },
});

axiosClient.interceptors.request.use(async (config) => {
  const token = await TokenService.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (flightApis.some((prefix) => config.url?.startsWith(prefix))) {
    config.baseURL = FLIGHT_API_BASE;
  } else if (paymentApis.some((prefix) => config.url?.startsWith(prefix))) {
    config.baseURL = PAYMENT_API_BASE;
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
      const isAuthenticated = StorageService.isAuthenticated?.() ?? false;
      if (!isAuthenticated) {
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

      if (isAuthenticated) {
        console.warn(
          "Authenticated user token invalid/expired — forcing logout."
        );

        try {
          await authServiceSingleton.signOut();
          window.location.href = "/auth";
          return new Promise(() => {});
        } catch (logoutErr) {
          console.error("Error during forced logout:", logoutErr);
        }

        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
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
    signal?: AbortSignal
  ) => {
    const res = await axiosClient.get<T>(url, { params, signal });
    return res.data;
  },

  post: async <T>(
    url: string,
    data?: Record<string, any>,
    // signal?: AbortSignal
    options?: { signal?: AbortSignal; headers?: Record<string, string> }
  ) => {
    const res = await axiosClient.post<T>(url, data, {
      signal: options?.signal,
      headers: options?.headers,
    });
    return res.data;
  },
};
