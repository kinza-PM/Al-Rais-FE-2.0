// hooks/useMasterListings.ts (React Query version, same export name)
import { useMemo } from "react";
import {
  useFlightTypesOptions,
  useCityOptions,
  usePassengerSchema,
  useCabinClassOptions,
  usePriceSortOptions,
  useNumberStopsOptions,
  useTransitHoursOptions,
  useBaggageOptions,
  useAirlineOptions,
} from "./listing";

type Key =
  | "flightTypes"
  | "countries"
  | "passengers"
  | "cabinClasses"
  | "priceSort"
  | "numberStops"
  | "transitHours"
  | "baggage"
  | "airline";

type Include = Key[];

export function useMasterListings(opts?: {
  include?: Include;
  /**
   * Optional search term for the countries listing.
   * If provided, countries will be fetched via API search (and paginated).
   */
  countriesSearchTerm?: string;
}) {
  const include = useMemo<Set<Key>>(
    () =>
      new Set(
        opts?.include ?? [
          "flightTypes",
          "countries",
          "passengers",
          "cabinClasses",
        ]
      ),
    [opts?.include?.join("|")]
  );

  const qFlightTypes = useFlightTypesOptions(include.has("flightTypes"));
  const qCountries = useCityOptions(
    include.has("countries"),
    opts?.countriesSearchTerm
  );
  const qPassengers = usePassengerSchema(include.has("passengers"));
  const qCabin = useCabinClassOptions(include.has("cabinClasses"));
  const qPrice = usePriceSortOptions(include.has("priceSort"));
  const qStops = useNumberStopsOptions(include.has("numberStops"));
  const qTransit = useTransitHoursOptions(include.has("transitHours"));
  const qBaggage = useBaggageOptions(include.has("baggage"));
  const qAirline = useAirlineOptions(include.has("airline"));

  const loadingMap = {
    flightTypes: !!(
      include.has("flightTypes") &&
      (qFlightTypes.isLoading || qFlightTypes.isFetching)
    ),
    countries: !!(
      include.has("countries") &&
      (qCountries.isLoading || qCountries.isFetching)
    ),
    passengers: !!(
      include.has("passengers") &&
      (qPassengers.isLoading || qPassengers.isFetching)
    ),
    cabinClasses: !!(
      include.has("cabinClasses") &&
      (qCabin.isLoading || qCabin.isFetching)
    ),
    priceSort: !!(
      include.has("priceSort") &&
      (qPrice.isLoading || qPrice.isFetching)
    ),
    numberStops: !!(
      include.has("numberStops") &&
      (qStops.isLoading || qStops.isFetching)
    ),
    transitHours: !!(
      include.has("transitHours") &&
      (qTransit.isLoading || qTransit.isFetching)
    ),
    baggage: !!(
      include.has("baggage") &&
      (qBaggage.isLoading || qBaggage.isFetching)
    ),
    airline: !!(
      include.has("airline") &&
      (qAirline.isLoading || qAirline.isFetching)
    ),
  } as const;

  const errorMap = {
    flightTypes: qFlightTypes.error?.message ?? null,
    countries: qCountries.error?.message ?? null,
    passengers: qPassengers.error?.message ?? null,
    cabinClasses: qCabin.error?.message ?? null,
    priceSort: qPrice.error?.message ?? null,
    numberStops: qStops.error?.message ?? null,
    transitHours: qTransit.error?.message ?? null,
    baggage: qBaggage.error?.message ?? null,
    airline: qAirline.error?.message ?? null,
  } as const;

  const loadingAny = Array.from(include).some((k) => loadingMap[k]);

  return {
    flightTypes: qFlightTypes.data,
    countries: qCountries.data,
    passengers: qPassengers.data as any,
    cabinClasses: qCabin.data,
    priceSort: qPrice.data,
    numberStops: qStops.data,
    transitHours: qTransit.data,
    baggage: qBaggage.data,
    airline: qAirline.data,

    countriesHasMore: qCountries.hasNextPage,
    countriesFetchNext: qCountries.fetchNextPage,
    countriesIsFetchingNext: qCountries.isFetchingNextPage,

    // status (unchanged semantics)
    loading: loadingAny,
    loadingMap,
    errorMap,
  };
}
