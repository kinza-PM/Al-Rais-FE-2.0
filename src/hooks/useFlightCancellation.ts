import { useMutation } from "@tanstack/react-query";
import {
  postFlightCancellationChargesData,
  postFlightCancellationData,
  type FlightCancellationChargesRequest,
  type FlightCancellationRequest,
} from "../services/api/flightCancellation";

export function useFlightCancellationCharges() {
  return useMutation({
    mutationFn: (body: FlightCancellationChargesRequest) =>
      postFlightCancellationChargesData(body),
  });
}

export function useFlightCancellation() {
  return useMutation({
    mutationFn: (body: FlightCancellationRequest) =>
      postFlightCancellationData(body),
  });
}