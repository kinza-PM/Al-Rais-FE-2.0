// services/api/flightSearch.ts
import { ensureBrowserId } from "../../utils/browserId";
import { api, toApiError } from "../axios";

export type FlightSearchRequest = {
  browserId?: string;
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

function withBrowserId(body: FlightSearchRequest): FlightSearchRequest {
  return { ...body, browserId: ensureBrowserId() };
}

export async function postFlightSearchData<TResp = any>(
  body: FlightSearchRequest
): Promise<TResp> {
  const source = "postFlightSearchData";
  try {
    return await api.post<TResp>("/flightSearch", withBrowserId(body));
  } catch (err) {
    throw toApiError(source, err);
  }
}

export async function postMoreFareSearchData<TResp = any>(
  body: FlightSearchRequest
): Promise<TResp> {
  const source = "postMoreFareSearchData";
  try {
    return await api.post<TResp>("/moreFareSearch", withBrowserId(body));
  } catch (err) {
    throw toApiError(source, err);
  }
}
