import { useMutation } from "@tanstack/react-query";
import { postFlightSearchData } from "../services/api/flightSearch";

type FlightSearchRequest = {
  departureAirportCode: string;
  departureDate: string;
  arrivalAirportCode: string;
  cabinPreferences: string[];
  passengers: { id: string; ptc: string }[];
};

export function useFlightSearch() {
  return useMutation({
    mutationFn: (body: FlightSearchRequest) => postFlightSearchData(body),
  });
}
