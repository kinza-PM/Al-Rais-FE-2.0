import { useMutation } from "@tanstack/react-query";
import { postMoreFareSearchData } from "../services/api/flightSearch";

type FlightSearchRequest = {
  departureAirportCode: string;
  departureDate: string;
  arrivalAirportCode: string;
  cabinPreferences: string[];
  passengers: { id: string; ptc: string }[];
};

export function useLoadMoreFlights() {
  const mutate = useMutation({
    mutationFn: (body: FlightSearchRequest) => postMoreFareSearchData(body),
  });

  return {
    loadMoreAsync: mutate.mutateAsync,
    isLoadingMore: mutate.isPending,
  };
}
