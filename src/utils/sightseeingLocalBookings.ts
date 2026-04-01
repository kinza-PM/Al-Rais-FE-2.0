import type { BookingStatus } from "../components/molecules/UserBookingsListing";

const STORAGE_KEY = "al-rais-sightseeing-bookings-v1";

export type StoredSightseeingBooking = {
  id: string;
  status: BookingStatus;
  activityTitle: string;
  activityCode: string;
  tourDateIso: string;
  pickupTimeDisplay?: string;
  travellersSummary: string;
  packageSummary?: string;
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
