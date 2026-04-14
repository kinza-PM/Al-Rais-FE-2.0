import type { SightseeingBookingSummary } from "../features/sightseeing/sightseeingBooking";
import {
  inferSightseeingCountryFromLocationLine,
  type SightseeingBookingCardItem,
} from "./transformBookingData";
import { readSightseeingCardPreview } from "../features/sightseeing/sightseeingBooking";

const EMPTY_DRAFT: SightseeingBookingSummary["draft"] = {
  selectedRateKey: "",
  adults: 1,
  teens: 0,
  children: 0,
  selectedTourDate: "",
  pickupTime24: "",
  falconAddon: false,
};

/** Map My Bookings card data into the same summary shape used by the confirmation ticket / PDF. */
export function sightseeingCardToBookingSummary(
  booking: SightseeingBookingCardItem,
): SightseeingBookingSummary {
  const preview = booking.activityCode
    ? readSightseeingCardPreview(booking.activityCode)
    : undefined;
  const imageSrc = preview?.imageSrc?.trim() || "";

  return {
    activityCode: booking.activityCode || "",
    title: booking.activityTitle,
    imageSrc,
    categoryLabel:
      booking.locationLabel?.trim() ||
      preview?.categoryLabel?.trim() ||
      "Sightseeing",
    countryLabel:
      booking.countryLabel?.trim() ||
      preview?.countryName?.trim() ||
      inferSightseeingCountryFromLocationLine(booking.locationLabel) ||
      booking.locationLabel?.trim() ||
      "",
    durationLabel:
      booking.activityDurationDisplay?.trim() ||
      preview?.durationLabel ||
      "—",
    groupLabel: preview?.groupLabel?.trim() || "",
    packageSummary:
      booking.packageSummary && booking.packageSummary !== "—"
        ? booking.packageSummary
        : "—",
    travellersSummary: booking.travellersSummary || "—",
    pickupDateDisplay:
      booking.tourDateDisplay && booking.tourDateDisplay !== "—"
        ? booking.tourDateDisplay
        : "—",
    pickupTimeDisplay:
      booking.pickupTimeDisplay && booking.pickupTimeDisplay !== "—"
        ? booking.pickupTimeDisplay
        : "",
    enhancementsSummary: "",
    grandTotal: booking.totalPaid ?? 0,
    currency: booking.currency || "AED",
    draft: { ...EMPTY_DRAFT },
  };
}

/** Best-effort lead line when we don’t have a separate API field. */
export function leadGuestDisplayFromCard(booking: SightseeingBookingCardItem): string {
  const t = booking.travellersSummary?.trim();
  if (!t || t === "—") return "Guest";
  const first = t.split("•")[0]?.split(",")[0]?.trim();
  return first || t;
}
