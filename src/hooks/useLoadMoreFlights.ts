import { useMutation } from "@tanstack/react-query";
import { postMoreFareSearchData, type FlightSearchRequest } from "../services/api/flightSearch";

export function useLoadMoreFlights() {
  const mutate = useMutation({
    mutationFn: (body: FlightSearchRequest) => postMoreFareSearchData(body),
  });

  return {
    loadMoreAsync: mutate.mutateAsync,
    isLoadingMore: mutate.isPending,
  };
}
