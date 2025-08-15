// hooks/useMasterListings.ts
import { useEffect, useState } from "react";
import { getMasterListingData } from "../services/api/apiMasterListing";
import { listingTables } from "../config/masterListing";
import {
    buildCabinClassOptions,
    buildCountryOptions,
    buildFlightTypeOptions,
    buildPassengerSchema,
} from "../utils/flightTypes";
import type {
    FlightTypeOption,
    CountryOption,
    PassengerSchema,
    CabinClassOption,
    FlightTypesResponse,
    CountriesResponse,
    PassengersResponse,
    CabinClassesResponse,
} from "../features/flights/types";

type ErrorsMap = {
    flightTypes?: string | null;
    countries?: string | null;
    passengers?: string | null;
    cabinClasses?: string | null;
};

export function useMasterListings(): {
    flightTypes: FlightTypeOption[];
    countries: CountryOption[];
    passengers: PassengerSchema;
    cabinClasses: CabinClassOption[];
    loading: boolean;
    error: string | null; // aggregated
    errors: ErrorsMap;    // per-resource
} {
    const [flightTypes, setFlightTypes] = useState<FlightTypeOption[]>([]);
    const [countries, setCountries] = useState<CountryOption[]>([]);
    const [passengers, setPassengers] = useState<PassengerSchema>([]);
    const [cabinClasses, setCabinClasses] = useState<CabinClassOption[]>([]);

    const [loading, setLoading] = useState<boolean>(true);
    const [errors, setErrors] = useState<ErrorsMap>({});

    useEffect(() => {
        const ac = new AbortController();

        (async () => {
            setLoading(true);
            setErrors({});

            const [ftRes, ctRes, pxRes, ccRes] = await Promise.allSettled([
                getMasterListingData<FlightTypesResponse>(listingTables.flightTypes, ac.signal),
                getMasterListingData<CountriesResponse>(listingTables.countries, ac.signal),
                getMasterListingData<PassengersResponse>(listingTables.passengers, ac.signal),
                getMasterListingData<CabinClassesResponse>(listingTables.cabinClasses, ac.signal),
            ]);

            // flight types
            if (ftRes.status === "fulfilled") {
                setFlightTypes(buildFlightTypeOptions(ftRes.value?.items ?? []));
            } else {
                setErrors(prev => ({ ...prev, flightTypes: ftRes.reason?.message ?? "Failed to load flight types" }));
                setFlightTypes(buildFlightTypeOptions([])); // optional fallback (gives default 3)
            }

            // countries
            if (ctRes.status === "fulfilled") {
                setCountries(buildCountryOptions(ctRes.value?.items ?? []));
            } else {
                setErrors(prev => ({ ...prev, countries: ctRes.reason?.message ?? "Failed to load countries" }));
                setCountries([]); // stays empty -> your dropdown shows "Please select"
            }

            // passengers
            if (pxRes.status === "fulfilled") {
                setPassengers(buildPassengerSchema(pxRes.value?.items ?? []));
            } else {
                setErrors(prev => ({ ...prev, passengers: pxRes.reason?.message ?? "Failed to load passengers" }));
                setPassengers([]); // your dropdown will use its internal defaults if you want
            }

            // cabin classes
            if (ccRes.status === "fulfilled") {
                setCabinClasses(buildCabinClassOptions(ccRes.value?.items ?? []));
            } else {
                setErrors(prev => ({ ...prev, cabinClasses: ccRes.reason?.message ?? "Failed to load cabin classes" }));
                setCabinClasses([]);
            }

            setLoading(false);
        })().catch(() => setLoading(false));

        return () => ac.abort();
    }, []);

    const error =
        Object.values(errors).filter(Boolean).join(" • ") || null;

    return { flightTypes, countries, passengers, cabinClasses, loading, error, errors };
}
