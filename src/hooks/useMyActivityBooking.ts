import { useQuery } from "@tanstack/react-query";
import {
  postMyActivityBookings,
  type MyActivityBookingRequest,
} from "../services/api/activityBookings";

/**
 * Fetches the authenticated user's activity/sightseeing bookings from the main API
 * (`POST /myActivityBooking`; see `VITE_MY_ACTIVITY_BOOKING_API` in axios). React Query dedupes identical
 * in-flight requests (e.g. React Strict Mode double mount).
 */
export function useMyActivityBookingsQuery(
  filters: MyActivityBookingRequest | null,
) {
  const enabled = filters != null;
  return useQuery({
    queryKey: ["myActivityBookings", filters?.status ?? ""] as const,
    queryFn: ({ signal }) => postMyActivityBookings(filters!, { signal }),
    enabled,
    /** Avoid hammering the API when the stage rejects JWT (e.g. IAM / IncompleteSignature). */
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
}
