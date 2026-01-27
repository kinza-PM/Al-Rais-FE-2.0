// services/api/flightSearch.ts
import { api, toApiError } from "../axios";

export type RoomData = {
  adult: number;
  child: number;
  childAge: number[];
  roomIndex: number;
};

export type HotelSearchRequest = {
  country: string;
  city: string;
  checkIn: string;
  checkOut: string;
  rooms: RoomData[];
  travelerCountryOfResidence: string;
  travelerNationality: string;
  culture: string;
  filters: {
    currency: string;
    minStarRating: number;
  };
};

export type HotelDetailRequest = {
  hotelKey: string;
  searchKey: string;
  culture: string;
};

export async function postHotelSearchData<TResp = any>(
  body: HotelSearchRequest
): Promise<TResp> {
  const source = "postHotelSearchData";
  try {
    return await api.post<TResp>("/hotelSearch", body);
  } catch (err) {
    throw toApiError(source, err);
  }
}

export async function postHotelDetailData<TResp = any>(
  body: HotelDetailRequest
): Promise<TResp> {
  const source = "postHotelDetailData";
  try {
    return await api.post<TResp>("/hotelDetail", body);
  } catch (err) {
    throw toApiError(source, err);
  }
}

export async function postHotelGetMoreRoomsData<TResp = any>(
  body: HotelDetailRequest
): Promise<TResp> {
  const source = "postHotelGetMoreRoomsData";
  try {
    return await api.post<TResp>("/getMoreRooms", body);
  } catch (err) {
    throw toApiError(source, err);
  }
}
