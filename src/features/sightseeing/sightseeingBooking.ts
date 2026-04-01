import type { SightseeingActivity } from "./types";

export type SightseeingBookingDraft = {
  selectedRateKey: string;
  adults: number;
  teens: number;
  children: number;
  /** Local date yyyy-mm-dd */
  selectedTourDate: string;
  /** HH:mm (24h), empty before user picks */
  pickupTime24: string;
  falconAddon: boolean;
};

export type SightseeingDetailNavState = {
  from?: string;
  to?: string;
  preview?: SightseeingActivity;
  context?: {
    country?: string;
    city?: string;
    destinationCode?: string;
  };
  /** When returning from booking summary “Change” */
  draft?: SightseeingBookingDraft;
};

export type SightseeingBookingSummary = {
  activityCode: string;
  title: string;
  imageSrc: string;
  categoryLabel: string;
  durationLabel: string;
  groupLabel: string;
  packageSummary: string;
  travellersSummary: string;
  pickupDateDisplay: string;
  pickupTimeDisplay: string;
  enhancementsSummary: string;
  grandTotal: number;
  currency: string;
  draft: SightseeingBookingDraft;
};

export type SightseeingBookingPageState = {
  summary: SightseeingBookingSummary;
  returnState: SightseeingDetailNavState;
};

/** One form block per adult on the travelers step. */
export type SightseeingAdultTravelerForm = {
  title: string;
  fullName: string;
  /** yyyy-mm-dd for `<input type="date" />` */
  dateOfBirth: string;
  nationality: string;
  email: string;
  phoneCountryCode: string;
  phoneNumber: string;
  whatsappCountryCode: string;
  whatsappNumber: string;
  whatsappSameAsPhone: boolean;
};

export function createEmptyAdultTravelerForm(): SightseeingAdultTravelerForm {
  return {
    title: "",
    fullName: "",
    dateOfBirth: "",
    nationality: "",
    email: "",
    phoneCountryCode: "+1",
    phoneNumber: "",
    whatsappCountryCode: "+1",
    whatsappNumber: "",
    whatsappSameAsPhone: true,
  };
}

/** Same payload as booking summary (travelers step reads `summary.draft.adults`). */
export type SightseeingTravelersPageState = SightseeingBookingPageState;

export function isoDateOnly(raw: string): string {
  const t = raw.trim();
  if (t.length >= 10) return t.slice(0, 10);
  return t;
}

/** Figma-style 26-03-2026 */
export function formatDateDMY(isoYmd: string): string {
  const parts = isoYmd.split("-").map((x) => x.trim());
  if (parts.length < 3) return isoYmd;
  const y = Number(parts[0]);
  const m = Number(parts[1]);
  const d = Number(parts[2]);
  if (!y || !m || !d) return isoYmd;
  return [
    String(d).padStart(2, "0"),
    String(m).padStart(2, "0"),
    String(y),
  ].join("-");
}

/** Display 03:00 PM; empty input → empty string */
export function formatTime12Hour(hhmm: string): string {
  if (!hhmm || !/^\d{1,2}:\d{2}$/.test(hhmm)) return "";
  const [hs, ms] = hhmm.split(":");
  let h = parseInt(hs, 10);
  const m = parseInt(ms, 10);
  if (Number.isNaN(h) || Number.isNaN(m)) return "";
  const period = h >= 12 ? "PM" : "AM";
  h = h % 12;
  if (h === 0) h = 12;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")} ${period}`;
}

export function buildTravellersSummary(
  adults: number,
  teens: number,
  children: number,
): string {
  const parts: string[] = [];
  if (adults > 0) {
    parts.push(adults === 1 ? "1 Adult" : `${adults} Adults`);
  }
  if (teens > 0) {
    parts.push(teens === 1 ? "1 Teen" : `${teens} Teens`);
  }
  if (children > 0) {
    parts.push(children === 1 ? "1 Child" : `${children} Children`);
  }
  return parts.length > 0 ? parts.join(" • ") : "0 travellers";
}
