import { useMutation } from "@tanstack/react-query";
import {
  postHotelDetailData,
  postHotelGetMoreRoomsData,
  postHotelSearchData,
  type HotelDetailRequest,
  type HotelSearchRequest,
} from "../services/api/hotelSearch";

export function useHotelSearch() {
  return useMutation({
    mutationFn: (body: HotelSearchRequest) => postHotelSearchData(body),
  });
}

export function useHotelDetail() {
  return useMutation({
    mutationFn: (body: HotelDetailRequest) => postHotelDetailData(body),
  });
}

export function useHotelGetMoreRooms() {
  return useMutation({
    mutationFn: (body: HotelDetailRequest) => postHotelGetMoreRoomsData(body),
  });
}
