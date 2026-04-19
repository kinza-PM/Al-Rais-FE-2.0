import { isPossiblePhoneNumber } from "libphonenumber-js";
import { parseLocalDateString } from "./helpers";

/** Start of local calendar day (no time drift). */
export function startOfLocalDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export type TravelerSurnameOptions = {
  /** Default 2 */
  minLength?: number;
};

/**
 * Optional surname format check (run after required/trim).
 * Returns `null` if valid, otherwise an error message.
 */
export function validateTravelerSurname(
  raw: string | null | undefined,
  options?: TravelerSurnameOptions,
): string | null {
  const minLength = options?.minLength ?? 2;
  const s = String(raw ?? "").trim();
  if (!s) return null;

  if (/\s{2,}/.test(s)) {
    return "Use a single space between parts of the surname.";
  }
  if (s.length < minLength) {
    return `Surname must be at least ${minLength} characters.`;
  }
  if (/\d/.test(s)) {
    return "Surname cannot contain numbers.";
  }
  // Letters (Unicode), single spaces, hyphens, apostrophes — e.g. O'Brien, van der Berg
  if (!/^[\p{L}]+(?:[\s'\-][\p{L}]+)*$/u.test(s)) {
    return "Use only letters, spaces, hyphens, or apostrophes in the surname.";
  }
  return null;
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
