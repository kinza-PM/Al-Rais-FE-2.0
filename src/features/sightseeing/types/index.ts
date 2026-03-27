/** Sightseeing module — align with features/hotels and features/flights typing patterns */

export type SightseeingActivityCategory =
  | "all"
  | "tours"
  | "attractions"
  | "experiences"
  | "transfers"
  | "events";

export type SightseeingHeroSearchState = {
  country: string;
  city: string;
  category: SightseeingActivityCategory | string;
};

/** Quick-filter slugs (listing page pills) */
export type SightseeingQuickFilterId =
  | "all"
  | "cultural"
  | "shopping"
  | "adventure"
  | "family"
  | "nature"
  | "beaches";

export type SightseeingGroupSize =
  | "individual"
  | "small"
  | "private"
  | "large";

export type SightseeingActivityHours = "0-3h" | "3-6h" | "6-12h" | "12h+" | "24h+";

/** Dummy / future API row shape */
export type SightseeingActivity = {
  id: string;
  title: string;
  categoryLabel: string;
  quickFilter: SightseeingQuickFilterId;
  imageSrc: string;
  rating: number;
  reviewCount: number;
  durationLabel: string;
  groupLabel: string;
  groupSize: SightseeingGroupSize;
  starLevel: number;
  hours: SightseeingActivityHours;
  allowsChildren: boolean;
  allowsTeens: boolean;
  allowsAdults: boolean;
  price: number;
  currency: string;
};

/** Normalised Hotel Beds `activitiesDetail` response (rateKey list for booking). */
export type SightseeingActivityDetailRate = {
  rateKey: string;
  modalityCode: string;
  modalityName: string;
  amount: number;
  currency: string;
  label: string;
};

export type SightseeingActivityDetailView = {
  code: string;
  name: string;
  currency: string;
  type?: string;
  rateOptions: SightseeingActivityDetailRate[];
  raw: unknown;
};
