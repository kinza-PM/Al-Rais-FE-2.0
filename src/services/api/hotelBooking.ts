// services/api/flightSearch.ts
import type { HotelBookingPayload } from "../../utils/hotelBookingHelper";
import { api, toApiError } from "../axios";

export type HotelPreBooking = {
  hotelKey: string;
  searchKey: string;
  rooms: Array<{
    roomIndex: number;
    roomKey: string;
  }>;
};

export async function postHotelPreBooking<TResp = any>(
  body: HotelPreBooking,
): Promise<TResp> {
  const source = "postHotelPreBooking";
  try {
    return await api.post<TResp>("/hotelPreBook", body);
  } catch (err) {
    throw toApiError(source, err);
  }
}

export async function postHotelReservationBooking<TResp = any>(
  body: HotelBookingPayload,
): Promise<TResp> {
  const source = "postHotelReservationBooking";
  try {
    return await api.post<TResp>("/hotelBooking", body);
  } catch (err) {
    throw toApiError(source, err);
  }
}
