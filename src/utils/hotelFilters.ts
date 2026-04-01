export interface HotelFilters {
  hotelName: string;
  propertyTypes: string[];
  ratings: number[];
  propertyFacilities: string[];
  roomFacilities: string[];
  /** Values from `rooms[].roomTypeName` in search results (labels as shown in filter UI). */
  roomTypes: string[];
  bedPreferences: string[];
  meals: string[];
  cancellationPolicy: string[];
}

export type SortOption =
  | ""
  | "top_picks"
  | "homes_first"
  | "price_low"
  | "price_high"
  | "best_reviewed"
  | "rating_high"
  | "rating_low"
  | "rating_price"
  | "distance"
  | "top_reviewed"
  | "discounts"
  | "beach";

export const PROPERTY_TYPE_MAPPINGS: Record<string, string> = {
  H: "Hotel",
  P: "Pension / Guesthouse",
  A: "Apartment",
  S: "Suite / Studio",
  V: "Villa",
  R: "Resort",
  G: "Guesthouse",
  B: "Bed & Breakfast",
  M: "Motel",
  L: "Lodge",
};

// Facility name mappings for case-insensitive matching
const FACILITY_MAPPINGS: Record<string, string[]> = {
  "Free WIFI": ["wifi", "wi-fi", "wireless", "internet"],
  Parking: ["parking", "car park"],
  "Non-smoking rooms": ["non-smoking", "no smoking", "smoke free"],
  "Airport Shuttle": [
    "airport shuttle",
    "airport transfer",
    "transfer service",
  ],
  "Swimming pool": ["swimming pool", "pool"],
  "Private pool": ["private pool"],
  "Sea view": ["sea view", "ocean view"],
  Balcony: ["balcony"],
  "Private bathroom": ["private bathroom", "bathroom"],
  "Air conditioning": ["air conditioning", "aircon", "ac"],
  "Twin beds": ["twin", "twin bed"],
  "Double bed": ["double", "double bed"],
  "Kitchen facilities": ["kitchen", "kitchenette"],
  "Breakfast included": ["breakfast", "breakfast included"],
};

// Property type mappings
// const PROPERTY_TYPE_MAPPINGS: Record<string, string[]> = {
//   Hotels: ["H"],
//   "Pension/Property": ["P"],
// };

// Check if facility exists (case-insensitive)
const hasFacility = (facilities: any[], searchTerm: string): boolean => {
  if (!facilities || facilities.length === 0) return false;

  //   const searchLower = searchTerm.toLowerCase();
  const mappings = FACILITY_MAPPINGS[searchTerm] || [searchTerm.toLowerCase()];

  return facilities.some((facility: any) => {
    const facilityName = (facility?.name || facility || "").toLowerCase();
    return mappings.some((mapping) => facilityName.includes(mapping));
  });
};

// Check if property type matches
const matchesPropertyType = (
  propertyType: string | undefined,
  selectedTypes: string[]
): boolean => {
  if (selectedTypes.length === 0) return true;
  if (!propertyType) return false;

  const rawCode = propertyType.trim().toUpperCase();
  const readableLabel = PROPERTY_TYPE_MAPPINGS[rawCode] || rawCode;

  return selectedTypes.includes(readableLabel);

  // const propertyTypeUpper = propertyType.toUpperCase();

  // return selectedTypes.some((selectedType) => {
  //   const mappings = PROPERTY_TYPE_MAPPINGS[selectedType] || [];
  //   return mappings.some(
  //     (mapping) =>
  //       mapping.toUpperCase() === propertyTypeUpper ||
  //       selectedType.toLowerCase() === "hotels"
  //   );
  // });
};

// Check if rating matches
const matchesRating = (
  starRating: string | undefined,
  selectedRatings: number[]
): boolean => {
  if (selectedRatings.length === 0) return true;
  if (!starRating) return false;

  const rating = Math.floor(parseFloat(starRating));
  return selectedRatings.includes(rating);
};

// Check if hotel has free cancellation
const hasCancellationPolicy = (rooms: any[], policyType: string): boolean => {
  return rooms.some((room: any) => {
    // const policy = (room?.ratePlan?.cancelPolicyIndicator || "").toLowerCase();
    const policy = (
      room?.ratePlan?.cancellationPolicy ||
      room?.ratePlan?.cancelPolicyIndicator ||
      room?.rateNotes ||
      ""
    )
      .trim()
      .toLowerCase();

    if (policyType === "Free cancellation") {
      return (
        policy.includes("refundable") && !policy.includes("non-refundable")
      );
    }

    // if (policyType === "Non-refundable") {
    //   return policy.includes("non-refundable");
    // }
    if (policyType === "Non-refundable") {
      return (
        policy.includes("non-refundable") ||
        policy.includes("non refundable") ||
        policy.includes("no refund")
      );
    }

    return false;
  });
};

// Check if room has meal option (exact match from API)
const hasMealOption = (rooms: any[], mealType: string): boolean => {
  return rooms.some((room: any) => {
    const meal = (room?.ratePlan?.meal || "").trim().toLowerCase();
    return meal === mealType.toLowerCase();
  });
};

/**
 * Strips refundable / rate-plan fragments often appended to `roomTypeName`
 * (e.g. "- Non Refundable rate", "- Normal rate") so room type filtering
 * stays separate from the cancellation policy filter.
 */
export function canonicalRoomTypeLabel(raw: string): string {
  const trimmed = (raw || "").trim();
  if (!trimmed) return "";
  // e.g. "Twin - Non Refundable rate", "Studio – Normal rate"
  const rateSuffix =
    /\s*[-–—]\s*(non[-\s]?refundable(\s+rate)?|normal\s+rate)\s*$/i;
  let s = trimmed;
  let prev = "";
  while (s !== prev) {
    prev = s;
    s = s.replace(rateSuffix, "").trim();
  }
  return s.length > 0 ? s : trimmed;
}

const matchesRoomTypes = (rooms: any[], selectedLabels: string[]): boolean => {
  if (selectedLabels.length === 0) return true;
  const selectedLc = new Set(
    selectedLabels
      .map((s) => canonicalRoomTypeLabel(s).toLowerCase())
      .filter(Boolean),
  );
  return rooms.some((room: any) => {
    const canon = canonicalRoomTypeLabel(room?.roomTypeName || "");
    return canon.length > 0 && selectedLc.has(canon.toLowerCase());
  });
};

// Filter hotels based on criteria
export const filterHotels = (hotels: any[], filters: HotelFilters): any[] => {
  return hotels.filter((hotel) => {
    // Hotel name filter
    if (filters.hotelName) {
      const hotelName = (hotel?.propertyInfo?.hotelName || "").toLowerCase();
      const searchTerm = filters.hotelName.toLowerCase();
      if (!hotelName.includes(searchTerm)) {
        return false;
      }
    }

    // Property type filter
    if (
      !matchesPropertyType(
        hotel?.propertyInfo?.propertyType,
        filters.propertyTypes
      )
    ) {
      return false;
    }

    // Rating filter
    if (!matchesRating(hotel?.propertyInfo?.starRating, filters.ratings)) {
      return false;
    }

    // Property facilities filter
    if (filters.propertyFacilities.length > 0) {
      const hotelFacilities = hotel?.propertyInfo?.facilities || [];
      const allMatch = filters.propertyFacilities.some((facility) =>
        hasFacility(hotelFacilities, facility)
      );
      if (!allMatch) {
        return false;
      }
    }

    // Room facilities filter
    if (filters.roomFacilities.length > 0) {
      const allRooms = hotel?.rooms || [];
      const allMatch = filters.roomFacilities.some((facility) => {
        return allRooms.some((room: any) =>
          hasFacility(room?.roomFacilities || [], facility)
        );
      });
      if (!allMatch) {
        return false;
      }
    }

    if (filters.roomTypes.length > 0) {
      const allRooms = hotel?.rooms || [];
      if (!matchesRoomTypes(allRooms, filters.roomTypes)) {
        return false;
      }
    }

    // Bed preferences filter (this would need room description matching)
    // For now, we'll skip this as it's not in the API data structure

    // Meals filter
    if (filters.meals.length > 0) {
      const allRooms = hotel?.rooms || [];
      const allMatch = filters.meals.some((meal) =>
        hasMealOption(allRooms, meal)
      );
      if (!allMatch) {
        return false;
      }
    }

    // Reservation policy filter
    if (filters.cancellationPolicy.length > 0) {
      const allMatch = filters.cancellationPolicy.some((policy) =>
        hasCancellationPolicy(hotel?.rooms || [], policy)
      );
      if (!allMatch) {
        return false;
      }
    }

    return true;
  });
};

// Sort hotels
export const sortHotels = (hotels: any[], sortOption: SortOption): any[] => {
  const sorted = [...hotels];

  // If no sort option selected, return original order
  if (!sortOption) {
    return sorted;
  }

  switch (sortOption) {
    case "price_low":
      return sorted.sort((a, b) => {
        const priceA = a?.totalPrice || 0;
        const priceB = b?.totalPrice || 0;
        return priceA - priceB;
      });

    case "price_high":
      return sorted.sort((a, b) => {
        const priceA = a?.totalPrice || 0;
        const priceB = b?.totalPrice || 0;
        return priceB - priceA;
      });

    case "rating_high":
      return sorted.sort((a, b) => {
        const ratingA = parseFloat(a?.propertyInfo?.starRating || "0");
        const ratingB = parseFloat(b?.propertyInfo?.starRating || "0");
        return ratingB - ratingA;
      });

    case "rating_low":
      return sorted.sort((a, b) => {
        const ratingA = parseFloat(a?.propertyInfo?.starRating || "0");
        const ratingB = parseFloat(b?.propertyInfo?.starRating || "0");
        return ratingA - ratingB;
      });

    case "rating_price":
      return sorted.sort((a, b) => {
        const ratingA = parseFloat(a?.propertyInfo?.starRating || "0");
        const ratingB = parseFloat(b?.propertyInfo?.starRating || "0");
        if (ratingB !== ratingA) {
          return ratingB - ratingA;
        }
        const priceA = a?.totalPrice || 0;
        const priceB = b?.totalPrice || 0;
        return priceA - priceB;
      });

    case "discounts":
      return sorted.sort((a, b) => {
        // Sort by hotels with offers first
        const aHasOffer = a?.rooms?.some((room: any) =>
          room?.offers?.some((offer: any) => offer.included)
        );
        const bHasOffer = b?.rooms?.some((room: any) =>
          room?.offers?.some((offer: any) => offer.included)
        );
        if (aHasOffer !== bHasOffer) {
          return aHasOffer ? -1 : 1;
        }
        return 0;
      });

    case "top_picks":
    case "best_reviewed":
    case "top_reviewed":
    case "homes_first":
    case "distance":
    case "beach":
    default:
      // Default sorting - keep original order or implement custom logic
      return sorted;
  }
};

// Get active filter count
export const getActiveFilterCount = (filters: HotelFilters): number => {
  let count = 0;
  if (filters.hotelName) count++;
  if (filters.propertyTypes.length > 0) count++;
  if (filters.ratings.length > 0) count++;
  if (filters.propertyFacilities.length > 0) count++;
  if (filters.roomFacilities.length > 0) count++;
  if (filters.roomTypes.length > 0) count++;
  if (filters.bedPreferences.length > 0) count++;
  if (filters.meals.length > 0) count++;
  if (filters.cancellationPolicy.length > 0) count++;
  return count;
};
