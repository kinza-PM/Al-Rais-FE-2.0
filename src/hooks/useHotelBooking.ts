import { useMutation } from "@tanstack/react-query";
import {
  postHotelPreBooking,
  postHotelReservationBooking,
  type HotelPreBooking,
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
