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
 * POST with `country` query param (per Postman).
 */
export async function postDestinationByOurCountry(
  countryIso2: string,
  signal?: AbortSignal,
): Promise<unknown> {
  const source = "postDestinationByOurCountry";
  const q = encodeURIComponent(countryIso2.trim().toUpperCase());
  try {
    return await api.post<unknown>(
      `/destinationByOurCountry?country=${q}`,
      {},
      { signal },
    );
  } catch (err) {
    throw toApiError(source, err);
  }
}

/**
 * Hotel Beds activities — availability search for a destination code.
 */
export async function postGetAvailability(
  body: Record<string, unknown>,
  signal?: AbortSignal,
): Promise<unknown> {
  const source = "postGetAvailability";
  try {
    return await api.post<unknown>("/getAvailability", body as Record<string, any>, {
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
  const body: Record<string, unknown> = {
    code: params.code.trim(),
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
    return await api.post<unknown>("/activitiesDetail", body as Record<string, any>, {
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

export async function postPreConfirmBooking(
  body: Record<string, unknown>,
  signal?: AbortSignal,
): Promise<unknown> {
  const source = "postPreConfirmBooking";
  try {
    return await api.post<unknown>(
      "/preConfirmBooking",
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
    return await api.post<unknown>("/confirmBooking", body as Record<string, any>, {
      signal,
    });
  } catch (err) {
    throw toApiError(source, err);
  }
}

export async function postCancelBooking(
  body: Record<string, unknown>,
  signal?: AbortSignal,
): Promise<unknown> {
  const source = "postCancelBooking";
  try {
    return await api.post<unknown>("/cancelBooking", body as Record<string, any>, {
      signal,
    });
  } catch (err) {
    throw toApiError(source, err);
  }
}
