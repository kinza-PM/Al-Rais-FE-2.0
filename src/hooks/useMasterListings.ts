// hooks/useMasterListings.ts
import { useEffect, useMemo, useRef, useState } from "react";
import { getMasterListingData } from "../services/api/apiMasterListing";
import { listingTables } from "../config/masterListing";
import {
  buildCabinClassOptions,
  buildCountryOptions,
  buildFlightTypeOptions,
  buildPassengerSchema,
  buildPriceSortOptions,
  buildNumberStopsOptions,
  buildTransitHourOptions,
  buildBaggageOptions,
} from "../utils/flightTypes";

import type {
  FlightTypesResponse,
  FlightTypeOption,
  CountriesResponse,
  CountryOption,
  PassengersResponse,
  PassengerSchema,
  CabinClassesResponse,
  CabinClassOption,
  PriceSortResponse,
  PriceSortOption,
  NumberStopsResponse,
  NumberStopsOption,
  TransitHoursResponse,
  TransitHoursOption,
  BaggageResponse,
  BaggageOption,
} from "../features/flights/types";

type Key =
  | "flightTypes"
  | "countries"
  | "passengers"
  | "cabinClasses"
  | "priceSort"
  | "numberStops"
  | "transitHours"
  | "baggage";

type Include = Key[];

export function useMasterListings(opts?: { include?: Include }) {
  const include = useMemo<Set<Key>>(
    () =>
      new Set(
        opts?.include ?? [
          "flightTypes",
          "countries",
          "passengers",
          "cabinClasses",
        ] // default (Hero)
      ),
    [opts?.include?.join("|")]
  );

  // data
  const [flightTypes, setFlightTypes] = useState<FlightTypeOption[]>([]);
  const [countries, setCountries] = useState<CountryOption[]>([]);
  const [passengers, setPassengers] = useState<PassengerSchema>([]);
  const [cabinClasses, setCabinClasses] = useState<CabinClassOption[]>([]);
  const [priceSort, setPriceSort] = useState<PriceSortOption[]>([]);
  const [numberStops, setNumberStops] = useState<NumberStopsOption[]>([]);
  const [transitHours, setTransitHours] = useState<TransitHoursOption[]>([]);
  const [baggage, setBaggage] = useState<BaggageOption[]>([]);

  // loading/errors – unchanged semantics, just new keys added
  const [loadingMap, setLoadingMap] = useState<Record<Key, boolean>>({
    flightTypes: false,
    countries: false,
    passengers: false,
    cabinClasses: false,
    priceSort: false,
    numberStops: false,
    transitHours: false,
    baggage: false,
  });
  const [errorMap, setErrorMap] = useState<Record<Key, string | null>>({
    flightTypes: null,
    countries: null,
    passengers: null,
    cabinClasses: null,
    priceSort: null,
    numberStops: null,
    transitHours: null,
    baggage: null,
  });

  const mounted = useRef(true);
  useEffect(
    () => () => {
      mounted.current = false;
    },
    []
  );

  useEffect(() => {
    const ac = new AbortController();

    const run = <R>(
      key: Key,
      fetcher: () => Promise<R>,
      builder: (items: any[]) => any[],
      setter: (val: any[]) => void
    ) => {
      if (!include.has(key)) return;
      setLoadingMap((m) => ({ ...m, [key]: true }));
      setErrorMap((m) => ({ ...m, [key]: null }));

      fetcher()
        .then((res: any) => {
          const items = res?.items ?? [];
          const built = builder(items);
          if (mounted.current) setter(built);
        })
        .catch((e: any) => {
          if (mounted.current) {
            setErrorMap((m) => ({
              ...m,
              [key]: e?.message || `Failed to load ${key}`,
            }));
            setter(builder([])); // graceful fallback
          }
        })
        .finally(() => {
          if (mounted.current) setLoadingMap((m) => ({ ...m, [key]: false }));
        });
    };

    run<FlightTypesResponse>(
      "flightTypes",
      () => getMasterListingData(listingTables.flightTypes, ac.signal),
      buildFlightTypeOptions,
      setFlightTypes
    );
    run<CountriesResponse>(
      "countries",
      () => getMasterListingData(listingTables.countries, ac.signal),
      buildCountryOptions,
      setCountries
    );
    run<PassengersResponse>(
      "passengers",
      () => getMasterListingData(listingTables.passengers, ac.signal),
      buildPassengerSchema,
      setPassengers
    );
    run<CabinClassesResponse>(
      "cabinClasses",
      () => getMasterListingData(listingTables.cabinClasses, ac.signal),
      buildCabinClassOptions,
      setCabinClasses
    );
    run<PriceSortResponse>(
      "priceSort",
      () => getMasterListingData(listingTables.priceSorted, ac.signal),
      buildPriceSortOptions,
      setPriceSort
    );

    // NEW calls for Travel page only (behind include):
    run<NumberStopsResponse>(
      "numberStops",
      () => getMasterListingData(listingTables.numberStops, ac.signal),
      buildNumberStopsOptions,
      setNumberStops
    );
    run<TransitHoursResponse>(
      "transitHours",
      () => getMasterListingData(listingTables.transitHours, ac.signal),
      buildTransitHourOptions,
      setTransitHours
    );
    run<BaggageResponse>(
      "baggage",
      () => getMasterListingData(listingTables.baggage, ac.signal),
      buildBaggageOptions,
      setBaggage
    );

    return () => ac.abort();
  }, [include]);

  const loadingAny = Array.from(include).some((k) => loadingMap[k]);

  return {
    // data
    flightTypes,
    countries,
    passengers,
    cabinClasses,
    priceSort,
    numberStops,
    transitHours,
    baggage,
    loading: loadingAny,
    loadingMap,
    errorMap,
  };
}
