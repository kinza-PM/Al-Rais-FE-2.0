import { useMutation } from "@tanstack/react-query";
import {
  postMyHotelBookings,
  type MyHotelBookingRequest,
} from "../services/api/hotelBooking";

export function useMyHotelBooking() {
  return useMutation({
    mutationFn: (body: MyHotelBookingRequest) => postMyHotelBookings(body),
  });
}
