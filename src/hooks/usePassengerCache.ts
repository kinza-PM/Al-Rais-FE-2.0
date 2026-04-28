import { useMutation, useQuery } from "@tanstack/react-query";
import { useAuth } from "../features/auth/hooks/useAuth";
import {
  postPassengerCache,
  type PassengerCacheRequest,
} from "../services/api/passengerCache";

/**
 * Passenger cache is user-specific. When logged out we skip the request (avoids 401 + stale cache).
 * When the user logs in, `enabled` flips and the query key changes so a fresh fetch runs.
 */
export function usePassengerCacheFetch() {
  const { isAuthenticated, user } = useAuth();
  return useQuery({
    queryKey: [
      "passengerCache",
      "fetch",
      isAuthenticated ? (user?.id ?? user?.email ?? "session") : "guest",
    ],
    queryFn: () => postPassengerCache({ type: "fetch" }),
    enabled: isAuthenticated,
  });
}

export function usePassengerCacheAdd() {
  return useMutation({
    mutationFn: (body: Extract<PassengerCacheRequest, { type: "add" }>) =>
      postPassengerCache(body),
  });
}

