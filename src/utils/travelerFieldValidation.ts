import { isPossiblePhoneNumber } from "libphonenumber-js";
import { parseLocalDateString } from "./helpers";

/** Start of local calendar day (no time drift). */
export function startOfLocalDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

/**
 * Rules for {@link validatePersonName}. Toggle what to enforce; defaults match typical travel “legal name” fields.
 */
export type PersonNameValidationOptions = {
  /** Used in every message, e.g. `"Surname"`, `"Full name"`, `"Middle name"`. */
  fieldLabel: string;
  minLength?: number;
  maxLength?: number;
  /** Block `123` etc. Default true. */
  disallowDigits?: boolean;
  /** Block `"John  Doe"`. Default true. */
  disallowRepeatedSpaces?: boolean;
  /**
   * Unicode letters only, with single spaces / hyphens / apostrophes between parts (O'Brien, van der Berg).
   * Default true. Set false if you only want length/digit checks.
   */
  unicodeNamePattern?: boolean;
};

const UNICODE_NAME_SEGMENT =
  /^[\p{L}]+(?:[\s'\-][\p{L}]+)*$/u;

/**
 * Single reusable name validator: pass **which** checks apply via `options`.
 * Call after optional “required” checks — empty string returns `null` (nothing to validate).
 *
 * @example
 * validatePersonName(v, { fieldLabel: "Surname" })
 * validatePersonName(v, { fieldLabel: "Full name", minLength: 2 })
 * validatePersonName(v, { fieldLabel: "Alias", unicodeNamePattern: false, disallowDigits: true })
 */
export function validatePersonName(
  raw: string | null | undefined,
  options: PersonNameValidationOptions,
): string | null {
  const label = options.fieldLabel?.trim() || "Name";
  const minLength = options.minLength ?? 2;
  const maxLength = options.maxLength;
  const disallowDigits = options.disallowDigits !== false;
  const disallowRepeatedSpaces = options.disallowRepeatedSpaces !== false;
  const unicodeNamePattern = options.unicodeNamePattern !== false;

  const s = String(raw ?? "").trim();
  if (!s) return null;

  if (disallowRepeatedSpaces && /\s{2,}/.test(s)) {
    return `Use a single space between parts of the ${label.toLowerCase()}.`;
  }
  if (s.length < minLength) {
    return `${label} must be at least ${minLength} characters.`;
  }
  if (maxLength != null && s.length > maxLength) {
    return `${label} must be at most ${maxLength} characters.`;
  }
  if (disallowDigits && /\d/.test(s)) {
    return `${label} cannot contain numbers.`;
  }
  if (unicodeNamePattern && !UNICODE_NAME_SEGMENT.test(s)) {
    return `Use only letters, spaces, hyphens, or apostrophes in the ${label.toLowerCase()}.`;
  }
  return null;
}

/** Dropdown row for flight booking “Title” (values match API / payload). */
export type FlightBookingNameTitleOption = {
  id: string;
  value: string;
  label: string;
};

/**
 * Title choices depend on PTC: adults use Mr/Ms/Mrs; children and infants use Master/Miss.
 */
export function getFlightBookingNameTitleDropdownOptions(
  ptc: string | null | undefined,
): FlightBookingNameTitleOption[] {
  const p = String(ptc ?? "")
    .trim()
    .toUpperCase();
  if (p === "CHD" || p === "INF") {
    return [
      { id: "mstr", value: "MSTR", label: "Master" },
      { id: "miss", value: "MISS", label: "Miss" },
    ];
  }
  return [
    { id: "mr", value: "MR", label: "Mr" },
    { id: "ms", value: "MS", label: "Ms" },
    { id: "mrs", value: "MRS", label: "Mrs" },
  ];
}

/**
 * Map UI/gender to `passengerInfo.gender` (M/F) from the selected title.
 */
export function genderFromFlightBookingNameTitle(
  nameTitle: string | null | undefined,
): "M" | "F" {
  const t = String(nameTitle ?? "")
    .trim()
    .toUpperCase();
  if (t === "MR" || t === "MSTR") return "M";
  return "F";
}

/**
 * When applying a saved traveler to a row, map stored title codes to the option set for this passenger type.
 */
export function mapSavedTravelerTitleToFlightBookingValue(
  ptc: string | null | undefined,
  savedTitle: string | null | undefined,
  genderHint?: string | null,
): string {
  const p = String(ptc ?? "")
    .trim()
    .toUpperCase();
  const v = String(savedTitle ?? "")
    .trim()
    .toUpperCase();
  const g = String(genderHint ?? "")
    .trim()
    .toUpperCase();

  if (p === "CHD" || p === "INF") {
    if (v === "MSTR" || v === "MASTER") return "MSTR";
    if (v === "MISS") return "MISS";
    if (v === "MR") return "MSTR";
    if (v === "MS" || v === "MRS") return "MISS";
    if (g === "M" || g === "MALE") return "MSTR";
    if (g === "F" || g === "FEMALE") return "MISS";
    return "";
  }

  if (v === "MR") return "MR";
  if (v === "MS") return "MS";
  if (v === "MRS") return "MRS";
  if (v === "MSTR" || v === "MASTER") return "MR";
  if (v === "MISS") return "MS";
  return "";
}

/**
 * Ensures `passengerInfo.nameTitle` is allowed for this passenger’s PTC (after “required” checks).
 */
export function validatePassengerNameTitleForPtc(
  ptc: string | null | undefined,
  nameTitle: string | null | undefined,
): string | null {
  const t = String(nameTitle ?? "").trim();
  if (!t) return null;
  const allowed = new Set(
    getFlightBookingNameTitleDropdownOptions(ptc).map((o) => o.value),
  );
  const u = t.toUpperCase();
  if (allowed.has(u)) return null;
  const p = String(ptc ?? "")
    .trim()
    .toUpperCase();
  if (p === "CHD" || p === "INF") {
    return "Select Master or Miss for a child or infant passenger.";
  }
  return "Select Mr, Ms, or Mrs for an adult passenger.";
}

export type PassportNumberOptions = {
  minLen?: number;
  maxLen?: number;
};

/**
 * Typical passport: letters + digits only, bounded length.
 * Spaces are stripped before validation (travel documents are usually entered without spaces).
 */
export function validatePassportNumber(
  raw: string | null | undefined,
  options?: PassportNumberOptions,
): string | null {
  const minLen = options?.minLen ?? 6;
  const maxLen = options?.maxLen ?? 25;
  const normalized = String(raw ?? "")
    .trim()
    .replace(/\s+/g, "");
  if (!normalized) return null;

  if (normalized.length < minLen) {
    return `Passport number must be at least ${minLen} characters.`;
  }
  if (normalized.length > maxLen) {
    return `Passport number must be at most ${maxLen} characters.`;
  }
  if (!/^[A-Za-z0-9]+$/.test(normalized)) {
    return "Passport number may include only letters and numbers (no symbols).";
  }
  return null;
}

/** National ID / driving licence: alphanumeric, slightly wider length band. */
export function validateAlphanumericIdentityNumber(
  raw: string | null | undefined,
  options?: PassportNumberOptions,
): string | null {
  const minLen = options?.minLen ?? 5;
  const maxLen = options?.maxLen ?? 20;
  const normalized = String(raw ?? "")
    .trim()
    .replace(/\s+/g, "");
  if (!normalized) return null;

  if (normalized.length < minLen) {
    return `Document number must be at least ${minLen} characters.`;
  }
  if (normalized.length > maxLen) {
    return `Document number must be at most ${maxLen} characters.`;
  }
  if (!/^[A-Za-z0-9]+$/.test(normalized)) {
    return "Document number may include only letters and numbers (no symbols).";
  }
  return null;
}

export type IdentityDocType = "PT" | "NI" | "DL" | string;

export function validateIdentityDocumentNumberForType(
  raw: string | null | undefined,
  idType: IdentityDocType | null | undefined,
): string | null {
  const t = String(idType ?? "PT")
    .trim()
    .toUpperCase();
  if (t === "PT") return validatePassportNumber(raw);
  return validateAlphanumericIdentityNumber(raw);
}

/**
 * Passport date of issue rules:
 * - not in the future
 * - not before traveller birth date (when birth is known)
 * - strictly before expiry date (when expiry is known)
 */
export function validatePassportDateOfIssue(
  issueIso: string | null | undefined,
  birthIso: string | null | undefined,
  expiryIso: string | null | undefined,
  todayInput?: Date,
): string | null {
  if (!issueIso || !String(issueIso).trim()) return null;

  const issue = parseLocalDateString(issueIso);
  if (!issue) return "Enter a valid date of issue.";

  const issueDay = startOfLocalDay(issue);
  const today = startOfLocalDay(todayInput ?? new Date());

  if (issueDay.getTime() > today.getTime()) {
    return "Date of issue cannot be in the future.";
  }

  if (birthIso) {
    const birth = parseLocalDateString(birthIso);
    if (birth && issueDay.getTime() < startOfLocalDay(birth).getTime()) {
      return "Date of issue cannot be before date of birth.";
    }
  }

  if (expiryIso) {
    const exp = parseLocalDateString(expiryIso);
    if (exp && issueDay.getTime() >= startOfLocalDay(exp).getTime()) {
      return "Date of issue must be before passport expiry date.";
    }
  }

  return null;
}

export type PassportIssuePickerBoundsParams = {
  birthDateIso?: string | null;
  expiryDateIso?: string | null;
  /** Defaults to today */
  today?: Date;
};

/**
 * Bounds for calendar UI: optional min (birth), max = min(today, expiry − 1 day).
 * If expiry is missing, max is today. If birth is missing, min is unrestricted (null).
 */
export function getPassportIssuePickerBounds(
  params: PassportIssuePickerBoundsParams,
): { minDate: Date | null; maxDate: Date | null } {
  const t = startOfLocalDay(params.today ?? new Date());
  const birth = params.birthDateIso
    ? parseLocalDateString(params.birthDateIso)
    : null;
  const exp = params.expiryDateIso
    ? parseLocalDateString(params.expiryDateIso)
    : null;

  const minDate = birth ? startOfLocalDay(birth) : null;

  let maxDate = t;
  if (exp) {
    const expStart = startOfLocalDay(exp);
    const dayBeforeExpiry = new Date(
      expStart.getFullYear(),
      expStart.getMonth(),
      expStart.getDate() - 1,
    );
    maxDate =
      t.getTime() < dayBeforeExpiry.getTime() ? t : dayBeforeExpiry;
  }

  if (minDate && maxDate && minDate.getTime() > maxDate.getTime()) {
    return { minDate: null, maxDate: null };
  }

  return { minDate, maxDate };
}

export function getBirthDatePickerBoundsForPtc(
  ptc: string | null | undefined,
  todayInput?: Date,
): { minDate: Date | null; maxDate: Date | null } {
  const today = startOfLocalDay(todayInput ?? new Date());
  const t = String(ptc ?? "")
    .trim()
    .toUpperCase();

  const shiftYears = (base: Date, years: number) =>
    new Date(base.getFullYear() + years, base.getMonth(), base.getDate());
  const addDays = (base: Date, days: number) =>
    new Date(base.getFullYear(), base.getMonth(), base.getDate() + days);

  if (t === "ADT") {
    return {
      minDate: shiftYears(today, -150),
      maxDate: shiftYears(today, -12),
    };
  }
  if (t === "CHD") {
    return {
      minDate: addDays(shiftYears(today, -12), 1),
      maxDate: shiftYears(today, -2),
    };
  }
  if (t === "INF") {
    return {
      minDate: addDays(shiftYears(today, -2), 1),
      maxDate: today,
    };
  }

  return {
    minDate: shiftYears(today, -150),
    maxDate: today,
  };
}

export function sanitizeEmailInput(raw: string | null | undefined): string {
  let normalized = String(raw ?? "")
    .trim()
    .replace(/\s+/g, "")
    .replace(/[^A-Za-z0-9@._+-]/g, "");

  // Keep only first @
  const atIndex = normalized.indexOf("@");
  if (atIndex !== -1) {
    const beforeAt = normalized.slice(0, atIndex + 1);
    const afterAt = normalized.slice(atIndex + 1).replace(/@/g, "");
    normalized = `${beforeAt}${afterAt}`;
  }

  // Never allow consecutive dots anywhere
  normalized = normalized.replace(/\.{2,}/g, ".");

  const splitAt = normalized.indexOf("@");
  if (splitAt === -1) {
    // While typing local-part only: no leading dot
    return normalized.replace(/^\./g, "");
  }

  const localRaw = normalized.slice(0, splitAt);
  const domainRaw = normalized.slice(splitAt + 1);

  // Local part: cannot start/end with dot, no consecutive dots.
  const local = localRaw.replace(/^\.+/, "").replace(/\.+$/, "");

  // Domain part: allow letters/digits/hyphen/dot only.
  let domain = domainRaw.replace(/[^A-Za-z0-9.-]/g, "");
  domain = domain.replace(/\.{2,}/g, "."); // no consecutive dots
  domain = domain.replace(/^\.+/, ""); // no leading dot
  // Keep trailing dot while user is typing (e.g. `@yopmail.` -> allow typing `com` next).
  domain = domain.replace(/(^|\.)-+/g, "$1"); // no leading hyphen in each label
  domain = domain.replace(/-+(?=\.|$)/g, ""); // no trailing hyphen in each label

  return domain ? `${local}@${domain}` : `${local}@`;
}

export function sanitizeIdentityDocumentInput(
  raw: string | null | undefined,
): string {
  return String(raw ?? "")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");
}

/**
 * Combine dial code (+1, +971, …) with the national digits from `react-international-phone`
 * into one E.164 string for validation.
 */
export function buildE164FromPhoneParts(
  areaCode: string | null | undefined,
  nationalNumber: string | null | undefined,
): string | null {
  const ac = String(areaCode ?? "").trim();
  const digits = String(nationalNumber ?? "").replace(/\D/g, "");
  if (!ac || !digits) return null;
  const dial = ac.startsWith("+") ? ac : `+${ac.replace(/^\+/, "")}`;
  return `${dial}${digits}`;
}

/**
 * Country-aware phone validation (length + numbering plan for the dial code).
 * `react-international-phone` does not validate — pair with stored `areaCode` + `phoneNumber`.
 *
 * Uses `isPossiblePhoneNumber` (not `isValidPhoneNumber`): the latter rejects many
 * correctly shaped numbers (e.g. unassigned US area codes like 123) and frustrates users.
 * Possible = right length/pattern for that country; backend can still enforce assigned ranges.
 *
 * @returns `null` if valid, otherwise a user-facing error message.
 */
export function validateInternationalPhoneParts(
  areaCode: string | null | undefined,
  nationalNumber: string | null | undefined,
): string | null {
  const ac = String(areaCode ?? "").trim();
  const raw = String(nationalNumber ?? "").trim();
  if (!ac || !raw) return null;

  const digits = raw.replace(/\D/g, "");
  if (!digits) {
    return "Phone number must contain digits.";
  }

  const e164 = buildE164FromPhoneParts(ac, raw);
  if (!e164?.startsWith("+")) {
    return "Enter a valid phone number.";
  }

  try {
    if (isPossiblePhoneNumber(e164)) return null;
    return "Enter a phone number with the correct length for the selected country.";
  } catch {
    return "Enter a valid phone number.";
  }
}
