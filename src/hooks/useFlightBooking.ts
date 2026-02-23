import { useMutation } from "@tanstack/react-query";
import {
  postAncillaryBooking,
  postFlightAncillarySearch,
  postFlightFareRuleSearch,
  postFlightIngestView,
  postFlightReservationBooking,
  postInitialFlightProvBooking,
  postRetrieveFlightBooking,
  postUploadImagePreSignedUrl,
  postUploadTicket,
  type FlightAncillaryBooking,
  type FlightAncillarySearch,
  type FlightFareRuleSearch,
  type FlightIngestView,
  type FlightInitialBooking,
  type FlightReservationBooking,
  type RetrieveFlightBooking,
  type UploadImagePreSignedUrlRequest,
  type UploadTicketRequest,
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

export function useFlightIngestView() {
  return useMutation({
    mutationFn: (body: FlightIngestView) => postFlightIngestView(body),
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

export function useUploadImagePreSignedUrl() {
  return useMutation({
    mutationFn: (body: UploadImagePreSignedUrlRequest) =>
      postUploadImagePreSignedUrl(body),
  });
}

export function useUploadTicket() {
  return useMutation({
    mutationFn: (body: UploadTicketRequest) => postUploadTicket(body),
  });
}
