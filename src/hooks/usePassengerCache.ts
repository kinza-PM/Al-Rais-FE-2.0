import { useMutation, useQuery } from "@tanstack/react-query";
import {
  postPassengerCache,
  type PassengerCacheRequest,
} from "../services/api/passengerCache";

export function usePassengerCacheFetch() {
  return useQuery({
    queryKey: ["passengerCache", "fetch"],
    queryFn: () => postPassengerCache({ type: "fetch" }),
  });
}

export function usePassengerCacheAdd() {
  return useMutation({
    mutationFn: (body: Extract<PassengerCacheRequest, { type: "add" }>) =>
      postPassengerCache(body),
  });
}

