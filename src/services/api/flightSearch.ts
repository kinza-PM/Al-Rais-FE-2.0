// services/api/flightSearch.ts
import { api, toApiError, userGuestOrLoginHeaders } from "../axios";

export type FlightSearchRequest = {
  flightSegments: {
    departureAirportCode: string;
    departureDate: string;
    arrivalAirportCode: string;
    cabinPreferences?: string[];
  }[];
  passengers: {
    id: string;
    ptc: string;
  }[];
};

export async function postFlightSearchData<TResp = any>(
  body: FlightSearchRequest
): Promise<TResp> {
  const source = "postFlightSearchData";
  const headers = await userGuestOrLoginHeaders();
  try {
    return await api.post<TResp>("/flightSearch", body, {headers});
  } catch (err) {
    throw toApiError(source, err);
  }
}

export async function postMoreFareSearchData<TResp = any>(
  body: FlightSearchRequest
): Promise<TResp> {
  const source = "postMoreFareSearchData";
  const headers = await userGuestOrLoginHeaders();
  try {
    return await api.post<TResp>("/moreFareSearch", body, { headers });
  } catch (err) {
    throw toApiError(source, err);
  }
}
