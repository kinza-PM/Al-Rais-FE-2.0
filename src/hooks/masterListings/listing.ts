// hooks/listings.ts
import {
    buildBaggageOptions,
    buildCabinClassOptions,
    buildCountryOptions,
    buildFlightTypeOptions,
    buildNumberStopsOptions,
    buildPassengerSchema,
    buildPriceSortOptions,
    buildTransitHourOptions,
} from "../../utils/flightTypes";

import type {
    BaggageResponse, BaggageOption,
    CabinClassesResponse, CabinClassOption,
    CountriesResponse, CountryOption,
    FlightTypesResponse, FlightTypeOption,
    NumberStopsResponse, NumberStopsOption,
    PassengersResponse, PassengerSchema,
    PriceSortResponse, PriceSortOption,
    TransitHoursResponse, TransitHoursOption,
} from "../../features/flights/types";

import { listingTables } from "../../config/apiRoute";
import { useListing } from "./useQueryListing";

export const useFlightTypesOptions = (enabled = true) =>
    useListing<FlightTypesResponse, any, FlightTypeOption>(
        listingTables.flightTypes,
        buildFlightTypeOptions,
        enabled
    );

export const useCountryOptions = (enabled = true) =>
    useListing<CountriesResponse, any, CountryOption>(
        listingTables.countries,
        buildCountryOptions,
        enabled
    );

export const usePassengerSchema = (enabled = true) =>
    useListing<PassengersResponse, any, PassengerSchema[number]>(
        listingTables.passengers,
        // builder returns PassengerSchema (array), but useListing expects array of TOut.
        // So just wrap the real builder to pass-through:
        (items) => buildPassengerSchema(items as any) as unknown as PassengerSchema[number][],
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
