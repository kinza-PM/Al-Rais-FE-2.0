import type {
  HotelBookingCardItem,
  SightseeingBookingCardItem,
} from "./transformBookingData";

function startOfDayLocal(d: Date): number {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

/** Inclusive date range using YYYY-MM-DD from `<input type="date" />`. */
export function dateInRange(
  d: Date | null,
  dateFrom?: string,
  dateTo?: string,
): boolean {
  if (!dateFrom && !dateTo) return true;
  if (!d || Number.isNaN(d.getTime())) return true;
  const day = startOfDayLocal(d);
  if (dateFrom) {
    const f = startOfDayLocal(new Date(`${dateFrom}T12:00:00`));
    if (day < f) return false;
  }
  if (dateTo) {
    const t = startOfDayLocal(new Date(`${dateTo}T12:00:00`));
    if (day > t) return false;
  }
  return true;
}

export function flightBookingMatchesQuery(b: any, q: string): boolean {
  const s = q.trim().toLowerCase();
  if (!s) return true;
  const parts: string[] = [];
  if (b?.bookingRef) parts.push(String(b.bookingRef));
  if (b?.passengersLabel) parts.push(String(b.passengersLabel));
  for (const j of b?.journeys || []) {
    parts.push(
      j?.from?.code,
      j?.from?.dateLabel,
      j?.to?.code,
      j?.to?.dateLabel,
      j?.airline?.name,
      j?.airline?.flightNo,
      j?.airline?.cabin,
      j?.durationLabel,
    );
  }
  const hay = parts.filter(Boolean).join(" ").toLowerCase();
  return hay.includes(s);
}

export function flightBookingInDateRange(
  b: any,
  dateFrom?: string,
  dateTo?: string,
): boolean {
  const raw =
    b?.originalApiItem?.request?.journey?.[0]?.flightSegments?.[0]
      ?.departureDateTime;
  if (!raw) return true;
  const d = new Date(raw);
  return dateInRange(Number.isNaN(d.getTime()) ? null : d, dateFrom, dateTo);
}

export function hotelBookingMatchesQuery(
  h: HotelBookingCardItem,
  q: string,
): boolean {
  const s = q.trim().toLowerCase();
  if (!s) return true;
  const hay = [
    h.hotelName,
    h.address,
    h.bookingRef,
    h.roomLabel,
    h.checkInDate,
    h.checkOutDate,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return hay.includes(s);
}

export function hotelBookingInDateRange(
  h: HotelBookingCardItem,
  dateFrom?: string,
  dateTo?: string,
): boolean {
  const t = Date.parse(h.checkInDate);
  if (Number.isNaN(t)) return true;
  return dateInRange(new Date(t), dateFrom, dateTo);
}

export function sightseeingBookingMatchesQuery(
  b: SightseeingBookingCardItem,
  q: string,
): boolean {
  const s = q.trim().toLowerCase();
  if (!s) return true;
  const hay = [
    b.activityTitle,
    b.locationLabel,
    b.countryLabel,
    b.bookingRef,
    b.clientReference,
    b.tourDateDisplay,
    b.packageSummary,
    b.travellersSummary,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return hay.includes(s);
}

export function sightseeingBookingInDateRange(
  b: SightseeingBookingCardItem,
  dateFrom?: string,
  dateTo?: string,
): boolean {
  const t = Date.parse(b.tourDateDisplay);
  if (Number.isNaN(t)) return true;
  return dateInRange(new Date(t), dateFrom, dateTo);
}
