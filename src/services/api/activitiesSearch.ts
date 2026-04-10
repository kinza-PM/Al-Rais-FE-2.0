import { api, toApiError } from "../axios";

export type ActivityDestinationOption = {
  code: string;
  label: string;
  raw?: unknown;
};

function formatYmd(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Default search window for Hotel Beds activities availability (local dates). */
export function defaultActivityAvailabilityDateRange(days = 30): {
  from: string;
  to: string;
} {
  const from = new Date();
  const to = new Date();
  to.setDate(to.getDate() + days);
  return { from: formatYmd(from), to: formatYmd(to) };
}

/**
 * Hotel Beds activities booking API — availability request shape
 * (see developer.hotelbeds.com activities availability).
 */
export function buildGetAvailabilityRequestBody(params: {
  destinationCode: string;
  from: string;
  to: string;
  language?: string;
  page?: number;
  itemsPerPage?: number;
  paxes?: { age: number }[];
}): Record<string, unknown> {
  const code = params.destinationCode.trim().toUpperCase();
  return {
    filters: [
      {
        searchFilterItems: [{ type: "destination", value: code }],
      },
    ],
    from: params.from,
    to: params.to,
    paxes: params.paxes ?? [{ age: 30 }],
    language: params.language ?? "en",
    pagination: {
      itemsPerPage: Math.min(params.itemsPerPage ?? 100, 100),
      page: params.page ?? 1,
    },
    order: "DEFAULT",
  };
}

/**
 * Hotel Beds activities — destinations for a country (ISO-2).
 * UAT: `GET …/destinationByOurCountry?country={ISO2}` (query on URL).
 */
export async function getDestinationByOurCountry(
  countryIso2: string,
  signal?: AbortSignal,
): Promise<unknown> {
  const source = "getDestinationByOurCountry";
  const country = countryIso2.trim().toUpperCase();
  try {
    return await api.get<unknown>(
      "destinationByOurCountry",
      { country },
      signal,
    );
  } catch (err) {
    throw toApiError(source, err);
  }
}

/** @deprecated Use `getDestinationByOurCountry` (backend is GET). */
export const postDestinationByOurCountry = getDestinationByOurCountry;

/**
 * Hotel Beds activities — availability search for a destination code.
 */
export async function postGetAvailability(
  body: Record<string, unknown>,
  signal?: AbortSignal,
): Promise<unknown> {
  const source = "postGetAvailability";
  try {
    return await api.post<unknown>("getAvailability", body as Record<string, any>, {
      signal,
    });
  } catch (err) {
    throw toApiError(source, err);
  }
}

/**
 * Hotel Beds activities detail (simple) — POST body per APITUDE:
 * `code`, `from`, `to`, `language`, `paxes`, optional `modalityCode`.
 */
export function buildActivitiesDetailBody(params: {
  code: string;
  from: string;
  to: string;
  language?: string;
  paxes?: { age: number }[];
  modalityCode?: string;
}): Record<string, unknown> {
  const c = params.code.trim();
  const body: Record<string, unknown> = {
    code: c,
    /** Some gateways mirror Hotel Beds `activityCode` from the availability row. */
    activityCode: c,
    from: params.from,
    to: params.to,
    language: params.language ?? "en",
    paxes: params.paxes ?? [{ age: 30 }],
  };
  if (params.modalityCode?.trim()) {
    body.modalityCode = params.modalityCode.trim();
  }
  return body;
}

export async function postActivitiesDetail(
  body: Record<string, unknown>,
  signal?: AbortSignal,
): Promise<unknown> {
  const source = "postActivitiesDetail";
  try {
    return await api.post<unknown>("activitiesDetail", body as Record<string, any>, {
      signal,
    });
  } catch (err) {
    throw toApiError(source, err);
  }
}

/** Preconfirm request matches confirm: holder + `activities[]` with rateKey, from, to. */
export function buildActivitiesPreConfirmBody(params: {
  clientReference: string;
  rateKey: string;
  from: string;
  to: string;
  holder: {
    surname: string;
    name: string;
    email: string;
    title?: string;
    country?: string;
  };
  language?: string;
}): Record<string, unknown> {
  const h = params.holder;
  return {
    clientReference: params.clientReference,
    holder: {
      surname: h.surname.trim(),
      name: h.name.trim(),
      title: h.title?.trim() || "Mr",
      email: h.email.trim(),
      country: (h.country ?? "AE").trim(),
      telephones: [],
      mailing: false,
    },
    language: params.language ?? "en",
    activities: [
      {
        rateKey: params.rateKey.trim(),
        from: params.from,
        to: params.to,
      },
    ],
  };
}

/** Single-step confirm — same body shape as preconfirm for many integrations. */
export function buildActivitiesConfirmBody(
  params: Parameters<typeof buildActivitiesPreConfirmBody>[0],
): Record<string, unknown> {
  return buildActivitiesPreConfirmBody(params);
}

/**
 * After a successful preConfirm, merge any fields the supplier returns (e.g. operationId)
 * into the confirm payload. Unknown shapes are ignored; caller always starts from the same base as preConfirm.
 */
export function mergeActivitiesConfirmBodyFromPreConfirm(
  baseBody: Record<string, unknown>,
  preConfirmResult: unknown,
): Record<string, unknown> {
  if (!preConfirmResult || typeof preConfirmResult !== "object") {
    return { ...baseBody };
  }
  const o = preConfirmResult as Record<string, unknown>;
  const merged: Record<string, unknown> = { ...baseBody };
  if (typeof o.operationId === "string" && o.operationId.trim() !== "") {
    merged.operationId = o.operationId.trim();
  }
  return merged;
}

export async function postPreConfirmBooking(
  body: Record<string, unknown>,
  signal?: AbortSignal,
): Promise<unknown> {
  const source = "postPreConfirmBooking";
  try {
    return await api.post<unknown>(
      "preConfirmBooking",
      body as Record<string, any>,
      { signal },
    );
  } catch (err) {
    throw toApiError(source, err);
  }
}

export async function postConfirmBooking(
  body: Record<string, unknown>,
  signal?: AbortSignal,
): Promise<unknown> {
  const source = "postConfirmBooking";
  try {
    return await api.post<unknown>("confirmBooking", body as Record<string, any>, {
      signal,
    });
  } catch (err) {
    throw toApiError(source, err);
  }
}

/** Body for `POST …/cancelBooking` (activities / sightseeing gateway). */
export function buildActivitiesCancelBookingBody(params: {
  bookingReferenceId: string;
  clientReference?: string;
  bookingKey?: string;
  cancellationReason?: string;
}): Record<string, unknown> {
  const ref = params.bookingReferenceId.trim();
  const body: Record<string, unknown> = {
    bookingReferenceId: ref,
    bookingReference: ref,
  };
  const cr = params.clientReference?.trim();
  if (cr) body.clientReference = cr;
  const bk = params.bookingKey?.trim();
  if (bk) body.bookingKey = bk;
  const reason = params.cancellationReason?.trim();
  if (reason) body.cancellationReason = reason;
  return body;
}

/** Normalizes supplier responses after a cancel call. */
export function isActivitiesCancelSuccessful(data: unknown): boolean {
  if (data == null) return true;
  if (typeof data !== "object") return false;
  const o = data as Record<string, unknown>;
  const meta = o.meta as Record<string, unknown> | undefined;
  if (meta && meta.success === true) return true;
  const sm = String(meta?.statusMessage ?? "").toUpperCase();
  if (sm === "SUCCESS") return true;
  if (o.success === true) return true;
  const st = String(o.status ?? "").toLowerCase();
  if (st === "cancelled" || st === "canceled") return true;
  const booking = o.booking;
  if (booking && typeof booking === "object") {
    const bs = String(
      (booking as Record<string, unknown>).status ?? "",
    ).toUpperCase();
    if (bs === "CANCELLED" || bs === "CANCELED") return true;
  }
  return false;
}

export async function postCancelBooking(
  body: Record<string, unknown>,
  signal?: AbortSignal,
): Promise<unknown> {
  const source = "postCancelBooking";
  try {
    return await api.post<unknown>("cancelBooking", body as Record<string, any>, {
      signal,
    });
  } catch (err) {
    throw toApiError(source, err);
  }
}
