import { useMutation } from "@tanstack/react-query";
import { postFlightFareRuleSearch, postFlightReservationBooking, postInitialFlightProvBooking, type FlightFareRuleSearch, type FlightInitialBooking, type FlightReservationBooking } from "../services/api/flightBooking";

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

export function useFlightReservationBooking() {
    return useMutation({
        mutationFn: (body: FlightReservationBooking) => postFlightReservationBooking(body),
    });
}
