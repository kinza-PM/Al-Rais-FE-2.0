import { create } from "zustand";

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
};

export const useHotelStore = create<Store>((set) => ({
  hotel: null,
  setHotel: (hotel) => set({ hotel }),
  clearHotel: () => set({ hotel: null }),
}));
