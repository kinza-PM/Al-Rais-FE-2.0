import { create } from "zustand";
import type { HotelViewType } from "../features/hotels/types";

export type HotelSearchState = {
  country: string;
  city: string;
  checkIn: string;
  checkOut: string;
  travelerCountryOfResidence: string;
  travelerNationality: string;
  paxData: {
    adults?: number;
    kids?: number;
    children?: number;
    rooms?: number;
  };
  childAges: Array<number | null>;
  minStarRating: number;
};

type Store = {
  hotel: HotelSearchState | null;
  setHotel: (hotel: HotelSearchState) => void;
  clearHotel: () => void;
  hotelView: HotelViewType;
  setHotelView: (view: HotelViewType) => void;
};

export const useHotelStore = create<Store>((set) => ({
  hotel: null,
  setHotel: (hotel) => set({ hotel }),
  clearHotel: () => set({ hotel: null }),
  hotelView: "listview",
  setHotelView: (hotelView) => set({ hotelView }),
}));
