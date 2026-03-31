import IndoorSwimmingPool from "../assets/svgs/indoor-swimming.svg";
import HotelWifi from "../assets/svgs/hotel-wifi.svg";
import AirportShuttle from "../assets/svgs/airport-shuttle.svg";
import HotelParking from "../assets/svgs/parking.svg";
import FamilyRooms from "../assets/svgs/family-rooms.svg";
import Fitness from "../assets/svgs/fitness.svg";
import Restaurant from "../assets/svgs/restaurant.svg";
import RoomService from "../assets/svgs/room-service.svg";
import TeaCoffeeMaker from "../assets/svgs/tea-coffee-maker.svg";
import HotelBreakfast from "../assets/svgs/hotel-breakfast.svg";
import Hotel from "../assets/svgs/hotel.svg";
import toast from "react-hot-toast";

export const FACILITY_KEYWORDS: Record<string, string[]> = {
  bathroom: [
    "Toilet paper",
    "Towels",
    "Guest bathroom",
    "Slippers",
    "Private bathroom",
    "Free toiletries",
    "Bathrobe",
    "Hairdryer",
    "Shower",
    "Bathroom",
    "Bathtub",
    "Toilet",
    "Toiletries",
  ],
  mediaAndTechnology: [
    "Flat screen TV",
    "Cable channels",
    "Satellite channels",
    "Video",
    "Telephone",
    "TV",
    "Flat-screen TV",
    "Wi-fi",
    "Wifi",
    "Internet",
    "Bluetooth",
    "Cable",
    "Satellite",
  ],
  foodAndDrink: [
    "Minibar",
    "Restaurant",
    "Tea/Coffee maker",
    "Breakfast",
    "Bar",
    "Dining",
    "Tea and coffee",
    "Coffee",
    "Tea",
  ],
  cleaningServices: [
    "Daily housekeeping",
    "Suit press",
    "Ironing service",
    "Dry cleaning",
    "Laundry",
    "Cleaning",
    "Housekeeping",
    "Ironing",
  ],
  safetyAndSecurity: [
    "Fire extinguishers",
    "CCTV outside property",
    "CCTV in common areas",
    "Smoke alarms",
    "Security alarm",
    "Smoke detector",
    "Security",
    "Alarm",
    "CCTV",
    "Fire",
  ],
  kitchen: [
    "Electric kettle",
    "Refrigerator",
    "Kitchenette",
    "Kitchen utensils",
    "Microwave",
    "Electric Kettle",
    "Toaster",
    "Oven",
    "Kitchen",
    "Utensils",
  ],
  bedrooms: [
    "Linens",
    "Wardrobe or closet",
    "Room size",
    "Towels and bed linen",
    "Bed",
    "Wardrobe",
    "Closet",
    "Linen",
  ],
};

export const GREAT_KEYWORDS: string[] = [
  "Restaurant",
  "Air conditioning",
  "Private bathroom",
  "Parking",
  "Free Wifi",
  "Airport Shuttle (free)",
  "Family rooms",
  "Flat-screen TV",
  "Fitness center",
  "Room service",
  "Soundproof room",
  "Desk",
  "220V power supply",
  "Individually adjustable air conditioning",
  "Individually adjustable heating",
];

const facilityIconMap: Record<string, string> = {
  "Indoor swimming pool": IndoorSwimmingPool,
  "Swimming pool": IndoorSwimmingPool,
  "Free Wifi": HotelWifi,
  "Wi-fi": HotelWifi,
  WiFi: HotelWifi,
  "Airport shuttle": AirportShuttle,
  "Transfer service": AirportShuttle,
  "Free Parking": HotelParking,
  "Car park": HotelParking,
  Parking: HotelParking,
  "Family Rooms": FamilyRooms,
  "Fitness center": Fitness,
  Fitness: Fitness,
  Gym: Fitness,
  Restaurant: Restaurant,
  "Room service": RoomService,
  "Tea/Coffee maker": TeaCoffeeMaker,
  "Tea and coffee making facilities": TeaCoffeeMaker,
  "Electric kettle": TeaCoffeeMaker,
  Breakfast: HotelBreakfast,
  "Continental breakfast": HotelBreakfast,
};

export const getFacilityIcon = (facilityName: string): string | null => {
  const normalizedName = facilityName.trim();

  if (facilityIconMap[normalizedName]) {
    return facilityIconMap[normalizedName];
  }

  const matchedKey = Object.keys(facilityIconMap).find(
    (key) =>
      normalizedName.toLowerCase().includes(key.toLowerCase()) ||
      key.toLowerCase().includes(normalizedName.toLowerCase())
  );

  return matchedKey ? facilityIconMap[matchedKey] : Hotel;
};

export const categorizeFacilities = (
  facilitySources: Array<any[]>, // Array of facility arrays (e.g., [hotelFacilities, roomFacilities] or just [roomFacilities])
  categories: string[], // e.g., ['bathroom', 'mediaAndTechnology', ...]
  keywords: Record<string, string[]>, // Category keywords
  greatKeywords: string[], // Fallback/great keywords
  fallbackCategory: string = "greatForYourStay" // Default fallback category
): Record<string, string[]> => {
  const empty = categories.reduce((acc, cat) => {
    acc[cat] = [] as string[];
    return acc;
  }, {} as Record<string, string[]>);

  const allFacilitiesSet = new Set<string>();
  facilitySources.forEach((source) => {
    if (source) {
      source.forEach((f: any) => {
        const cleanName = f?.name?.replace(/\*\*/g, "").trim();
        if (cleanName) allFacilitiesSet.add(cleanName);
      });
    }
  });

  const facilities = Array.from(allFacilitiesSet);
  if (facilities.length === 0) return empty;

  const sets: Record<string, Set<string>> = categories.reduce((acc, cat) => {
    acc[cat] = new Set();
    return acc;
  }, {} as Record<string, Set<string>>);

  for (const name of facilities) {
    const lower = name.toLowerCase();
    let assigned = false;
    for (const cat in keywords) {
      const kws = keywords[cat] || [];
      if (kws.some((k) => lower.includes(k.toLowerCase())) && sets[cat]) {
        // Added && sets[cat] check
        sets[cat].add(name);
        assigned = true;
        break;
      }
    }
    if (!assigned) {
      if (greatKeywords.some((k) => lower.includes(k.toLowerCase()))) {
        sets[fallbackCategory].add(name);
      } else {
        sets[fallbackCategory].add(name); // Fallback to specified category
      }
    }
  }

  return categories.reduce((acc, cat) => {
    acc[cat] = Array.from(sets[cat]);
    return acc;
  }, {} as Record<string, string[]>);
};

export interface ProcessedHotelData {
  hasRooms: boolean;
  allRooms: any[];
  availableRooms: any[];
  isAvailable: boolean;
  bestRoom: any;
  currency: string;
  price: number;
  hasFreeCancellation: boolean;
  totalOriginalPrice: number;
  uniqueOfferNames: string[];
  hasOffer: boolean;
}

/**
 * Process hotel data and calculate all room-related metrics
 * Used for displaying hotel information in list and grid views
 */
export const processHotelSearchListingData = (
  hotel: any
): ProcessedHotelData => {
  const hasRooms = hotel?.rooms && hotel?.rooms.length > 0;
  const allRooms = hotel?.rooms || [];

  // Check availability status from ALL rooms
  const availableRooms = allRooms.filter(
    (room: any) => room?.ratePlan?.availableStatus === "Available"
  );
  const isAvailable = availableRooms.length > 0;

  // Find the cheapest available room (or first room if none available)
  let bestRoom =
    availableRooms.length > 0
      ? availableRooms.reduce((cheapest: any, room: any) => {
        const roomPrice = room?.roomRate?.netAmount || 0;
        const cheapestPrice = cheapest?.roomRate?.netAmount || 0;
        return roomPrice < cheapestPrice ? room : cheapest;
      })
      : allRooms[0];

  // Fallback to first room if no bestRoom found
  if (!bestRoom && allRooms.length > 0) {
    bestRoom = allRooms[0];
  }

  const currency = bestRoom?.roomRate?.currency || "AED";
  const price = hotel?.totalPrice || bestRoom?.roomRate?.netAmount || 0;

  // Check if ANY room has free cancellation
  const hasFreeCancellation = availableRooms.some((room: any) => {
    const policy = room?.ratePlan?.cancelPolicyIndicator || "";
    return (
      policy.toLowerCase().includes("refundable") &&
      !policy.toLowerCase().includes("non-refundable")
    );
  });

  // Calculate total original price from ALL rooms (before discounts)
  // This is the sum of (roomPrice + discount) for each room
  let totalOriginalPrice = 0;
  const allOfferNames = new Set<string>();

  if (hotel?.totalPrice) {
    // If totalPrice exists, calculate original price from all rooms
    allRooms.forEach((room: any) => {
      const roomPrice = room?.roomRate?.netAmount || 0;
      const roomOffers = room?.offers || [];
      const roomDiscount = roomOffers
        .filter((offer: any) => offer.included)
        .reduce(
          (sum: number, offer: any) => sum + Math.abs(offer.amount || 0),
          0
        );
      totalOriginalPrice += roomPrice + roomDiscount;

      // Collect all offer names
      roomOffers
        .filter((offer: any) => offer.included)
        .forEach((offer: any) => {
          if (offer.name) {
            const cleanedName = offer.name
              .replace(/<br\s*\/?>/gi, " ")
              .replace(/\s+/g, " ")
              .trim();
            if (cleanedName) {
              allOfferNames.add(cleanedName);
            }
          }
        });
    });
  } else {
    // Fallback: use bestRoom calculation
    const offers = bestRoom?.offers || [];
    const hasOffer =
      offers.length > 0 && offers.some((offer: any) => offer.included);
    const totalDiscount = hasOffer
      ? offers
        .filter((offer: any) => offer.included)
        .reduce(
          (sum: number, offer: any) => sum + Math.abs(offer.amount || 0),
          0
        )
      : 0;
    totalOriginalPrice = hasOffer ? price + totalDiscount : price;

    offers
      .filter((offer: any) => offer.included)
      .forEach((offer: any) => {
        if (offer.name) {
          const cleanedName = offer.name
            .replace(/<br\s*\/?>/gi, " ")
            .replace(/\s+/g, " ")
            .trim();
          if (cleanedName) {
            allOfferNames.add(cleanedName);
          }
        }
      });
  }

  const uniqueOfferNames = Array.from(allOfferNames);
  const hasOffer = uniqueOfferNames.length > 0;

  return {
    hasRooms,
    allRooms,
    availableRooms,
    isAvailable,
    bestRoom,
    currency,
    price,
    hasFreeCancellation,
    totalOriginalPrice,
    uniqueOfferNames,
    hasOffer,
  };
};

export const handleHotelShare = (
  hotelKey: string,
  searchKey: string,
  bookingParams?: object | null
) => {
  const params = new URLSearchParams({
    searchKey: searchKey ?? "",
  });

  if (bookingParams) {
    params.set("bookingParams", JSON.stringify(bookingParams));
  }

  const shareUrl = `${window.location.origin}/hotel-detail/${hotelKey}?${params.toString()}`;

  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(shareUrl);
  } else {
    const textArea = document.createElement("textarea");
    textArea.value = shareUrl;
    textArea.style.position = "fixed";
    textArea.style.opacity = "0";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    document.execCommand("copy");
    document.body.removeChild(textArea);
  }

  toast.success("Link copied to clipboard!");
};

/** Guest score (0–10) and review count from common API shapes (search + detail). */
export function getHotelGuestReviewMeta(hotel: any): {
  reviewScore?: number;
  reviewCount?: number;
} {
  const pi = hotel?.propertyInfo ?? {};
  const rawScore =
    pi.reviewScore ??
    pi.guestScore ??
    pi.guestReviewScore ??
    pi.averageReviewScore ??
    pi.overallRating ??
    pi.rating ??
    hotel?.reviewScore ??
    hotel?.guestScore ??
    pi?.reviews?.averageScore ??
    pi?.review?.score;
  const rawCount =
    pi.reviewCount ??
    pi.totalReviews ??
    pi.numberOfReviews ??
    pi.reviewCountTotal ??
    hotel?.reviewCount ??
    pi?.reviews?.count ??
    pi?.review?.count;

  const score =
    rawScore !== undefined && rawScore !== null && rawScore !== ""
      ? Number(rawScore)
      : undefined;
  const count =
    rawCount !== undefined && rawCount !== null && rawCount !== ""
      ? Number(rawCount)
      : undefined;

  return {
    reviewScore: Number.isFinite(score) ? score : undefined,
    reviewCount: Number.isFinite(count) ? count : undefined,
  };
}

export function getHotelGuestReviewQualityLabel(score: number): string {
  if (score >= 9.5) return "Exceptional";
  if (score >= 9.0) return "Excellent";
  if (score >= 8.5) return "Superb";
  if (score >= 8.0) return "Fabulous";
  if (score >= 7.5) return "Very Good";
  if (score >= 7.0) return "Good";
  if (score >= 6.5) return "Pleasant";
  return "Reviewed";
}

/** Room-type one-liners (e.g. "DUPLEX TENT") are not property blurbs */
const MIN_ROOM_DESC_AS_PROPERTY_BLURB = 80;

/**
 * Hotel-specific listing blurb from supplier/API only.
 * No generic placeholder — wrong copy must not appear under another hotel name.
 */
export function getHotelListingDescription(
  hotel: any,
  bestRoom?: { roomTypeDesc?: string } | null,
): string {
  const pi = hotel?.propertyInfo ?? {};
  const propertyCandidates = [
    pi.description,
    pi.overview,
    pi.longDescription,
    pi.hotelDescription,
    pi.summary,
    pi.shortDescription,
    pi.propertyDescription,
    hotel?.description,
  ];
  for (const p of propertyCandidates) {
    const s = typeof p === "string" ? p.trim() : "";
    if (s) return s;
  }
  const roomDesc =
    typeof bestRoom?.roomTypeDesc === "string"
      ? bestRoom.roomTypeDesc.trim()
      : "";
  if (roomDesc.length >= MIN_ROOM_DESC_AS_PROPERTY_BLURB) return roomDesc;
  return "";
}

/** Figma hotel list card — use when API omits guest review fields */
export const HOTEL_LISTING_REVIEW_FALLBACK = {
  score: 9.1,
  reviewCount: 283,
  dealLabel: "Smashing deal",
} as const;

export function resolveHotelListingReviewDisplay(
  reviewScore: number | undefined,
  reviewCount: number | undefined,
): { score: number | null; count: number | null; label: string | null } {
  const hasApiScore =
    reviewScore != null && Number.isFinite(Number(reviewScore));
  const hasApiCount =
    reviewCount != null && Number.isFinite(Number(reviewCount));
  if (!hasApiScore) {
    return { score: null, count: null, label: null };
  }
  const score = hasApiScore
    ? Number(reviewScore)
    : HOTEL_LISTING_REVIEW_FALLBACK.score;
  /** Use Figma dummy (283) only when API sends no score; else omit count if unknown */
  const count = hasApiCount
    ? Number(reviewCount)
    : hasApiScore
      ? null
      : HOTEL_LISTING_REVIEW_FALLBACK.reviewCount;

  return {
    score,
    count,
    label: getHotelGuestReviewQualityLabel(score),
  };
}

