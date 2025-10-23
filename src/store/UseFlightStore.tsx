import { create } from "zustand";

type Flight = {
  fromCode: string;
  toCode: string;
  selectedCabinClassId: number | string;
  trip: string;
  order?: string[];
  next?: Record<string, number>;
  departure?: string | null;
  arrival?: string | null;
  flight_filters?: Record<string, any>;
};

type Store = {
  flight: Flight | null;
  setFlight: (flight: Flight) => void;
};

export const useFlightStore = create<Store>((set) => ({
  flight: null, // initially empty
  setFlight: (flight) => set({ flight }), // update with new flight
}));
