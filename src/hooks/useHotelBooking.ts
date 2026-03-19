import { useMutation } from "@tanstack/react-query";
import {
  postHotelPreBooking,
  postHotelReservationBooking,
  postHotelRetrieve,
  type HotelPreBooking,
  type HotelRetrieveRequest,
} from "../services/api/hotelBooking";
import type { HotelBookingPayload } from "../utils/hotelBookingHelper";

export function useHotelPreBooking() {
  return useMutation({
    mutationFn: (body: HotelPreBooking) => postHotelPreBooking(body),
  });
}

export function useHotelReservationBooking() {
  return useMutation({
    mutationFn: (body: HotelBookingPayload) =>
      postHotelReservationBooking(body),
  });
}

export function useHotelRetrieve() {
  return useMutation({
    mutationFn: (body: HotelRetrieveRequest) => postHotelRetrieve(body),
  });
}