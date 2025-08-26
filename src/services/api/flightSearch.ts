// services/api/apiMasterListing.ts
import { api, toApiError } from "../axios";

export async function postFlightSearchData<TResp = any>(body: {
  departureAirportCode: string;
  departureDate: string;
  arrivalAirportCode: string;
  cabinPreferences: string[];
  passengers: { id: string; ptc: string }[];
}): Promise<TResp> {
  const source = "postFlightSearchData";
  try {
    return await api.post<TResp>("/flightSearch", body);
  } catch (err) {
    throw toApiError(source, err);
  }
}
