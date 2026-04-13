import toast from "react-hot-toast";

export type AssetBundle = {
  EmirateLogo?: string;
  cabinIcon?: string;
  baggageIcon?: string;
  mealIcon?: string;
  wifiIcon?: string;
  portIcon?: string;
  entertainmentIcon?: string;
};

export function calculateFlightDuration(
  startTime: string,
  startDate: string,
  endTime: string,
  endDate: string,
): string {
  // Parse into real Date objects
  const start = new Date(`${startDate} ${startTime}`);
  const end = new Date(`${endDate} ${endTime}`);

  // Duration in minutes
  const diffMs = end.getTime() - start.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));

  // Convert into hours + minutes
  const hours = Math.floor(diffMinutes / 60);
  const minutes = diffMinutes % 60;

  return `${hours}h ${minutes}min`;
}

export function formatTime(dateStr: string) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

export function formatDate(dateStr: string) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-US", {
    weekday: "short", // Mon
    day: "2-digit", // 16
    month: "long", // June
    year: "numeric", // 2025
  });
}

/** Formats API duration strings (e.g. 3H5M, PT3H15M) to Figma-style labels like "03h 15min". */
export function formatFlightDurationLabel(
  raw: string | undefined | null,
): string {
  if (raw == null) return "";
  const s = String(raw).trim();
  if (!s) return "";

  const iso = s.match(/^PT(?:(\d+)H)?(?:(\d+)M)?$/i);
  if (iso) {
    const h = parseInt(iso[1] || "0", 10);
    const m = parseInt(iso[2] || "0", 10);
    return formatHhMmDurationLabel(h, m);
  }

  const compact = s.match(/^(\d+)\s*[hH]\s*(\d+)\s*[mM]/);
  if (compact) {
    return formatHhMmDurationLabel(
      parseInt(compact[1], 10),
      parseInt(compact[2], 10),
    );
  }

  const hm = s.match(/^(\d+)H(\d+)M$/i);
  if (hm) {
    return formatHhMmDurationLabel(parseInt(hm[1], 10), parseInt(hm[2], 10));
  }

  return s;
}

function formatHhMmDurationLabel(hours: number, minutes: number): string {
  const hh = String(Math.max(0, hours)).padStart(2, "0");
  const mm = String(Math.max(0, minutes)).padStart(2, "0");
  return `${hh}h ${mm}min`;
}

/** Listing card price: whole currency units, no decimals (matches Figma). */
export function formatListingStartingFare(
  currencyCode: string | undefined,
  rawAmount: number | string | undefined | null,
): string {
  const code = (currencyCode ?? "").trim();
  if (rawAmount === undefined || rawAmount === null || rawAmount === "") {
    return code;
  }
  const n =
    typeof rawAmount === "number" ? rawAmount : parseFloat(String(rawAmount));
  if (Number.isNaN(n)) {
    return `${code}${rawAmount}`;
  }
  return `${code}${Math.round(n)}`;
}

export function buildFilterPreferenceForFlightSearchRequest(
  selectedMaxConnections?: number | null,
) {
  const maxConnections =
    typeof selectedMaxConnections === "number" ? selectedMaxConnections : 0;

  return { maxConnections };
}

export function mapFlightSegment(
  item: any,
  assets: AssetBundle = {},
  defaultHeading = "Flight",
) {
  const fd = item?.flight_detail ?? item ?? {};

  const journeySegments =
    item?.raw?.journey?.[0]?.flightSegments ??
    item?.journey?.[0]?.flightSegments ??
    item?.flightSegments ??
    [];

  const firstSeg =
    Array.isArray(journeySegments) && journeySegments.length > 0
      ? journeySegments[0]
      : null;
  const lastSeg =
    Array.isArray(journeySegments) && journeySegments.length > 0
      ? journeySegments[journeySegments.length - 1]
      : null;
  const singleSeg =
    Array.isArray(journeySegments) && journeySegments.length === 1
      ? journeySegments[0]
      : null;

  const departureCode =
    singleSeg?.departureAirportCode ||
    singleSeg?.departureAirport ||
    firstSeg?.departureAirportCode ||
    firstSeg?.departureAirport ||
    fd?.departureCode ||
    fd?.dep_code ||
    fd?.originCode ||
    "";

  const arrivalCode =
    singleSeg?.arrivalAirportCode ||
    singleSeg?.arrivalAirport ||
    lastSeg?.arrivalAirportCode ||
    lastSeg?.arrivalAirport ||
    fd?.arrivalCode ||
    fd?.arr_code ||
    fd?.destinationCode ||
    "";

  const route = `${departureCode || "—"} → ${arrivalCode || "—"}`;

  const flightNumber =
    singleSeg?.flightNumber ??
    firstSeg?.flightNumber ??
    fd?.flight_number ??
    fd?.flightNo ??
    "—";
  const flightClass =
    singleSeg?.cabinClass ??
    firstSeg?.cabinClass ??
    fd?.flight_class ??
    fd?.cabinClass ??
    "—";

  const cabinRaw =
    singleSeg?.cabin ??
    firstSeg?.cabin ??
    fd?.flight_class ??
    fd?.cabin_allowance ??
    (firstSeg?.baggageAllowance?.carryOnBaggage?.[0]?.value
      ? `${firstSeg.baggageAllowance.carryOnBaggage[0].value}${
          firstSeg.baggageAllowance.carryOnBaggage[0].unit ?? ""
        }`
      : "1PC");

  const baggageNode = firstSeg?.baggageAllowance?.checkedInBaggage?.[0] ?? null;
  const baggageVal = baggageNode
    ? `${baggageNode.value}${baggageNode.unit ?? ""}`
    : null;

  const mealVal = fd?.raw?.fare?.fareType?.refundable
    ? "Refundable"
    : "Non Refundable";

  const durationVal =
    singleSeg?.duration ??
    fd?.duration ??
    item?.flight?.flightInfo?.duration ??
    null;

  const seatsVal = firstSeg?.seatsAvailable ?? null;

  const equipmentVal =
    firstSeg?.equipmentName ?? firstSeg?.equipmentType ?? null;

  const stopCount =
    (Array.isArray(item?.stop) && item.stop.length) ||
    (typeof item?.stop === "number" && item.stop) ||
    item?.stopQuantity ||
    0;

  const depTime =
    (singleSeg?.departureDateTime
      ? formatTime(singleSeg.departureDateTime)
      : null) ??
    (firstSeg?.departureDateTime
      ? formatTime(firstSeg.departureDateTime)
      : null) ??
    fd?.start_time ??
    fd?.dep_time ??
    "—";
  const depDate =
    (singleSeg?.departureDateTime
      ? formatDate(singleSeg.departureDateTime)
      : null) ??
    (firstSeg?.departureDateTime
      ? formatDate(firstSeg.departureDateTime)
      : null) ??
    fd?.start_date ??
    fd?.dep_date ??
    "—";
  const arrTime =
    (singleSeg?.arrivalDateTime
      ? formatTime(singleSeg.arrivalDateTime)
      : null) ??
    (lastSeg?.arrivalDateTime ? formatTime(lastSeg.arrivalDateTime) : null) ??
    fd?.end_time ??
    fd?.arr_time ??
    "—";
  const arrDate =
    (singleSeg?.arrivalDateTime
      ? formatDate(singleSeg.arrivalDateTime)
      : null) ??
    (lastSeg?.arrivalDateTime ? formatDate(lastSeg.arrivalDateTime) : null) ??
    fd?.end_date ??
    fd?.arr_date ??
    "—";

  return {
    heading: defaultHeading,
    route,
    airlineLogo: item?.logo ?? item?.outbound?.logo ?? assets.EmirateLogo ?? "",
    airlineName:
      item?.name ?? item?.airlineName ?? item?.outbound?.name ?? "Airline",
    flightMeta: `${flightNumber} – ${flightClass}`,
    amenities: [
      {
        key: "cabin",
        src: assets.cabinIcon ?? "",
        alt: "Cabin",
        title: `Cabin: ${cabinRaw}`,
        value: cabinRaw,
      },
      {
        key: "baggage",
        src: assets.baggageIcon ?? "",
        alt: "Baggage",
        title: `Baggage: ${baggageVal}`,
        value: baggageVal,
      },
      {
        key: "meal",
        src: assets.mealIcon ?? "",
        alt: "Meal",
        title: `${mealVal}`,
        value: mealVal,
      },
      {
        key: "duration",
        src: assets.wifiIcon ?? "",
        alt: "Wi-Fi",
        title: `Duration: ${durationVal}`,
        value: durationVal,
      },
      {
        key: "seats",
        src: assets.portIcon ?? "",
        alt: "Ports",
        title: `Seats: ${seatsVal}`,
        value: seatsVal,
      },
      {
        key: "equipment",
        src: assets.entertainmentIcon ?? "",
        alt: "Entertainment",
        title: `${equipmentVal}`,
        value: equipmentVal,
      },
    ].filter(
      (amenity) =>
        amenity.value !== null &&
        amenity.value !== undefined &&
        String(amenity.value).trim() !== "" &&
        String(amenity.value).trim() !== "—",
    ),
    dep: {
      time: depTime,
      date: depDate,
    },
    arr: {
      time: arrTime,
      date: arrDate,
    },
    durationLabel:
      singleSeg?.duration ??
      fd?.duration ??
      item?.flight?.flightInfo?.duration ??
      "—",
    tag: stopCount > 0 ? `${stopCount} stop(s)` : "Direct",
  };
}

export function buildFlightSegmentFromTrip(
  trip: any,
  assets: AssetBundle = {},
) {
  if (!trip) return [];
  const expandBySegments = (part: any, baseLabel: string) => {
    const journeys = part?.raw?.journey ?? part?.journey ?? [];

    if (Array.isArray(journeys) && journeys.length > 0) {
      const results: any[] = [];
      const isMulticity = journeys.length > 2;
      journeys.forEach((j: any, jIdx: number) => {
        const segs = j?.flightSegments ?? [];
        if (Array.isArray(segs) && segs.length > 0) {
          const isSingleJourney = journeys.length === 1;
          const journeyLabel = isSingleJourney
            ? "Departure flight"
            : isMulticity
              ? `Flight ${String(jIdx + 1).padStart(2, "0")}`
              : jIdx === 0
                ? "Departure flight"
                : jIdx === 1
                  ? "Return flight"
                  : `Flight ${String(jIdx + 1).padStart(2, "0")}`;
          segs.forEach((seg: any, sIdx: number) => {
            const partClone = {
              ...part,
              raw: {
                ...(part?.raw || {}),
                journey: [
                  {
                    ...(j || {}),
                    flightSegments: [seg],
                  },
                ],
              },
              journey: [
                {
                  ...(j || {}),
                  flightSegments: [seg],
                },
              ],
            };
            const label =
              segs.length > 1
                ? `${journeyLabel} - Segment ${sIdx + 1}`
                : journeyLabel;
            results.push(mapFlightSegment(partClone, assets, label));
          });
        }
      });
      if (results.length > 0) return results;
    }

    // Fallback: single or missing journeys/segments
    return [mapFlightSegment(part, assets, baseLabel)];
  };

  // Prefer using top-level RAW journeys directly when present
  if (Array.isArray(trip?.raw?.journey) && trip.raw.journey.length > 0) {
    return expandBySegments(trip, "Trip");
  }

  return expandBySegments(trip, "Departure flight");
}

export function getPriceCabinClassForFlightSummary(trip: any) {
  // Handle new structure from pending bookings (trip.raw.fare.fareBreakdown)
  // Original logic for normal bookings (trip.price)
  // if (!trip?.price) return null;
  if (Array.isArray(trip.price) && trip.price.length > 0) return trip.price[0];
  if (typeof trip.price === "object" && trip.price !== null) {
    const values = Object.values(trip.price);
    if (values.length > 0) return values[0];
  }

  if (
    trip?.raw?.fare?.fareBreakdown &&
    Array.isArray(trip.raw.fare.fareBreakdown) &&
    trip.raw.fare.fareBreakdown.length > 0
  ) {
    const fareType = trip.raw.fare.fareBreakdown[0]?.fareType;
    if (fareType) {
      // Get cabin class from first segment
      const firstJourney = trip?.raw?.journey?.[0];
      const firstSegment = firstJourney?.flightSegments?.[0];
      const cabinClass = firstSegment?.cabinClass || "Economy";
      const priceClassName = firstSegment?.priceClassName || "Economy";

      // Format as "Economy - ECO FLEX" or "Economy - Economy"
      const formattedLabel = `${cabinClass} - ${priceClassName}`;

      return {
        _priceClasses: [fareType],
        label: formattedLabel,
      };
    }
  }
  return null;
}

export function timeToMinutesFromAnyString(t?: string | null) {
  if (!t) return null;
  if (/\d{4}-\d{2}-\d{2}T/.test(t)) {
    const d = new Date(t);
    if (!isNaN(d.getTime())) return d.getHours() * 60 + d.getMinutes();
  }

  const hhmm = t.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
  if (hhmm) {
    const h = Number(hhmm[1]);
    const m = Number(hhmm[2]);
    return h * 60 + m;
  }

  const ampm = t.match(/^(\d{1,2}):(\d{2})\s*([AaPp][Mm])$/);
  if (ampm) {
    let h = Number(ampm[1]);
    const m = Number(ampm[2]);
    const period = ampm[3].toLowerCase();
    if (period === "pm" && h !== 12) h += 12;
    if (period === "am" && h === 12) h = 0;
    return h * 60 + m;
  }

  const fallback = new Date(t);
  if (!isNaN(fallback.getTime()))
    return fallback.getHours() * 60 + fallback.getMinutes();

  return null;
}

export const generateUUID = () =>
  typeof crypto !== "undefined" &&
  typeof (crypto as any).randomUUID === "function"
    ? (crypto as any).randomUUID()
    : `uuid-${Date.now()}-${Math.random().toString(16).slice(2)}`;

export function formatDateToLocalISO(date: Date | null): string | null {
  if (!date) return null;
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function parseLocalDateString(
  dateStr: string | null | undefined,
): Date | null {
  if (!dateStr) return null;
  const [y, m, d] = dateStr.split("-");
  if (!y || !m || !d) return null;
  return new Date(Number(y), Number(m) - 1, Number(d)); // local midnight
}

/** Compare calendar day only (ignores time); for syncing controlled date pickers. */
export function sameCalendarDate(
  a: Date | null,
  b: Date | null,
): boolean {
  if (a == null && b == null) return true;
  if (a == null || b == null) return false;
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export const formatMoney = (
  value: number | undefined | null,
  currency = "USD",
) => {
  if (value == null || Number.isNaN(value)) return "—";
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
    }).format(value);
  } catch {
    return `${value} ${currency}`;
  }
};

export const warningToast = (message: string) => {
  toast(message, {
    icon: "⚠️",
  });
};

export const formatTo12Hour = (time?: string) => {
  if (!time) return "";
  const [hours, minutes] = time.split(":").map(Number);

  const period = hours >= 12 ? "PM" : "AM";
  const formattedHours = hours % 12 || 12;

  return `${formattedHours}:${minutes.toString().padStart(2, "0")} ${period}`;
};

export const filterEmailInput = (value: string): string => {
  // Allow only alphanumeric characters and common email special chars: @ . _ - +
  return value.replace(/[^a-zA-Z0-9@._+\-]/g, "");
};

export const timeToMinutes = (time: string): number => {
  const [h, m] = time.split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
};

export const minutesToTime = (minutes: number): string => {
  const totalMinutes = Math.min(minutes, 1439);
  const h24 = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  const period = h24 < 12 ? "AM" : "PM";
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return m === 0
    ? `${h12}${period}`
    : `${h12}:${m.toString().padStart(2, "0")}${period}`;
};

export const minutesToHHMM = (minutes: number): string => {
  const h = Math.floor(minutes / 60)
    .toString()
    .padStart(2, "0");
  const m = (minutes % 60).toString().padStart(2, "0");
  return `${h}:${m}`;
};
