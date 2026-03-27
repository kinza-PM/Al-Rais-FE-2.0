import { api, toApiError } from "../axios";

export type ActivityDestinationOption = {
  code: string;
  label: string;
  raw?: unknown;
};

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
