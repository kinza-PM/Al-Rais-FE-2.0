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

type Store = {
  flight: Flight | null;
  setFlight: (flight: Flight) => void;
  clearFlight: () => void;
};

export const useFlightStore = create<Store>((set) => ({
  flight: null, // initially empty
  setFlight: (flight) => set({ flight }), // update with new flight
  clearFlight: () => set({ flight: null }), // clear flight data
}));
