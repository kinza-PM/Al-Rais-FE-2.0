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

/** Long weekday date (en-GB), aligned with the shared calendar picker display. */
export function formatPickupDateLong(isoYmd: string): string {
  const raw = isoYmd.trim();
  if (!raw) return "";
  const parts = raw.split("-").map((x) => x.trim());
  if (parts.length < 3) return formatDateDMY(raw);
  const y = Number(parts[0]);
  const m = Number(parts[1]);
  const d = Number(parts[2]);
  if (!y || !m || !d) return formatDateDMY(raw);
  const date = new Date(y, m - 1, d);
  if (Number.isNaN(date.getTime())) return formatDateDMY(raw);
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

/** 12-hour label for summary, e.g. `4:38 AM` (matches custom time picker display). */
export function formatTime12Hour(hhmm: string): string {
  if (!hhmm || !/^\d{1,2}:\d{2}$/.test(hhmm)) return "";
  const [hs, ms] = hhmm.split(":");
  let h = parseInt(hs, 10);
  const m = parseInt(ms, 10);
  if (Number.isNaN(h) || Number.isNaN(m)) return "";
  const period = h >= 12 ? "PM" : "AM";
  h = h % 12;
  if (h === 0) h = 12;
  return `${h}:${String(m).padStart(2, "0")} ${period}`;
}

/** Map traveler nationality labels (dropdown) to ISO-3166 alpha-2 for API holder.country. */
const NATIONALITY_LABEL_TO_ISO2: Record<string, string> = {
  "United Arab Emirates": "AE",
  "United States": "US",
  "United Kingdom": "GB",
  "Saudi Arabia": "SA",
  Pakistan: "PK",
  India: "IN",
  France: "FR",
  Germany: "DE",
  Italy: "IT",
  Spain: "ES",
  Canada: "CA",
  Australia: "AU",
  Egypt: "EG",
  Jordan: "JO",
  Kuwait: "KW",
  Qatar: "QA",
  Oman: "OM",
  Bahrain: "BH",
  Turkey: "TR",
  Malaysia: "MY",
  Singapore: "SG",
  China: "CN",
  Japan: "JP",
  "South Korea": "KR",
  Brazil: "BR",
  Mexico: "MX",
  "South Africa": "ZA",
  Nigeria: "NG",
  Morocco: "MA",
  Russia: "RU",
  Netherlands: "NL",
  Belgium: "BE",
  Switzerland: "CH",
  Sweden: "SE",
  Norway: "NO",
  Ireland: "IE",
  "New Zealand": "NZ",
};

export function nationalityLabelToIso2(label: string): string {
  const t = label.trim();
  if (!t) return "AE";
  return NATIONALITY_LABEL_TO_ISO2[t] ?? "AE";
}

/** Split a single full name into HB-style given name + surname. */
export function splitSightseeingFullName(fullName: string): {
  name: string;
  surname: string;
} {
  const t = fullName.trim().replace(/\s+/g, " ");
  if (!t) return { name: "", surname: "" };
  const space = t.indexOf(" ");
  if (space === -1) return { name: t, surname: t };
  return {
    name: t.slice(0, space).trim(),
    surname: t.slice(space + 1).trim() || t.slice(0, space).trim(),
  };
}

export type ActivityBookingHolderInput = {
  surname: string;
  name: string;
  email: string;
  title?: string;
  country?: string;
};

export function buildActivityBookingHolderFromLeadTraveler(
  traveler: SightseeingAdultTravelerForm,
): ActivityBookingHolderInput {
  const { name, surname } = splitSightseeingFullName(traveler.fullName);
  return {
    title: traveler.title.trim() || "Mr",
    name,
    surname,
    email: traveler.email.trim(),
    country: nationalityLabelToIso2(traveler.nationality),
  };
}

/** Returns an error message string if invalid; otherwise null. */
export function validateLeadTravelerForActivityBooking(
  traveler: SightseeingAdultTravelerForm | undefined,
): string | null {
  if (!traveler) return "Lead traveler details are missing.";
  if (!traveler.title?.trim()) return "Please select a title for the lead traveler.";
  if (!traveler.fullName?.trim()) return "Please enter the lead full name.";
  const normalizedName = traveler.fullName.trim().replace(/\s+/g, " ");
  if (!normalizedName.includes(" "))
    return "Please enter first and last name for the lead traveler.";
  const { name, surname } = splitSightseeingFullName(traveler.fullName);
  if (!name || !surname) return "Please enter first and last name for the lead traveler.";
  if (!traveler.dateOfBirth?.trim())
    return "Please enter the lead date of birth.";
  if (!traveler.nationality?.trim())
    return "Please select nationality for the lead traveler.";
  const em = traveler.email?.trim() ?? "";
  if (!em || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)) {
    return "Please enter a valid email for the lead traveler.";
  }
  const phone = `${traveler.phoneCountryCode ?? ""}${traveler.phoneNumber ?? ""}`.replace(
    /\s/g,
    "",
  );
  if (!phone || phone.length < 8) {
    return "Please enter a valid phone number for the lead traveler.";
  }
  return null;
}

export function extractActivityBookingReference(
  data: unknown,
): string | undefined {
  if (!data || typeof data !== "object") return undefined;
  const o = data as Record<string, unknown>;
  const booking = o.booking;
  if (booking && typeof booking === "object") {
    const b = booking as Record<string, unknown>;
    const ref = b.reference;
    if (typeof ref === "string" && ref.trim()) return ref.trim();
  }
  const r = o.reference ?? o.bookingReference;
  if (typeof r === "string" && r.trim()) return r.trim();
  return undefined;
}

export function newSightseeingClientReference(prefix = "ALR-ACT"): string {
  try {
    return `${prefix}-${crypto.randomUUID()}`;
  } catch {
    return `${prefix}-${Date.now()}`;
  }
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
