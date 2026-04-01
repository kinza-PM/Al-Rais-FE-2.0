import { api, toApiError } from "../axios";

/** Same shape as hotel my-bookings filter; backend should accept pending | confirmed | expired | all. */
export type MyActivityBookingRequest = {
  status: string;
};

/**
 * User’s saved HotelBeds / sightseeing activity bookings (`POST /myActivityBooking`).
 * Routing: `axios` sends this to flight / hotel / main API per `VITE_MY_ACTIVITY_BOOKING_API`
 * (default `flight`, same execute-api family as `POST /myBooking`). Main app `API_BASE` is often IAM (SigV4)
 * and rejects `Authorization: Bearer` with IncompleteSignatureException.
 */
export async function postMyActivityBookings<TResp = unknown>(
  body: MyActivityBookingRequest,
  options?: { signal?: AbortSignal },
): Promise<TResp> {
  const source = "postMyActivityBookings";
  try {
    return await api.post<TResp>("/myActivityBooking", body, {
      signal: options?.signal,
    });
  } catch (err) {
    throw toApiError(source, err);
  }
}
