import { useQuery, keepPreviousData } from "@tanstack/react-query";
import {
  getCitiesData,
  getCountriesData,
  getMasterListingData,
} from "../../services/api/apiMasterListing";
import {
  buildCityOptions,
  buildCountryOptions,
} from "../../utils/masterLIstingFlightTypesBuilder";
import type { CityOption, CountryOption } from "../../features/flights/types";

type Builder<TItem, TOut> = (items: TItem[]) => TOut[];

export function useListing<TResp extends { items?: any[] }, TItem, TOut>(
  tableName: string,
  builder: Builder<TItem, TOut>,
  enabled = true,
  opts?: {
    staleTime?: number;
    gcTime?: number;
    /** Appended to `/getListingData` query (e.g. `sortBy`, `sortOrder`). */
    listingParams?: Record<string, string>;
  },
) {
  const listingParams = opts?.listingParams;
  const q = useQuery({
    queryKey: ["listing", tableName, listingParams],
    queryFn: ({ signal }) =>
      getMasterListingData<TResp>(tableName, signal, null, listingParams),
    select: (resp) => builder((resp?.items ?? []) as TItem[]),
    enabled,
    placeholderData: keepPreviousData,
    staleTime: opts?.staleTime ?? 5 * 60 * 1000, // 5m
    gcTime: opts?.gcTime ?? 30 * 60 * 1000, // 30m
  });

  return {
    data: q.data ?? ([] as unknown as TOut[]),
    isLoading: q.isLoading,
    isFetching: q.isFetching,
    error: (q.error as Error | null) ?? null,
  };
}

export const useCountriesOptionsListing = (enabled = true) => {
  const q = useQuery({
    queryKey: ["countries"],
    queryFn: ({ signal }) => getCountriesData(signal),
    select: (resp) => buildCountryOptions(resp?.data ?? []),
    enabled,
    placeholderData: keepPreviousData,
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
    gcTime: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  return {
    data: q.data ?? ([] as CountryOption[]),
    isLoading: q.isLoading,
    isFetching: q.isFetching,
    error: (q.error as Error | null) ?? null,
  };
};

export const useCitiesOptions = (country: string, enabled = true) => {
  const q = useQuery({
    queryKey: ["cities", country],
    queryFn: ({ signal }) => getCitiesData(country, signal),
    select: (resp) => buildCityOptions(resp?.data ?? []),
    enabled: enabled && !!country, // Only fetch if country is provided
    placeholderData: keepPreviousData,
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
    gcTime: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  return {
    data: q.data ?? ([] as CityOption[]),
    isLoading: q.isLoading,
    isFetching: q.isFetching,
    error: (q.error as Error | null) ?? null,
  };
};
