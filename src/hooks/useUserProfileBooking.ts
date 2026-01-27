import { useMutation } from "@tanstack/react-query";
import {
  postMyBooking,
  type UserProfileMyBooking,
} from "../services/api/flightBooking";

export function useMyBooking() {
  return useMutation({
    mutationFn: (body: UserProfileMyBooking) => postMyBooking(body),
  });
}
