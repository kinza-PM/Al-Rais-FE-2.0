import axios from "axios";
import { extractServerMessageFromAny } from "../utils/apiErrorHanlder";
import { StorageService } from "../utils/storage";
import { hashString } from "../utils/crypto";

const flightApis = ["/flightSearch", "/moreFareSearch", "/flightProvBooking", "/fareRuleSearch", "/reservationFlightBooking"];

export const API_BASE =
  import.meta.env.VITE_API_BASE ||
  "https://ie7eaxnxpg.execute-api.eu-west-1.amazonaws.com/dev";

export const FLIGHT_API_BASE =
  "https://kqq3ytqvij.execute-api.eu-west-1.amazonaws.com/dev";

export const axiosClient = axios.create({
  baseURL: API_BASE,
  timeout: 120000,
  headers: { "Content-Type": "application/json" },
});

axiosClient.interceptors.request.use((config) => {
  // const token = yourAuthStore.getState().token;
  // if (token) config.headers.Authorization = `Bearer ${token}`;

  if (flightApis.some(prefix => config.url?.startsWith(prefix))) {
    config.baseURL = FLIGHT_API_BASE;
  }

  return config;
});

export const userGuestOrLoginHeaders = async () => {
  const isAuthenticated = StorageService.isAuthenticated();

  if (isAuthenticated) {
    const user = StorageService.getUser();
    const userId = user?.id ?? "";
    const secret = import.meta.env.VITE_HASH_SECRET || "";
    const hashedUserId = userId ? await hashString(userId, secret) : "";
    return {
      user_type: "user",
      user_id: hashedUserId,
    } as Record<string, string>;
  }

  return {
    user_type: "guest",
  } as Record<string, string>;
};

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