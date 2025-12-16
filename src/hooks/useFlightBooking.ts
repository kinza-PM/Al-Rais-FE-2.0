import { useMutation } from "@tanstack/react-query";
import {
  postAncillaryBooking,
  postFlightAncillarySearch,
  postFlightFareRuleSearch,
  postFlightReservationBooking,
  postInitialFlightProvBooking,
  postRetrieveFlightBooking,
  type FlightAncillaryBooking,
  type FlightAncillarySearch,
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

export function useFlightAncillaryBooking() {
  return useMutation({
    mutationFn: (body: FlightAncillaryBooking) => postAncillaryBooking(body),
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

export function useFlightAncillarySearch() {
  return useMutation({
    mutationFn: (body: FlightAncillarySearch) =>
      postFlightAncillarySearch(body),
  });
}
