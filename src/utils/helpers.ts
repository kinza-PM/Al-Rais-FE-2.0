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
  endDate: string
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

export function buildFilterPreferenceForFlightSearchRequest(
  selectedPriceId?: string | null,
  selectedMaxConnections?: number | null
) {
  const maxConnections = typeof selectedMaxConnections === "number" ? selectedMaxConnections : 0;

  const preference = selectedPriceId
    ? {
      preference: {
        farePreference: [
          {
            farePreference: selectedPriceId,
          },
        ],
      },
    }
    : undefined;

  return preference ? { ...preference, maxConnections } : { maxConnections };
}

export function mapFlightSegment(item: any, assets: AssetBundle = {}, defaultHeading = "Flight") {
  const fd = item?.flight_detail ?? item ?? {};

  const journeySegments =
    item?.raw?.journey?.[0]?.flightSegments ??
    item?.journey?.[0]?.flightSegments ??
    item?.flightSegments ??
    [];

  const firstSeg = Array.isArray(journeySegments) && journeySegments.length > 0 ? journeySegments[0] : null;
  const lastSeg = Array.isArray(journeySegments) && journeySegments.length > 0 ? journeySegments[journeySegments.length - 1] : null;

  const departureCode =
    fd?.departureCode ||
    fd?.dep_code ||
    firstSeg?.departureAirportCode ||
    firstSeg?.departureAirport ||
    fd?.originCode ||
    "";

  const arrivalCode =
    fd?.arrivalCode ||
    fd?.arr_code ||
    lastSeg?.arrivalAirportCode ||
    lastSeg?.arrivalAirport ||
    fd?.destinationCode ||
    "";

  const route = `${departureCode || "—"} → ${arrivalCode || "—"}`;

  const flightNumber = fd?.flight_number ?? fd?.flightNo ?? firstSeg?.flightNumber ?? "—";
  const flightClass = fd?.flight_class ?? fd?.cabinClass ?? firstSeg?.cabinClass ?? "—";

  const cabinTitle =
    fd?.cabin_allowance ??
    (firstSeg?.baggageAllowance?.carryOnBaggage?.[0]?.value ? `${firstSeg.baggageAllowance.carryOnBaggage[0].value}${firstSeg.baggageAllowance.carryOnBaggage[0].unit ?? ""}` : "1PC");
  const baggageTitle =
    fd?.baggage ??
    (firstSeg?.baggageAllowance?.checkedInBaggage?.[0]?.value ? `${firstSeg.baggageAllowance.checkedInBaggage[0].value}${firstSeg.baggageAllowance.checkedInBaggage[0].unit ?? ""}` : "20KG");

  const stopCount =
    (Array.isArray(item?.stop) && item.stop.length) ||
    (typeof item?.stop === "number" && item.stop) ||
    item?.stopQuantity ||
    0;

  const depTime = fd?.start_time ?? fd?.dep_time ?? (firstSeg?.departureDateTime ? formatTime(firstSeg.departureDateTime) : null) ?? "—";
  const depDate = fd?.start_date ?? fd?.dep_date ?? (firstSeg?.departureDateTime ? formatDate(firstSeg.departureDateTime) : null) ?? "—";
  const arrTime = fd?.end_time ?? fd?.arr_time ?? (lastSeg?.arrivalDateTime ? formatTime(lastSeg.arrivalDateTime) : null) ?? "—";
  const arrDate = fd?.end_date ?? fd?.arr_date ?? (lastSeg?.arrivalDateTime ? formatDate(lastSeg.arrivalDateTime) : null) ?? "—";

  return {
    heading: defaultHeading,
    route,
    airlineLogo: item?.logo ?? item?.outbound?.logo ?? assets.EmirateLogo ?? "",
    airlineName: item?.name ?? item?.airlineName ?? item?.outbound?.name ?? "Airline",
    flightMeta: `${flightNumber} – ${flightClass}`,
    amenities: [
      { src: assets.cabinIcon ?? "", alt: "Cabin", title: `Cabin: ${cabinTitle}` },
      { src: assets.baggageIcon ?? "", alt: "Baggage", title: `Baggage: ${baggageTitle}` },
      { src: assets.mealIcon ?? "", alt: "Meal", title: fd?.meal ? "Meal Included" : "No meal" },
      { src: assets.wifiIcon ?? "", alt: "Wi-Fi", title: fd?.wifi ? "WiFi Available" : "—" },
      { src: assets.portIcon ?? "", alt: "Ports", title: "USB Ports" },
      { src: assets.entertainmentIcon ?? "", alt: "Entertainment", title: "Entertainment" },
    ],
    dep: {
      time: depTime,
      date: depDate,
    },
    arr: {
      time: arrTime,
      date: arrDate,
    },
    durationLabel: fd?.duration ?? fd?.flight_time ?? item?.flight?.flightInfo?.duration ?? "—",
    tag: stopCount > 0 ? `${stopCount} stop(s)` : "Direct",
  };
}

export function buildFlightSegmentFromTrip(trip: any, assets: AssetBundle = {}) {
  if (!trip) return [];
  if (trip.outbound || trip.inbound) {
    const segments: any[] = [];
    if (trip.outbound) segments.push(mapFlightSegment(trip.outbound, assets, "Departure flight"));
    if (trip.inbound) segments.push(mapFlightSegment(trip.inbound, assets, "Return flight"));
    return segments;
  }
  return [mapFlightSegment(trip, assets, "Departure flight")];
}

export function getPriceCabinClassForFlightSummary(trip: any) {
  if (!trip?.price) return null;
  if (Array.isArray(trip.price) && trip.price.length > 0) return trip.price[0];
  if (typeof trip.price === "object" && trip.price !== null) {
    const values = Object.values(trip.price);
    if (values.length > 0) return values[0];
  }
  return null;
}