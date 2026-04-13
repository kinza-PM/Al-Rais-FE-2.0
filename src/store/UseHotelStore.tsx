import { create } from "zustand";
import type { HotelViewType } from "../features/hotels/types";
import {
  createEmptyHotelListingFilters,
  type HotelFilters,
  type SortOption,
} from "../utils/hotelFilters";

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
  /** Multi-select star filter from search bar (detail page / URL may round-trip this) */
  starRatings?: number[];
};

type Store = {
  hotel: HotelSearchState | null;
  setHotel: (hotel: HotelSearchState) => void;
  clearHotel: () => void;
  hotelView: HotelViewType;
  setHotelView: (view: HotelViewType) => void;
  /** Landing page hero: Flights vs Hotels tab (survives navigate away / back) */
  landingHeroSearchTab: "flights" | "hotels";
  setLandingHeroSearchTab: (tab: "flights" | "hotels") => void;
  /** Sidebar filters on /search-hotel (client-side) */
  hotelListingFilters: HotelFilters;
  setHotelListingFilters: (filters: HotelFilters) => void;
  hotelListingSortOption: SortOption;
  setHotelListingSortOption: (sort: SortOption) => void;
};

export const useHotelStore = create<Store>((set) => ({
  hotel: null,
  setHotel: (hotel) => set({ hotel }),
  clearHotel: () =>
    set({
      hotel: null,
      hotelListingFilters: createEmptyHotelListingFilters(),
      hotelListingSortOption: "",
    }),
  hotelView: "listview",
  setHotelView: (hotelView) => set({ hotelView }),
  landingHeroSearchTab: "flights",
  setLandingHeroSearchTab: (landingHeroSearchTab) => set({ landingHeroSearchTab }),
  hotelListingFilters: createEmptyHotelListingFilters(),
  setHotelListingFilters: (hotelListingFilters) => set({ hotelListingFilters }),
  hotelListingSortOption: "",
  setHotelListingSortOption: (hotelListingSortOption) =>
    set({ hotelListingSortOption }),
}));
