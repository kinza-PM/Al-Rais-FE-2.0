export const listingTables = {
  flightTypes: "flights-types",
  airports: "countries-listing",
  passengers: "passengers",
  cabinClasses: "cabin-class",
  priceSorted: "price-filters",
  numberStops: "number-stops",
  transitHours: "transit-hours",
  baggage: "baggage",
  airlines: "airline-codes",
  flightCancelReason: "flight-cancel-reason",
} as const;

/** Optional extra `/getListingData` query params keyed like `listingTables`. */
export const listingExtraParams: Partial<
  Record<keyof typeof listingTables, Record<string, string>>
> = {
  cabinClasses: { sortBy: "sequence", sortOrder: "asc" },
};
