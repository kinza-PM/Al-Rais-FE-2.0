// services/api/flightSearch.ts
import { api, toApiError } from "../axios";

export type FlightSearchRequest = {
  departureAirportCode: string;
  departureDate: string;
  arrivalAirportCode: string;
  cabinPreferences: string[];
  passengers: { id: string; ptc: string }[];
};

export async function postFlightSearchData<TResp = any>(
  body: FlightSearchRequest
): Promise<TResp> {
  const source = "postFlightSearchData";
  try {
    return await api.post<TResp>("/flightSearch", body);
  } catch (err) {
    throw toApiError(source, err);
  }
}

export async function postMoreFareSearchData<TResp = any>(
  body: FlightSearchRequest
): Promise<TResp> {
  const source = "postMoreFareSearchData";
  try {
    return await api.post<TResp>("/moreFareSearch", body);
  } catch (err) {
    throw toApiError(source, err);
  }
}
