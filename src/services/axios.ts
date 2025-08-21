import axios from "axios";

export const API_BASE =
  import.meta.env.VITE_API_BASE ||
  "https://ie7eaxnxpg.execute-api.eu-west-1.amazonaws.com/dev";

export const axiosClient = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

axiosClient.interceptors.request.use((config) => {
  // const token = yourAuthStore.getState().token;
  // if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export function toApiError(source: string, err: unknown): Error {
  if (axios.isAxiosError(err)) {
    // Abort / cancel
    if (err.code === "ERR_CANCELED") {
      return new Error(`${source} aborted (timeout/cancelled)`);
    }
    const status = err.response?.status;
    // Try to pick server message if any
    const serverMsg =
      (err.response?.data as any)?.message ||
      (typeof err.response?.data === "string" ? err.response?.data : "");
    const msg = serverMsg || err.message || "Unknown error";
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
};
