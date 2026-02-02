import type { CitiesResponse, CountriesResponse } from "../../features/flights/types";
import { api, toApiError } from "../axios";

export async function getMasterListingData<TResp = any>(
  tableName: string,
  signal?: AbortSignal,
  nextToken?: string | null,
  extraParams?: Record<string, any>,
): Promise<TResp> {
  const source = "getMasterListingData";
  try {
    // api.get already returns TResp (your wrapper returns res.data)
    return await api.get<TResp>(
      "/getListingData",
      {
        tableName,
        ...(nextToken ? { nextToken } : {}),
        ...(extraParams ?? {}),
      },
      signal,
    );
    // return await api.get<TResp>("/getListingData", { tableName }, signal);
  } catch (err) {
    throw toApiError(source, err);
  }
}

export async function getCountriesData(
  signal?: AbortSignal,
): Promise<CountriesResponse> {
  try {
    const response = await api.get<CountriesResponse>(
      "/countries",
      undefined,
      signal,
    );
    return response;
  } catch (err) {
    throw toApiError("getCountriesData", err);
  }
}

export async function getCitiesData(
  country: string,
  signal?: AbortSignal
): Promise<CitiesResponse> {
  try {
    const response = await api.post<CitiesResponse>(
      "/countries/cities",
      { country },
      { signal }
    );
    return response;
  } catch (err) {
    throw toApiError("getCitiesData", err);
  }
}