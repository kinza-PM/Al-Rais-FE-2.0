import { formatTime, formatDate } from "./helpers";
import type { BookingStatus } from "../components/molecules/UserBookingsListing";
import {
  getCancelledSightseeingBookingRefs,
  type StoredSightseeingBooking,
} from "./sightseeingLocalBookings";

// Helper to format duration
function formatDuration(duration: string): string {
  if (!duration) return "";
  // Convert "17H0M" to "17 hours 0 minutes"
  const match = duration.match(/(\d+)H(\d+)M/);
  if (match) {
    const hours = parseInt(match[1]);
    const minutes = parseInt(match[2]);
    const hourText = hours === 1 ? "hour" : "hours";
    const minuteText = minutes === 1 ? "minute" : "minutes";
    if (minutes === 0) {
      return `${hours} ${hourText}`;
    }
    return `${hours} ${hourText} ${minutes} ${minuteText}`;
  }
  return duration;
}

// Calculate countdown from createdAt (15 minutes total booking time)
function calculateCountdown(createdAt: string): {
  hours: string;
  mins: string;
  secs: string;
} {
  if (!createdAt) return { hours: "00", mins: "00", secs: "00" };

  const createdTime = new Date(createdAt).getTime();
  const currentTime = new Date().getTime();
  const elapsedMs = currentTime - createdTime;

  // Total booking time is 15 minutes (900000 ms)
  const totalMs = 15 * 60 * 1000;
  const remainingMs = Math.max(0, totalMs - elapsedMs);

  const remainingMinutes = Math.floor(remainingMs / 60000);
  const remainingSeconds = Math.floor((remainingMs % 60000) / 1000);

  const hours = Math.floor(remainingMinutes / 60);
  const mins = remainingMinutes % 60;
  const secs = remainingSeconds;

  return {
    hours: String(hours).padStart(2, "0"),
    mins: String(mins).padStart(2, "0"),
    secs: String(secs).padStart(2, "0"),
  };
}

// Transform a single booking from API response
export function transformBookingItem(apiItem: any): any {
  // Map status: API returns completed/active -> Confirmed, pending -> Pending, expired -> Expired
  const statusMap: Record<string, BookingStatus> = {
    expired: "Expired",
    pending: "Pending",
    active: "Confirmed",
    completed: "Confirmed",
    cancelled: "Cancelled",
    canceled: "Cancelled",
    void: "Cancelled",
    refunded: "Cancelled",
  };

  const status = statusMap[apiItem.status?.toLowerCase()] || "Pending";

  // Get journeys
  const journeys = apiItem.request?.journey || [];
  const isRoundTrip = journeys.length > 1;

  // Get passenger count
  const passengerCount = apiItem.request?.passengers?.length || 1;
  const passengerLabel =
    passengerCount === 1
      ? `${passengerCount} Passenger`
      : `${passengerCount} Passenges`;

  /** Pending: no confirmed PNR yet — hide ref on the card. Cancelled / expired still show locator when API sends it. */
  const bookingRefResolved =
    apiItem.bookingReferenceId ||
    apiItem.detail?.supplierLocator ||
    apiItem.detail?.airlineLocators?.[0]?.airlineLocator ||
    apiItem.offerId?.split("-")[0] ||
    null;

  const bookingRef =
    status === "Pending" || status === "Expired"
      ? null
      : (bookingRefResolved ?? "N/A");

  // Calculate countdown for pending bookings
  const countdown =
    status === "Pending" && apiItem.createdAt
      ? calculateCountdown(apiItem.createdAt)
      : null;

  // Transform each journey
  const transformedJourneys = journeys
    .map((journey: any, journeyIndex: number) => {
      const flightSegments = journey?.flightSegments || [];
      if (flightSegments.length === 0) return null;

      const firstSegment = flightSegments[0];
      const lastSegment = flightSegments[flightSegments.length - 1];

      // Get airline info from first segment
      const marketingAirline =
        firstSegment.marketingAirline || firstSegment.operatingAirline || "";
      const flightNumber = firstSegment.flightNumber || "";

      // Get cabin class
      const cabinClass =
        firstSegment.cabinClass || firstSegment.priceClassName || "Economy";

      // Get duration for the journey
      const journeyDuration = journey?.flight?.flightInfo?.duration || "";

      // Check if direct (no stops)
      const isDirect =
        flightSegments.length === 1 && journey?.flight?.stopQuantity === 0;

      return {
        journeyIndex,
        airline: {
          name: marketingAirline ? `${marketingAirline} Airlines` : "Airline",
          code: marketingAirline,
          flightNo: flightNumber,
          cabin: cabinClass,
        },
        from: {
          code: firstSegment.departureAirportCode,
          time: formatTime(firstSegment.departureDateTime),
          dateLabel: formatDate(firstSegment.departureDateTime),
        },
        to: {
          code: lastSegment.arrivalAirportCode,
          time: formatTime(lastSegment.arrivalDateTime),
          dateLabel: formatDate(lastSegment.arrivalDateTime),
        },
        durationLabel: formatDuration(journeyDuration),
        isDirect,
        segments: flightSegments,
        raw: {
          journey: [journey],
          flightSegments,
          fare: apiItem.fare,
        },
      };
    })
    .filter(Boolean);

  // Get ticket PDF URL for confirmed bookings (from completed flight)
  const ticketImage =
    status === "Confirmed" ? (apiItem.ticketImage ?? null) : null;

  // Return single booking object with all journeys
  return {
    id: apiItem.offerId,
    type: "flight",
    status,
    isRoundTrip,
    journeys: transformedJourneys,
    passengersLabel: passengerLabel,
    bookingRef,
    countdown,
    offerId: apiItem.offerId,
    createdAt: apiItem.createdAt,
    ticketImage,
    // Store original API item for payment flow
    originalApiItem: apiItem,
  };
}

// Transform booking data to FlightBooking format
export function transformBookingToFlightBookingFormat(booking: any): any {
  if (!booking?.originalApiItem) return null;

  const apiItem = booking.originalApiItem;

  // Build flightDetail structure similar to search results
  const flightDetail = {
    raw: {
      journey: apiItem.request?.journey || [],
      fare: apiItem.fare,
      detail: apiItem.detail,
      financialInfo: apiItem.financialInfo,
    },
  };

  // Build passengersForRequest from API passengers
  const passengersForRequest = (apiItem.request?.passengers || []).map(
    (p: any) => ({
      id: p.passengerKey || String(Math.random()),
      ptc: p.ptc || "ADT",
    }),
  );

  return {
    offerId: apiItem.offerId,
    searchKey:
      apiItem.flightDetails?.[0]?.id || apiItem.offerId?.split("-")[0] || "",
    flightDetail,
    passengersForRequest,
    // Mark as pending booking to skip to payment
    isPendingBooking: true,
    // Store passengers data for pre-filling
    passengersData: apiItem.request?.passengers || [],
  };
}

// Transform API response to booking format
export function transformBookingsResponse(apiResponse: any): any[] {
  if (!apiResponse?.items || !Array.isArray(apiResponse.items)) {
    return [];
  }

  return apiResponse.items.map((item: any) => transformBookingItem(item));
}

// --- Hotel bookings transform ---
export type HotelBookingCardItem = {
  id: string;
  status: BookingStatus;
  hotelName: string;
  address: string;
  checkInTime: string;
  checkInDate: string;
  checkOutTime: string;
  checkOutDate: string;
  totalStay: string;
  roomLabel: string;
  bookingRef: string;
  countdown?: { hours: string; mins: string; secs: string };
  /** Free cancellation deadline date (e.g. "Mon, 16 Jun 2025") */
  cancellationDeadline?: string;
  /** Raw date string for comparison (e.g. "2025-06-16") - used to disable Cancel if past deadline */
  cancellationDeadlineDate?: string;
  /** Required for hotelRetrieve / View details */
  searchKey?: string;
  bookingKey?: string;
  /** Paid total for refund estimate on cancellation page (if API provides it) */
  totalPaid?: number;
  currency?: string;
  imageUrl?: string;
  starRating?: number;
};

function formatDateForHotel(dateStr: string): string {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
      weekday: "short",
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function formatTimeForHotel(dateStr: string, defaultTime: string): string {
  if (!dateStr) return defaultTime;
  if (
    !dateStr.includes("T") &&
    !dateStr.includes(" ") &&
    !dateStr.includes(":")
  ) {
    return defaultTime;
  }
  if (
    dateStr.endsWith("T00:00:00Z") ||
    dateStr.endsWith("T00:00:00.000Z") ||
    dateStr.endsWith("T00:00:00+00:00")
  ) {
    return defaultTime;
  }
  try {
    return new Date(dateStr).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return defaultTime;
  }
}

export function transformHotelBookingItem(apiItem: any): HotelBookingCardItem {
  const statusMap: Record<string, BookingStatus> = {
    expired: "Expired",
    pending: "Pending",
    active: "Confirmed",
    completed: "Confirmed",
    confirmed: "Confirmed",
    cancelled: "Cancelled",
    canceled: "Cancelled",
    void: "Cancelled",
    refunded: "Cancelled",
  };
  const rawStatus = (
    apiItem.status ||
    apiItem.bookingStatus ||
    apiItem.detail?.status ||
    ""
  )
    .toString()
    .toLowerCase();
  const status = statusMap[rawStatus] || "Pending";

  const hotel = apiItem || {};
  // const hotel = apiItem.hotel || apiItem.propertyInfo || apiItem.property || {};
  // console.log('hotel--------------------', apiItem);
  const hotelName =
    hotel.name ||
    hotel.hotelName ||
    apiItem.hotelName ||
    hotel.propertyName ||
    "Hotel";

  const address = apiItem?.verifiedPropertyInfo?.address
    ? `${apiItem.verifiedPropertyInfo.address}${
        apiItem.verifiedPropertyInfo.city
          ? `, ${apiItem.verifiedPropertyInfo.city}`
          : ""
      }${apiItem.verifiedPropertyInfo.country ? `, ${apiItem.verifiedPropertyInfo.country}` : ""}`
    : "";

  let imageUrl =
    hotel.imageUrl || hotel.image || hotel.thumbnail || apiItem.heroImage || "";
  if (!imageUrl && hotel.images && hotel.images.length > 0) {
    imageUrl =
      typeof hotel.images[0] === "string"
        ? hotel.images[0]
        : hotel.images[0]?.url || hotel.images[0]?.path || "";
  }
  const starRating =
    Number(hotel.starRating || hotel.rating || apiItem.starRating) || 0;

  const checkIn =
    apiItem.checkInDate ||
    apiItem.checkIn ||
    apiItem.stayDateRange?.checkIn ||
    hotel.checkInDate ||
    "";
  const checkOut =
    apiItem.checkOutDate ||
    apiItem.checkOut ||
    apiItem.stayDateRange?.checkOut ||
    hotel.checkOutDate ||
    "";

  const totalNights =
    apiItem.totalNights ??
    apiItem.nights ??
    (checkIn && checkOut
      ? Math.ceil(
          (new Date(checkOut).getTime() - new Date(checkIn).getTime()) /
            (1000 * 60 * 60 * 24),
        )
      : 1);
  const totalStay = `Total stay: ${totalNights} ${totalNights === 1 ? "night" : "nights"}`;

  const rooms = apiItem.rooms || apiItem.roomDetails || [];
  const roomParts = rooms.map((r: any) => {
    const count = r.count ?? r.roomCount ?? 1;
    const name = r.roomTypeName ?? r.roomType ?? r.name ?? "Room";
    return `${String(count).padStart(2, "0")}, ${name}`;
  });
  const roomLabel = roomParts.length > 0 ? roomParts.join("; ") : "01, Room";

  const bookingRef =
    apiItem.bookingReferenceId ||
    apiItem.bookingRef ||
    apiItem.bookingReference ||
    apiItem.supplierLocator ||
    apiItem.detail?.supplierLocator ||
    apiItem.id ||
    "N/A";

  const id =
    apiItem.id || apiItem.bookingKey || bookingRef || `hotel-${Date.now()}`;

  const searchKey =
    apiItem.searchKey || apiItem.search_key || apiItem.detail?.searchKey || "";
  const bookingKey = apiItem.bookingKey || apiItem.booking_key || id || "";

  const rawTotal =
    apiItem.totalPaid ??
    apiItem.totalPrice ??
    apiItem.paidAmount ??
    apiItem.grandTotal ??
    apiItem.totalAmount ??
    apiItem.amount ??
    apiItem.financialInfo?.total ??
    hotel?.totalPrice ??
    hotel?.totalAmount;
  const totalNum =
    rawTotal != null && rawTotal !== "" ? Number(rawTotal) : Number.NaN;
  const totalPaid =
    Number.isFinite(totalNum) && totalNum > 0 ? totalNum : undefined;
  const currency =
    apiItem.currency ||
    apiItem.currencyCode ||
    apiItem.detail?.currency ||
    hotel?.currency ||
    "AED";

  const cancellationDeadlineRaw =
    apiItem.lastCancellationDate ||
    apiItem.cancellationDeadline ||
    hotel?.lastCancellationDate ||
    (rooms[0] as any)?.ratePlan?.lastCancellationDate ||
    (rooms[0] as any)?.lastCancellationDate ||
    "";
  const cancellationDeadline = cancellationDeadlineRaw
    ? formatDateForHotel(cancellationDeadlineRaw)
    : undefined;

  const createdAt = apiItem.createdAt || apiItem.created_at;
  const countdown =
    status === "Pending" && createdAt
      ? (() => {
          const createdTime = new Date(createdAt).getTime();
          const currentTime = Date.now();
          const totalMs = 15 * 60 * 1000;
          const remainingMs = Math.max(
            0,
            totalMs - (currentTime - createdTime),
          );
          const mins = Math.floor(remainingMs / 60000);
          const secs = Math.floor((remainingMs % 60000) / 1000);
          return {
            hours: String(Math.floor(mins / 60)).padStart(2, "0"),
            mins: String(mins % 60).padStart(2, "0"),
            secs: String(secs).padStart(2, "0"),
          };
        })()
      : undefined;

  return {
    id,
    status,
    hotelName,
    address,
    checkInTime: formatTimeForHotel(checkIn, ""),
    checkInDate: formatDateForHotel(checkIn) || "—",
    checkOutTime: formatTimeForHotel(checkOut, ""),
    checkOutDate: formatDateForHotel(checkOut) || "—",
    totalStay,
    roomLabel,
    bookingRef,
    countdown,
    cancellationDeadline,
    cancellationDeadlineDate: cancellationDeadlineRaw || undefined,
    searchKey: searchKey || undefined,
    bookingKey: bookingKey || undefined,
    totalPaid,
    currency: currency || "AED",
    imageUrl,
    starRating,
  };
}

export function transformHotelBookingsResponse(
  apiResponse: any,
): HotelBookingCardItem[] {
  if (apiResponse == null) return [];
  const raw =
    apiResponse?.data?.items ??
    apiResponse?.data?.data ??
    apiResponse?.data ??
    apiResponse?.items ??
    apiResponse?.bookings ??
    apiResponse?.body ??
    apiResponse;
  const items = Array.isArray(raw) ? raw : [];
  try {
    return items.map((item: any) => transformHotelBookingItem(item));
  } catch {
    return [];
  }
}

// --- Sightseeing / activities bookings (My Bookings tab) ---

export type SightseeingBookingCardItem = {
  id: string;
  status: BookingStatus;
  activityTitle: string;
  activityCode: string;
  /** City / region line when API sends it (separate from country). */
  locationLabel?: string;
  /** Country name under title (Figma). */
  countryLabel?: string;
  tourDateDisplay: string;
  pickupTimeDisplay: string;
  /** Human-readable duration e.g. "6 hours" (Figma “Activity time”). */
  activityDurationDisplay?: string;
  travellersSummary: string;
  packageSummary: string;
  bookingRef: string;
  clientReference?: string;
  /** Supplier / gateway key when available (cancellation). */
  bookingKey?: string;
  cancellationDeadline?: string;
  cancellationDeadlineDate?: string;
  countdown?: { hours: string; mins: string; secs: string };
  totalPaid?: number;
  currency: string;
  /** Supplier non-refundable portion when API sends it (refund breakdown). */
  nonRefundableFees?: number;
  /** Cancellation penalty when API sends it (refund breakdown). */
  cancellationPenalty?: number;
  /** Newest-first ordering when merging API + local lists */
  sortTimestamp?: number;
};

function pickSightseeingNonNegativeAmount(
  ...vals: unknown[]
): number | undefined {
  for (const v of vals) {
    if (v == null || v === "") continue;
    const n = typeof v === "number" ? v : Number(String(v));
    if (Number.isFinite(n) && n >= 0) return n;
  }
  return undefined;
}

/** "City, Country" or "Lahore, Pakistan" → prefer last segment as country. */
export function inferSightseeingCountryFromLocationLine(
  line: string | undefined,
): string | undefined {
  const s = line?.trim();
  if (!s) return undefined;
  const parts = s
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean);
  if (parts.length >= 2) return parts[parts.length - 1];
  if (parts.length === 1) return parts[0];
  return undefined;
}

function extractSightseeingCountryLabel(
  activity: Record<string, unknown>,
  apiItem: Record<string, unknown>,
): string | undefined {
  const str = (v: unknown) =>
    typeof v === "string" && v.trim() ? v.trim() : undefined;

  const countryObj = apiItem.country;
  if (countryObj && typeof countryObj === "object") {
    const o = countryObj as Record<string, unknown>;
    const n = str(o.name) || str(o.description) || str(o.label);
    if (n) return n;
  }

  const fromApi =
    str(apiItem.countryName) ||
    str(apiItem.country as string) ||
    str(activity.country as string);
  if (fromApi) return fromApi;

  const ac = activity.country;
  if (ac && typeof ac === "object") {
    const o = ac as Record<string, unknown>;
    const n = str(o.name) || str(o.description);
    if (n) return n;
  }

  const dest = apiItem.destination;
  if (dest && typeof dest === "object") {
    const d = dest as Record<string, unknown>;
    const c = d.country;
    if (typeof c === "string" && c.trim()) return c.trim();
    if (c && typeof c === "object") {
      const cn = (c as Record<string, unknown>).name;
      if (typeof cn === "string" && cn.trim()) return cn.trim();
    }
  }

  const detail = apiItem.detail;
  if (detail && typeof detail === "object") {
    const nested = extractSightseeingCountryLabel(
      activity,
      detail as Record<string, unknown>,
    );
    if (nested) return nested;
  }

  return undefined;
}

export function transformSightseeingBookingItem(
  apiItem: any,
): SightseeingBookingCardItem {
  const statusMap: Record<string, BookingStatus> = {
    expired: "Expired",
    pending: "Pending",
    active: "Confirmed",
    completed: "Confirmed",
    confirmed: "Confirmed",
    cancelled: "Cancelled",
    canceled: "Cancelled",
    void: "Cancelled",
    refunded: "Cancelled",
  };
  const nestedBooking =
    apiItem.booking && typeof apiItem.booking === "object"
      ? (apiItem.booking as Record<string, unknown>)
      : null;
  const rawStatus = (
    apiItem.status ||
    apiItem.bookingStatus ||
    nestedBooking?.status ||
    ""
  )
    .toString()
    .toLowerCase();
  const status = statusMap[rawStatus] || "Pending";

  const activity =
    apiItem.activity ||
    apiItem.activityInfo ||
    apiItem.product ||
    apiItem.detail?.activity ||
    {};
  const activityRec =
    activity && typeof activity === "object"
      ? (activity as Record<string, unknown>)
      : {};
  const activityTitle =
    activity.name ||
    activity.title ||
    apiItem.activityName ||
    apiItem.title ||
    apiItem.productName ||
    "Sightseeing activity";

  const activityCode =
    activity.code ||
    apiItem.activityCode ||
    apiItem.productCode ||
    apiItem.code ||
    "";

  const tourDateRaw =
    apiItem.tourDate ||
    apiItem.activityDate ||
    apiItem.from ||
    apiItem.date ||
    apiItem.serviceDate ||
    "";
  const tourDateDisplay = tourDateRaw ? formatDateForHotel(tourDateRaw) : "—";

  const pickupTimeDisplay =
    apiItem.pickupTime ||
    apiItem.pickupTimeDisplay ||
    activity.pickupTime ||
    "";

  const travellersSummary =
    apiItem.travellersSummary ||
    apiItem.paxSummary ||
    apiItem.travelersLabel ||
    (typeof apiItem.paxCount === "number"
      ? `${apiItem.paxCount} travellers`
      : "—");

  const packageSummary =
    apiItem.packageSummary || apiItem.modalityName || apiItem.rateName || "";

  const locationLabelRaw =
    apiItem.destinationLabel ||
    apiItem.destinationName ||
    apiItem.cityCountry ||
    apiItem.location ||
    apiItem.destination?.name ||
    [activity.city, activity.country || activity.countryCode]
      .filter((x: unknown) => typeof x === "string" && String(x).trim())
      .join(", ") ||
    "";
  const locationLabel =
    typeof locationLabelRaw === "string" && locationLabelRaw.trim()
      ? locationLabelRaw.trim()
      : undefined;

  let countryLabel =
    extractSightseeingCountryLabel(
      activityRec,
      apiItem as Record<string, unknown>,
    ) || undefined;
  if (!countryLabel && nestedBooking) {
    countryLabel =
      extractSightseeingCountryLabel(
        activityRec,
        nestedBooking as Record<string, unknown>,
      ) || undefined;
  }
  if (!countryLabel) {
    countryLabel =
      inferSightseeingCountryFromLocationLine(locationLabel) ||
      inferSightseeingCountryFromLocationLine(
        typeof apiItem.cityCountry === "string"
          ? apiItem.cityCountry
          : undefined,
      );
  }

  const durLabelStr = (() => {
    const nb = nestedBooking as Record<string, unknown> | null;
    const apiDur =
      apiItem.durationLabel ??
      (typeof nb?.durationLabel === "string" ? nb.durationLabel : undefined) ??
      (typeof nb?.activityDuration === "string"
        ? nb.activityDuration
        : undefined);
    if (typeof apiDur === "string" && apiDur.trim()) return apiDur.trim();
    const act = activity as { durationLabel?: string; duration?: string };
    if (typeof act.durationLabel === "string" && act.durationLabel.trim()) {
      return act.durationLabel.trim();
    }
    if (typeof act.duration === "string" && act.duration.trim()) {
      return act.duration.trim();
    }
    return "";
  })();

  const durHRaw =
    apiItem.durationHours ?? apiItem.durationInHours ?? apiItem.activityHours;
  const durH =
    typeof durHRaw === "number"
      ? durHRaw
      : typeof durHRaw === "string"
        ? Number(durHRaw)
        : Number.NaN;
  const durDays = Number(
    apiItem.durationDays ??
      activity.duration ??
      apiItem.modalityDuration ??
      (nestedBooking as Record<string, unknown> | null)?.durationDays ??
      NaN,
  );
  const durHNested = (() => {
    const nb = nestedBooking as Record<string, unknown> | null;
    const v = nb?.durationHours ?? nb?.durationInHours ?? nb?.activityHours;
    if (typeof v === "number") return v;
    if (typeof v === "string") return Number(v);
    return Number.NaN;
  })();
  const durHEffective = Number.isFinite(durH) ? durH : durHNested;

  let activityDurationDisplay: string | undefined;
  if (Number.isFinite(durHEffective) && durHEffective > 0) {
    const h = Math.round(durHEffective);
    activityDurationDisplay = `${h} hour${h === 1 ? "" : "s"}`;
  } else if (Number.isFinite(durDays) && durDays > 0) {
    const hours = Math.round(durDays * 24);
    if (hours > 0 && hours < 24) {
      activityDurationDisplay = `${hours} hour${hours === 1 ? "" : "s"}`;
    } else {
      const d = Math.round(durDays * 10) / 10;
      activityDurationDisplay = `${d} day${d === 1 ? "" : "s"}`;
    }
  } else if (durLabelStr) {
    activityDurationDisplay = durLabelStr;
  }

  const bookingRef =
    apiItem.bookingReferenceId ||
    apiItem.bookingRef ||
    apiItem.bookingReference ||
    apiItem.reference ||
    apiItem.supplierLocator ||
    apiItem.detail?.bookingReference ||
    apiItem.id ||
    "N/A";

  const clientReference =
    apiItem.clientReference ||
    apiItem.client_reference ||
    apiItem.detail?.clientReference;

  const bookingKey =
    apiItem.bookingKey ||
    apiItem.booking_key ||
    apiItem.operationId ||
    apiItem.detail?.bookingKey ||
    "";

  const cancellationDeadlineRaw =
    apiItem.lastCancellationDate ||
    apiItem.cancellationDeadline ||
    apiItem.freeCancellationUntil ||
    apiItem.cancellationDeadlineDate ||
    activity.lastCancellationDate ||
    "";
  const cancellationDeadline = cancellationDeadlineRaw
    ? formatDateForHotel(cancellationDeadlineRaw)
    : undefined;

  const id =
    apiItem.id ||
    apiItem.bookingKey ||
    `${bookingRef}-${activityCode}` ||
    `sight-${Date.now()}`;

  const rawTotal =
    apiItem.totalPaid ??
    apiItem.grandTotal ??
    apiItem.totalAmount ??
    apiItem.amount ??
    apiItem.financialInfo?.total;
  const totalNum =
    rawTotal != null && rawTotal !== "" ? Number(rawTotal) : Number.NaN;
  const totalPaid =
    Number.isFinite(totalNum) && totalNum > 0 ? totalNum : undefined;
  const currency =
    apiItem.currency || apiItem.currencyCode || activity.currency || "AED";

  const fin =
    apiItem.financialInfo && typeof apiItem.financialInfo === "object"
      ? (apiItem.financialInfo as Record<string, unknown>)
      : null;
  const nbFin =
    nestedBooking?.financialInfo &&
    typeof nestedBooking.financialInfo === "object"
      ? (nestedBooking.financialInfo as Record<string, unknown>)
      : null;

  const nonRefundableFees = pickSightseeingNonNegativeAmount(
    apiItem.nonRefundableCarrierFees,
    apiItem.nonRefundableFees,
    apiItem.nonRefundableAmount,
    apiItem.carrierFees,
    apiItem.nonRefundableTotal,
    fin?.nonRefundable,
    fin?.nonRefundableFees,
    fin?.nonRefundableAmount,
    fin?.carrierFees,
    nestedBooking?.nonRefundableCarrierFees,
    nestedBooking?.nonRefundableFees,
    nestedBooking?.nonRefundableAmount,
    nestedBooking?.carrierFees,
    nbFin?.nonRefundable,
    nbFin?.nonRefundableFees,
  );
  const cancellationPenalty = pickSightseeingNonNegativeAmount(
    apiItem.cancellationPenalty,
    apiItem.cancellationFee,
    apiItem.cancellationCharge,
    apiItem.penaltyAmount,
    apiItem.cancellationCharges,
    fin?.cancellationPenalty,
    fin?.penalty,
    fin?.cancellationFee,
    nestedBooking?.cancellationPenalty,
    nestedBooking?.cancellationFee,
    nestedBooking?.cancellationCharge,
    nestedBooking?.penaltyAmount,
    nbFin?.cancellationPenalty,
    nbFin?.penalty,
  );

  const createdAt = apiItem.createdAt || apiItem.created_at;
  const sortTimestamp =
    createdAt != null && createdAt !== ""
      ? new Date(createdAt).getTime()
      : tourDateRaw
        ? new Date(tourDateRaw).getTime()
        : 0;
  const countdown =
    status === "Pending" && createdAt
      ? (() => {
          const createdTime = new Date(createdAt).getTime();
          const currentTime = Date.now();
          const totalMs = 15 * 60 * 1000;
          const remainingMs = Math.max(
            0,
            totalMs - (currentTime - createdTime),
          );
          const mins = Math.floor(remainingMs / 60000);
          const secs = Math.floor((remainingMs % 60000) / 1000);
          return {
            hours: String(Math.floor(mins / 60)).padStart(2, "0"),
            mins: String(mins % 60).padStart(2, "0"),
            secs: String(secs).padStart(2, "0"),
          };
        })()
      : undefined;

  return {
    id,
    status,
    activityTitle,
    activityCode: String(activityCode),
    locationLabel,
    countryLabel: countryLabel || undefined,
    tourDateDisplay,
    pickupTimeDisplay: pickupTimeDisplay || "—",
    activityDurationDisplay,
    travellersSummary,
    packageSummary: packageSummary || "—",
    bookingRef,
    clientReference:
      typeof clientReference === "string" ? clientReference : undefined,
    bookingKey:
      typeof bookingKey === "string" && bookingKey.trim()
        ? bookingKey.trim()
        : undefined,
    cancellationDeadline,
    cancellationDeadlineDate: cancellationDeadlineRaw
      ? String(cancellationDeadlineRaw)
      : undefined,
    countdown,
    totalPaid,
    nonRefundableFees,
    cancellationPenalty,
    currency: currency || "AED",
    sortTimestamp,
  };
}

export function transformSightseeingBookingsResponse(
  apiResponse: any,
): SightseeingBookingCardItem[] {
  if (apiResponse == null) return [];
  const raw =
    apiResponse?.data?.items ??
    apiResponse?.data?.data ??
    apiResponse?.data ??
    apiResponse?.items ??
    apiResponse?.bookings ??
    apiResponse?.body ??
    apiResponse;
  const items = Array.isArray(raw) ? raw : [];
  try {
    return items.map((item: any) => transformSightseeingBookingItem(item));
  } catch {
    return [];
  }
}

function storedToCard(s: StoredSightseeingBooking): SightseeingBookingCardItem {
  const tourDateDisplay = s.tourDateIso
    ? formatDateForHotel(s.tourDateIso)
    : "—";
  return {
    id: s.id,
    status: s.status,
    activityTitle: s.activityTitle,
    activityCode: s.activityCode,
    locationLabel: s.locationLabel?.trim() || undefined,
    countryLabel: s.countryLabel?.trim() || undefined,
    tourDateDisplay,
    pickupTimeDisplay: s.pickupTimeDisplay ?? "—",
    activityDurationDisplay: s.activityDurationDisplay?.trim() || undefined,

    travellersSummary: s.travellersSummary,
    packageSummary: s.packageSummary ?? "—",
    bookingRef: s.bookingRef,
    clientReference: s.clientReference,
    bookingKey: undefined,
    cancellationDeadline: undefined,
    cancellationDeadlineDate: undefined,
    totalPaid: s.grandTotal,
    currency: s.currency || "AED",
    sortTimestamp: new Date(s.confirmedAtIso).getTime(),
  };
}

function applyLocalCancelledSightseeingOverlay(
  items: SightseeingBookingCardItem[],
): SightseeingBookingCardItem[] {
  const cancelled = getCancelledSightseeingBookingRefs();
  if (!cancelled.size) return items;
  return items.map((item) => {
    const ref = item.bookingRef?.trim();
    const clientRef = item.clientReference?.trim();
    const isMarked =
      (ref && ref !== "N/A" && cancelled.has(ref)) ||
      (clientRef ? cancelled.has(clientRef) : false);
    if (!isMarked) return item;
    if (item.status === "Cancelled") return item;
    return { ...item, status: "Cancelled" as const };
  });
}

/** Merge server list with locally stored confirmations; server rows win on same bookingRef. */
export function mergeSightseeingBookingLists(
  apiItems: SightseeingBookingCardItem[],
  localItems: StoredSightseeingBooking[],
): SightseeingBookingCardItem[] {
  const fromLocal = localItems.map(storedToCard);
  const seenRefs = new Set(
    apiItems.map((b) => b.bookingRef).filter((r) => r && r !== "N/A"),
  );
  const extra = fromLocal.filter(
    (b) => b.bookingRef && !seenRefs.has(b.bookingRef),
  );
  const merged = [...apiItems, ...extra];
  const sorted = merged.sort(
    (a, b) => (b.sortTimestamp ?? 0) - (a.sortTimestamp ?? 0),
  );
  return applyLocalCancelledSightseeingOverlay(sorted);
}
