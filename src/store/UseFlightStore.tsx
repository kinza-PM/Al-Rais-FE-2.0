import { create } from "zustand";

export type FlightLeg = {
  fromCode: string;
  toCode: string;
  date: string | null;
  cabinClassId?: string;
  fromOption?: { id: string; label: string; code: string; city: string; country: string } | null;
  toOption?: { id: string; label: string; code: string; city: string; country: string } | null;
};

type Flight = {
  fromCode: string;
  toCode: string;
  fromOption?: {
    id: string;
    label: string;
    code: string;
    city: string;
    country: string;
  } | null;
  toOption?: {
    id: string;
    label: string;
    code: string;
    city: string;
    country: string;
  } | null;
  selectedCabinClassId: number | string;
  trip: string;
  order?: string[];
  next?: Record<string, number>;
  departure?: string | null;
  arrival?: string | null;
  /** For multicity: legs with fromCode, toCode, date per flight */
  legs?: FlightLeg[];
  flight_filters?: Record<string, any>;
};

export type FlightSearchState = {
  // form
  trip: string;
  fromCode: string;
  toCode: string;
  fromOption?: any | null;
  toOption?: any | null;
  selectedCabinClassId: string | number;
  departDate: string;
  returnDate: string;
  multicityLegs: FlightLeg[];
  paxCounts: Record<string, number>;
  passengerOrder: string[];
  preservedFromOption?: any | null;
  preservedToOption?: any | null;

  // results + paging
  responseData: any[];
  roundResponseData: any[];
  multicityResponseData: any[];
  originalResponse: any[];
  originalRoundResponse: any[];
  originalMulticityResponse: any[];
  hasMore: boolean;
  ioReady: boolean;
  hasSearched: boolean;
  isSearching: boolean;
  searchError: string | null;
  lastRequest: any | null;
  highDemandIndicators: any[];

  // client-side filters + sort
  selectedMaxConnections: number;
  departureFlightRange: { start: string; end: string };
  arrivalFlightRange: { start: string; end: string };
  selectedAirlineIds: string[];
  selectedTransitRange: string | null;
  baggageIncludedOnly: boolean;
  ancillaryAddOnsOnly: boolean;
  priceRangeBounds: [number, number];
  selectedPriceRange: [number, number];
  sortBy: string;
};

type Store = {
  flight: Flight | null;
  setFlight: (flight: Flight) => void;
  clearFlight: () => void;
  searchState: FlightSearchState | null;
  setSearchState: (state: FlightSearchState | null) => void;
  clearSearchState: () => void;
};

export const useFlightStore = create<Store>((set) => ({
  flight: null, // initially empty
  setFlight: (flight) => set({ flight }), // update with new flight
  clearFlight: () => set({ flight: null }), // clear flight data
  searchState: null,
  setSearchState: (state) => set({ searchState: state }),
  clearSearchState: () => set({ searchState: null }),
}));
