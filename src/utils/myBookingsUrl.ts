export const MY_BOOKINGS_PATH = "/my-bookings";

/** Persisted while on My Bookings — used to restore ?mode=&status= after browser Back when the URL loses search params. */
export const MY_BOOKINGS_LAST_QS_SESSION_KEY = "alrais:my-bookings-last-qs";

/**
 * Set when navigating from My Bookings → hotel detail/cancel so a subsequent POP
 * to bare `/my-bookings` can safely restore the last query (Hotels tab, etc.).
 */
export const MY_BOOKINGS_RESTORE_FLAG_SESSION_KEY =
  "alrais:expect-restore-my-bookings-qs";

export function markExpectMyBookingsQueryRestore() {
  try {
    sessionStorage.setItem(MY_BOOKINGS_RESTORE_FLAG_SESSION_KEY, "1");
  } catch {
    /* ignore */
  }
}

export type MyBookingsModeParam = "all" | "flights" | "hotels" | "sightseeing";
export type MyBookingsStatusParam =
  | "all"
  | "pending"
  | "confirmed"
  | "expired"
  | "cancelled";

export function buildMyBookingsUrl(
  opts: Partial<{
    mode: MyBookingsModeParam;
    status: MyBookingsStatusParam;
  }> = {},
): string {
  const params = new URLSearchParams();
  params.set("mode", opts.mode ?? "flights");
  params.set("status", opts.status ?? "all");
  return `${MY_BOOKINGS_PATH}?${params.toString()}`;
}
