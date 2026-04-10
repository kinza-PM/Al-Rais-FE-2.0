import type { BookingStatus } from "../components/molecules/UserBookingsListing";

const STORAGE_KEY = "al-rais-sightseeing-bookings-v1";
const CANCELLED_REFS_KEY = "al-rais-sightseeing-cancelled-refs-v1";

export type StoredSightseeingBooking = {
  id: string;
  status: BookingStatus;
  activityTitle: string;
  activityCode: string;
  tourDateIso: string;
  pickupTimeDisplay?: string;
  travellersSummary: string;
  packageSummary?: string;
  /** Shown under title on My Bookings (Figma country line). */
  countryLabel?: string;
  /** e.g. from listing preview / summary durationLabel */
  activityDurationDisplay?: string;
  /** City / region when known (helps country inference for older rows). */
  locationLabel?: string;
  bookingRef: string;
  clientReference: string;
  currency: string;
  grandTotal?: number;
  confirmedAtIso: string;
};

function readRaw(): StoredSightseeingBooking[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as StoredSightseeingBooking[]) : [];
  } catch {
    return [];
  }
}

export function getLocalSightseeingBookings(): StoredSightseeingBooking[] {
  return readRaw().sort(
    (a, b) =>
      new Date(b.confirmedAtIso).getTime() -
      new Date(a.confirmedAtIso).getTime(),
  );
}

export function appendLocalSightseeingBooking(
  entry: Omit<StoredSightseeingBooking, "confirmedAtIso"> & {
    confirmedAtIso?: string;
  },
): void {
  const list = readRaw();
  const next: StoredSightseeingBooking = {
    ...entry,
    confirmedAtIso: entry.confirmedAtIso ?? new Date().toISOString(),
  };
  const deduped = list.filter(
    (b) =>
      b.bookingRef !== next.bookingRef &&
      b.clientReference !== next.clientReference,
  );
  deduped.unshift(next);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(deduped.slice(0, 50)));
  } catch {
    /* quota or private mode */
  }
}

function writeRawBookings(list: StoredSightseeingBooking[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list.slice(0, 50)));
  } catch {
    /* quota or private mode */
  }
}

/**
 * Remember sightseeing cancellations on this device so My Bookings updates
 * immediately (API/mock may still return the old status until refetch catches up).
 */
export function markSightseeingBookingCancelled(bookingRef: string): void {
  const ref = bookingRef.trim();
  if (!ref || ref === "N/A") return;
  try {
    const raw = localStorage.getItem(CANCELLED_REFS_KEY);
    let arr: string[] = [];
    if (raw) {
      const p = JSON.parse(raw) as unknown;
      arr = Array.isArray(p)
        ? p.filter((x): x is string => typeof x === "string" && x.trim() !== "")
        : [];
    }
    if (!arr.includes(ref)) {
      arr.push(ref);
      localStorage.setItem(
        CANCELLED_REFS_KEY,
        JSON.stringify(arr.slice(-200)),
      );
    }
  } catch {
    /* ignore */
  }

  const list = readRaw();
  let changed = false;
  const next = list.map((b) => {
    if (b.bookingRef === ref || b.clientReference === ref) {
      changed = true;
      return { ...b, status: "Cancelled" as const };
    }
    return b;
  });
  if (changed) writeRawBookings(next);
}

export function getCancelledSightseeingBookingRefs(): Set<string> {
  try {
    const raw = localStorage.getItem(CANCELLED_REFS_KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw) as unknown;
    if (!Array.isArray(arr)) return new Set();
    return new Set(arr.filter((x): x is string => typeof x === "string" && x.trim() !== ""));
  } catch {
    return new Set();
  }
}
