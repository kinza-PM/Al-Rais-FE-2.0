import { formatTime, formatDate } from "./helpers";
import type { BookingStatus } from "../components/molecules/UserBookingsListing";

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

  // Get booking reference - only show if status is Confirmed (active)
  const bookingRef =
    status === "Confirmed"
      ? apiItem.bookingReferenceId ||
        apiItem.detail?.supplierLocator ||
        apiItem.detail?.airlineLocators?.[0]?.airlineLocator ||
        apiItem.offerId?.split("-")[0] ||
        "N/A"
      : null;

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
    status === "Confirmed" ? apiItem.ticketImage ?? null : null;

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
