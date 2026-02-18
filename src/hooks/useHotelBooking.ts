import { useMutation } from "@tanstack/react-query";
import {
  postHotelPreBooking,
  type HotelPreBooking,
} from "../services/api/hotelBooking";

export function useHotelPreBooking() {
  return useMutation({
    mutationFn: (body: HotelPreBooking) => postHotelPreBooking(body),
  });
}
