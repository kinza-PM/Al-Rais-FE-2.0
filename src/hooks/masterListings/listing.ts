// hooks/listings.ts
import {
  buildAirlineOptions,
  buildBaggageOptions,
  buildCabinClassOptions,
  buildCountryOptions,
  buildFlightTypeOptions,
  buildNumberStopsOptions,
  buildPassengerSchema,
  buildPriceSortOptions,
  buildTransitHourOptions,
} from "../../utils/masterLIstingFlightTypesBuilder";

import type {
  BaggageResponse,
  BaggageOption,
  CabinClassesResponse,
  CabinClassOption,
  CountriesResponse,
  CountryOption,
  FlightTypesResponse,
  FlightTypeOption,
  NumberStopsResponse,
  NumberStopsOption,
  PassengersResponse,
  PassengerSchema,
  PriceSortResponse,
  PriceSortOption,
  TransitHoursResponse,
  TransitHoursOption,
  AirlinesResponse,
  AirlineOption,
  CountryItem,
} from "../../features/flights/types";

import { listingTables } from "../../config/apiRoute";
import { useListing } from "./useQueryListing";
import { useInfiniteListing } from "./useInfiniteListing";

export const useFlightTypesOptions = (enabled = true) =>
  useListing<FlightTypesResponse, any, FlightTypeOption>(
    listingTables.flightTypes,
    buildFlightTypeOptions,
    enabled
  );

// export const useCityOptions = (enabled = true) =>
//     useListing<CountriesResponse, any, CountryOption>(
//         listingTables.countries,
//         buildCountryOptions,
//         enabled
//     );
export const useCityOptions = (enabled = true) =>
  useInfiniteListing<CountriesResponse, CountryItem, CountryOption>(
    listingTables.countries,
    buildCountryOptions,
    enabled
  );

export const usePassengerSchema = (enabled = true) =>
  useListing<PassengersResponse, any, PassengerSchema[number]>(
    listingTables.passengers,
    (items) =>
      buildPassengerSchema(
        items as any
      ) as unknown as PassengerSchema[number][],
    enabled
  );

export const useCabinClassOptions = (enabled = true) =>
  useListing<CabinClassesResponse, any, CabinClassOption>(
    listingTables.cabinClasses,
    buildCabinClassOptions,
    enabled
  );

export const usePriceSortOptions = (enabled = true) =>
  useListing<PriceSortResponse, any, PriceSortOption>(
    listingTables.priceSorted,
    buildPriceSortOptions,
    enabled
  );

export const useNumberStopsOptions = (enabled = true) =>
  useListing<NumberStopsResponse, any, NumberStopsOption>(
    listingTables.numberStops,
    buildNumberStopsOptions,
    enabled
  );

export const useTransitHoursOptions = (enabled = true) =>
  useListing<TransitHoursResponse, any, TransitHoursOption>(
    listingTables.transitHours,
    buildTransitHourOptions,
    enabled
  );

export const useBaggageOptions = (enabled = true) =>
  useListing<BaggageResponse, any, BaggageOption>(
    listingTables.baggage,
    buildBaggageOptions,
    enabled
  );

export const useAirlineOptions = (enabled = true) =>
  useListing<AirlinesResponse, any, AirlineOption>(
    listingTables.airlines,
    buildAirlineOptions,
    enabled
  );
