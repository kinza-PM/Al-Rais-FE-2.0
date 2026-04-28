// src/store/useAncillaryStore.ts
import { create } from "zustand";

export type AncillaryEntry = {
  ancillaryOfferId: string;
  passengerKey: string;
  segmentKey: string;
};

export type AllSelections = {
  baggage?: BaggageSelection;
  meals?: MealSelection;
  seats?: SeatSelection;
  otherAncillaries?: OtherAncillariesSelection;
};

type OtherAncillariesSelection = Record<
  string,
  Record<string, Record<string, boolean>>
>;
type BaggageSelection = Record<string, Record<string, string | null>>;
type MealSelection = Record<
  string,
  Record<string, Record<string, Record<string, number>>>
>;
type SeatSelection = Record<
  string,
  Record<string, { seatNumber: string; ancillaryOfferId?: string }>
>;

type AncillaryStore = {
  otherAncillariesSelections: OtherAncillariesSelection;
  baggageSelections: BaggageSelection;
  mealSelections: MealSelection;
  seatSelections: SeatSelection;

  setOtherAncillariesSelections: (
    selections: OtherAncillariesSelection
  ) => void;
  setBaggageSelections: (selections: BaggageSelection) => void;
  setMealSelections: (selections: MealSelection) => void;
  setSeatSelections: (selections: SeatSelection) => void;

  getAllSelections: () => {
    otherAncillaries: OtherAncillariesSelection;
    baggage: BaggageSelection;
    meals: MealSelection;
    seats: SeatSelection;
  };

  clearAll: () => void;
};

export const useAncillaryStore = create<AncillaryStore>((set, get) => ({
  otherAncillariesSelections: {},
  baggageSelections: {},
  mealSelections: {},
  seatSelections: {},

  setOtherAncillariesSelections: (selections) =>
    set({ otherAncillariesSelections: selections }),
  setBaggageSelections: (selections) => set({ baggageSelections: selections }),
  setMealSelections: (selections) => set({ mealSelections: selections }),
  setSeatSelections: (selections) => set({ seatSelections: selections }),

  getAllSelections: () => ({
    otherAncillaries: get().otherAncillariesSelections,
    baggage: get().baggageSelections,
    meals: get().mealSelections,
    seats: get().seatSelections,
  }),

  clearAll: () =>
    set({
      otherAncillariesSelections: {},
      baggageSelections: {},
      mealSelections: {},
      seatSelections: {},
    }),
}));
