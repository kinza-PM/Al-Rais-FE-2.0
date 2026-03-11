import { useMutation,useQuery  } from "@tanstack/react-query";
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

export function useGetHotelFavourites(enabled: boolean = true) {
  return useQuery({
    queryKey: ["hotel-favourites"],
    queryFn: () => getHotelFavouritesData(),
    enabled,
  });
}
