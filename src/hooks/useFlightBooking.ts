import { useMutation } from "@tanstack/react-query";
import { postFlightFareRuleSearch, postInitialFlightProvBooking, type FlightFareRuleSearch, type FlightInitialBooking } from "../services/api/flightBooking";

export function useFlightInitialBooking() {
    return useMutation({
        mutationFn: (body: FlightInitialBooking) => postInitialFlightProvBooking(body),
    });
}


export function useFlightFareRuleSearch() {
    return useMutation({
        mutationFn: (body: FlightFareRuleSearch) => postFlightFareRuleSearch(body),
    });
}
