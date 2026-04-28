import { useMutation, useQuery, keepPreviousData } from "@tanstack/react-query";
import {
  postHotelDetailData,
  postHotelGetMoreRoomsData,
  postHotelSearchData,
  type HotelDetailRequest,
  type HotelSearchRequest,
} from "../services/api/hotelSearch";
import {
  type AddHotelFavouriteRequest,
  postAddHotelFavouriteData,
  getHotelFavouritesData
} from "../services/api/hotelFavourite";
import {
  postHotelCancellationChargesData,
  type HotelCancellationChargesRequest,
} from "../services/api/hotelCancellation";

import {
  postHotelCancellationData,
  type HotelCancellationRequest,
} from "../services/api/hotelCancellation";

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

export const useAddHotelFavourite = () => {
  return useMutation({
    mutationFn:(body: AddHotelFavouriteRequest) =>  postAddHotelFavouriteData(body),
  });
};

export function useGetHotelFavourites(enabled: boolean = true, city?: string) {
  return useQuery({
    queryKey: ["hotel-favourites", city || ""],
    queryFn: () => getHotelFavouritesData(city),
    enabled,
    staleTime: 5 * 60 * 1000,
    placeholderData: keepPreviousData,
  });
}
export function useHotelCancellationCharges() {
  return useMutation({
    mutationFn: (body: HotelCancellationChargesRequest) =>
      postHotelCancellationChargesData(body),
  });
}

export function useHotelCancellation() {
  return useMutation({
    mutationFn: (body: HotelCancellationRequest) =>
      postHotelCancellationData(body),
  });
}