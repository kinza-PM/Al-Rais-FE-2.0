import { create } from "zustand";

export type LandingHeroTab = "flights" | "hotels";

type Store = {
  heroTab: LandingHeroTab;
  setHeroTab: (tab: LandingHeroTab) => void;
};

export const useLandingHeroStore = create<Store>((set) => ({
  heroTab: "flights",
  setHeroTab: (heroTab) => set({ heroTab }),
}));
