import type { ApiResponse, RequestOptions } from "../../types/ApiClientTypes";
import { TokenService } from "../tokenService";
import { VITE_GUEST_REST_API_BASE } from "../../config/publicEnv";

// apiClient.ts — guest user/session REST (`/users`, `/sessions`)
const API_BASE_URL = VITE_GUEST_REST_API_BASE;

let baseUrl = API_BASE_URL;

export const setBaseUrl = (url: string): void => {
  baseUrl = url;
};

export const getBaseUrl = (): string => baseUrl;

export async function request<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<ApiResponse<T>> {
  const { method = "GET", headers = {}, body, timeout = 30000 } = options;

  const url = `${baseUrl}${endpoint}`;

  let authToken: string | null = null;
  try {
    authToken = await TokenService.getToken();
  } catch (error) {
    console.warn("ApiClient: Failed to load auth token:", error);
  }

  const defaultHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    "User-Agent": navigator.userAgent,
    ...headers,
  };

  const hasAuthHeader = Object.keys(defaultHeaders).some(
    (key) => key.toLowerCase() === "authorization"
  );
  if (authToken && !hasAuthHeader) {
    defaultHeaders.Authorization = `Bearer ${authToken}`;
  }

  const requestOptions: RequestInit = {
    method,
    headers: defaultHeaders,
    signal: AbortSignal.timeout(timeout),
  };

  if (body) {
    requestOptions.body =
      typeof body === "string" ? body : JSON.stringify(body);
  }

  try {
    const response = await fetch(url, requestOptions);
    const result: ApiResponse<T> = await response.json();

    if (!response.ok) {
      console.error(
        `ApiClient: Request failed - ${response.status}:`,
        result.error || result.message
      );
      return {
        success: false,
        error:
          result.error ||
          result.message ||
          `Request failed with status ${response.status}`,
      };
    }

    return result;
  } catch (error) {
    console.error("ApiClient: Request error:", error);

    if (error instanceof Error) {
      if (error.name === "AbortError") {
        return {
          success: false,
          error: "Request timed out",
        };
      }

      return {
        success: false,
        error: error.message || "Network error occurred",
      };
    }

    return {
      success: false,
      error: "Unknown error occurred",
    };
  }
}

// Verb-specific wrappers
export const get = <T>(endpoint: string, headers?: Record<string, string>) =>
  request<T>(endpoint, { method: "GET", headers });

export const post = <T>(
  endpoint: string,
  body?: object,
  headers?: Record<string, string>
) => request<T>(endpoint, { method: "POST", body, headers });

export const put = <T>(
  endpoint: string,
  body?: object,
  headers?: Record<string, string>
) => request<T>(endpoint, { method: "PUT", body, headers });

export const del = <T>(endpoint: string, headers?: Record<string, string>) =>
  request<T>(endpoint, { method: "DELETE", headers });

export const patch = <T>(
  endpoint: string,
  body?: object,
  headers?: Record<string, string>
) => request<T>(endpoint, { method: "PATCH", body, headers });
