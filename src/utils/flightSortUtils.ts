/**
 * Client-side flight offer sorting aligned with `processFLightSearchResults` / API shape
 * (`flightSegments[].departureDateTime`, `fare.totalFare`, etc.).
 */

export function getOfferTotalFare(offer: any): number {
  const direct = Number(
    offer?.rawTotalStartingFare ?? offer?.raw?.fare?.totalFare ?? NaN,
  );
  if (!Number.isNaN(direct)) return direct;
  const p = offer?.price;
  if (p && typeof p === "object") {
    for (const v of Object.values(p)) {
      const n = Number((v as { price?: unknown })?.price);
      if (!Number.isNaN(n)) return n;
    }
  }
  const tp = Number(offer?.price?.totalPrice);
  return Number.isNaN(tp) ? NaN : tp;
}

/** First segment departure (one-way, round outbound, or multicity first segment). */
export function getOfferFirstDepartureMs(offer: any): number {
  const iso =
    offer?.flight_detail?.start_time_iso ??
    offer?.outbound?.flight_detail?.start_time_iso ??
    offer?.raw?.journey?.[0]?.flightSegments?.[0]?.departureDateTime ??
    offer?.segments?.[0]?.flight_detail?.start_time_iso ??
    "";
  if (!iso) return Number.POSITIVE_INFINITY;
  const t = new Date(iso).getTime();
  return Number.isNaN(t) ? Number.POSITIVE_INFINITY : t;
}

/** Sum of per-journey elapsed time (first departure → last arrival) for all journeys. */
export function getOfferJourneyDurationMinutes(offer: any): number {
  const journeys = offer?.raw?.journey;
  if (!Array.isArray(journeys) || journeys.length === 0) {
    return Number.POSITIVE_INFINITY;
  }
  let sum = 0;
  for (const j of journeys) {
    const segs = j?.flightSegments;
    if (!Array.isArray(segs) || segs.length === 0) continue;
    const first = segs[0];
    const last = segs[segs.length - 1];
    if (first?.departureDateTime && last?.arrivalDateTime) {
      sum += Math.max(
        0,
        (new Date(last.arrivalDateTime).getTime() -
          new Date(first.departureDateTime).getTime()) /
          60000,
      );
    }
  }
  return sum > 0 ? sum : Number.POSITIVE_INFINITY;
}

export function sortFlightOffers(list: any[] | undefined, sortKey: string): any[] {
  const arr = [...(list || [])];
  const fare = (x: any) => {
    const n = getOfferTotalFare(x);
    return Number.isNaN(n) ? Number.POSITIVE_INFINITY : n;
  };
  const dep = (x: any) => getOfferFirstDepartureMs(x);
  const dur = (x: any) => getOfferJourneyDurationMinutes(x);

  switch (sortKey) {
    case "shortest_duration":
      return arr.sort(
        (a, b) => dur(a) - dur(b) || fare(a) - fare(b) || dep(a) - dep(b),
      );
    case "earliest_departure":
      return arr.sort(
        (a, b) => dep(a) - dep(b) || fare(a) - fare(b) || dur(a) - dur(b),
      );
    case "lowest_price":
    default:
      return arr.sort(
        (a, b) => fare(a) - fare(b) || dep(a) - dep(b) || dur(a) - dur(b),
      );
  }
}
