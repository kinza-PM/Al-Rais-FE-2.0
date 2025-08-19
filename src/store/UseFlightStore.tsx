import { create } from "zustand";

type Flight = {
  fromCode: string;
  toCode: string;
  selectedCabinClassId: number | string;
};

type Store = {
  flight: Flight | null;
  setFlight: (flight: Flight) => void;
};

export const useFlightStore = create<Store>((set) => ({
  flight: null, // initially empty
  setFlight: (flight) => set({ flight }), // update with new flight
}));
