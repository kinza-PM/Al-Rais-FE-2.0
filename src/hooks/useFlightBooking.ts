import { useMutation } from "@tanstack/react-query";
import {
  postFlightFareRuleSearch,
  postFlightReservationBooking,
  postInitialFlightProvBooking,
  postRetrieveFlightBooking,
  type FlightFareRuleSearch,
  type FlightInitialBooking,
  type FlightReservationBooking,
  type RetrieveFlightBooking,
} from "../services/api/flightBooking";

export function useFlightInitialBooking() {
  return useMutation({
    mutationFn: (body: FlightInitialBooking) =>
      postInitialFlightProvBooking(body),
  });
}

export function useFlightFareRuleSearch() {
  return useMutation({
    mutationFn: (body: FlightFareRuleSearch) => postFlightFareRuleSearch(body),
  });
}

export function useFlightReservationBooking() {
  return useMutation({
    mutationFn: (body: FlightReservationBooking) =>
      postFlightReservationBooking(body),
  });
}

export function useRetrieveFlightBooking() {
  return useMutation({
    mutationFn: (body: RetrieveFlightBooking) =>
      postRetrieveFlightBooking(body),
  });
}
