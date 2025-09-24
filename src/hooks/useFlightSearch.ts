import { useMutation } from "@tanstack/react-query";
import { postFlightSearchData, type FlightSearchRequest } from "../services/api/flightSearch";

export function useFlightSearch() {
  return useMutation({
    mutationFn: (body: FlightSearchRequest) => postFlightSearchData(body),
  });
}
