import { useMutation } from "@tanstack/react-query";
import {
  postPreConfirmBooking,
  postConfirmBooking,
  postCancelBooking,
} from "../../services/api/activitiesSearch";

export function useActivitiesPreConfirmBooking() {
  return useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      postPreConfirmBooking(body),
  });
}

export function useActivitiesConfirmBooking() {
  return useMutation({
    mutationFn: (body: Record<string, unknown>) => postConfirmBooking(body),
  });
}

export function useActivitiesCancelBooking() {
  return useMutation({
    mutationFn: (body: Record<string, unknown>) => postCancelBooking(body),
  });
}
