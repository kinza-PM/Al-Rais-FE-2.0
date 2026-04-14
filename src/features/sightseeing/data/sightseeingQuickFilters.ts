import type { SightseeingActivity } from "../types";

/** Listing “Quick filters” pills — UI taxonomy, not supplier data. */
export const SIGHTSEEING_QUICK_FILTERS: {
  id: SightseeingActivity["quickFilter"];
  label: string;
}[] = [
  { id: "all", label: "All" },
  { id: "cultural", label: "Cultural Heritage" },
  { id: "shopping", label: "Shopping Experiences" },
  { id: "adventure", label: "Adventure and Thrill" },
  { id: "family", label: "Family Attractions" },
  { id: "nature", label: "Nature and Parks" },
  { id: "beaches", label: "Beaches and Resorts" },
];
