import { useMutation } from "@tanstack/react-query";
import {
  type AddHotelFavouriteRequest,
  postAddHotelFavouriteData,
} from "../services/api/hotelFavourite";

export const useAddHotelFavourite = () => {
  return useMutation({
    mutationFn: (body: AddHotelFavouriteRequest) =>
      postAddHotelFavouriteData(body),
  });
};