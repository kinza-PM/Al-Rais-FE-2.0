import type { RoomData } from "../services/api/hotelSearch";

export type BookingPaxData = {
  adults?: number;
  children?: number;
  kids?: number;
  rooms?: number;
};

export type HotelBookingParams = {
  country?: string;
  city?: string;
  checkIn?: string;
  checkOut?: string;
  travelerCountryOfResidence?: string;
  travelerNationality?: string;
  paxData?: BookingPaxData;
  childAges?: Array<number | null>;
  minStarRating?: number;
  [key: string]: any;
};

const toCount = (value: unknown, fallback: number): number => {
  const nextValue =
    typeof value === "string" && value.trim() !== "" ? Number(value) : value;

  return typeof nextValue === "number" && Number.isFinite(nextValue)
    ? nextValue
    : fallback;
};

const normalizePaxData = (
  paxData?: BookingPaxData,
  fallback?: Partial<BookingPaxData>,
): Required<BookingPaxData> => ({
  adults: toCount(paxData?.adults ?? fallback?.adults, 1),
  children: toCount(paxData?.children ?? paxData?.kids ?? fallback?.children ?? fallback?.kids, 0),
  kids: toCount(paxData?.kids ?? paxData?.children ?? fallback?.kids ?? fallback?.children, 0),
  rooms: Math.max(1, toCount(paxData?.rooms ?? fallback?.rooms, 1)),
});

export const normalizeHotelBookingParams = (
  bookingParams?: HotelBookingParams | null,
): HotelBookingParams | undefined => {
  if (!bookingParams || typeof bookingParams !== "object") {
    return undefined;
  }

  return {
    ...bookingParams,
    country: bookingParams.country ?? "",
    city: bookingParams.city ?? "",
    checkIn: bookingParams.checkIn ?? "",
    checkOut: bookingParams.checkOut ?? "",
    travelerCountryOfResidence: bookingParams.travelerCountryOfResidence ?? "",
    travelerNationality: bookingParams.travelerNationality ?? "",
    paxData: normalizePaxData(bookingParams.paxData, {
      adults: bookingParams.adults,
      children: bookingParams.children,
      kids: bookingParams.kids,
      rooms: bookingParams.rooms,
    }),
    childAges: Array.isArray(bookingParams.childAges)
      ? bookingParams.childAges
      : [],
    minStarRating: bookingParams.minStarRating ?? 0,
  };
};

export const safeParseHotelBookingParams = (
  rawValue?: string | null,
): HotelBookingParams | undefined => {
  if (!rawValue) return undefined;

  const candidates = [rawValue];

  try {
    const decoded = decodeURIComponent(rawValue);
    if (decoded !== rawValue) {
      candidates.push(decoded);
    }
  } catch {
    // Ignore malformed URI payloads and keep trying raw JSON.
  }

  for (const candidate of candidates) {
    try {
      const parsed = JSON.parse(candidate);
      return normalizeHotelBookingParams(parsed);
    } catch {
      // Try the next candidate.
    }
  }

  return undefined;
};

export const serializeHotelBookingParams = (
  bookingParams?: HotelBookingParams | null,
): string => JSON.stringify(normalizeHotelBookingParams(bookingParams) ?? {});

export const convertDateToString = (date: Date | null): string => {
  if (!date) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const convertPaxToRooms = (
  pax: BookingPaxData = {},
  ages: Array<number | null> = [],
): RoomData[] => {
  const normalizedPax = normalizePaxData(pax);
  const numRooms = normalizedPax.rooms || 1;
  const totalAdults = normalizedPax.adults || 0;
  const totalChildren = normalizedPax.kids || normalizedPax.children || 0;

  const childAgeArray: number[] = ages
    .filter((age): age is number => age !== null)
    .slice(0, totalChildren);

  const rooms: RoomData[] = [];
  const baseAdultsPerRoom = Math.floor(totalAdults / numRooms);
  const extraAdults = totalAdults % numRooms;
  const baseChildrenPerRoom = Math.floor(totalChildren / numRooms);
  const extraChildren = totalChildren % numRooms;

  let childAgeIndex = 0;

  for (let i = 0; i < numRooms; i++) {
    const adultsInRoom = Math.min(
      baseAdultsPerRoom + (i < extraAdults ? 1 : 0),
      2,
    );
    const childrenInRoom = Math.min(
      baseChildrenPerRoom + (i < extraChildren ? 1 : 0),
      2,
    );

    const childAgesForRoom: number[] = [];
    for (let j = 0; j < childrenInRoom; j++) {
      if (childAgeIndex < childAgeArray.length) {
        childAgesForRoom.push(childAgeArray[childAgeIndex]);
        childAgeIndex++;
      }
    }

    rooms.push({
      adult: adultsInRoom,
      child: childrenInRoom,
      childAge: childAgesForRoom,
      roomIndex: i + 1,
    });
  }

  return rooms;
};

type ValidationInput = {
  country?: string;
  city?: string;
  checkIn?: string;
  checkOut?: string;
  travelerCountryOfResidence?: string;
  paxData?: BookingPaxData;
  childAges?: Array<number | null>;
  requireSearchContext?: boolean;
};

export const getHotelBookingValidationError = ({
  country = "",
  city = "",
  checkIn = "",
  checkOut = "",
  travelerCountryOfResidence = "",
  paxData,
  childAges = [],
  requireSearchContext = true,
}: ValidationInput): string | null => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (requireSearchContext) {
    const hasMultipleErrors =
      [
        !country || country.trim() === "",
        !city || city.trim() === "",
        !checkIn || checkIn.trim() === "",
        !checkOut || checkOut.trim() === "",
        !travelerCountryOfResidence || travelerCountryOfResidence.trim() === "",
      ].filter(Boolean).length > 1;

    if (hasMultipleErrors) {
      return "Please complete all required fields before searching.";
    }

    if (!country || country.trim() === "") {
      return "Country is required";
    }

    if (!city || city.trim() === "") {
      return "City is required";
    }
  }

  if (!checkIn || checkIn.trim() === "") {
    return "Check-in date is required";
  }

  if (!checkOut || checkOut.trim() === "") {
    return "Check-out date is required";
  }

  const checkInDate = new Date(checkIn);
  checkInDate.setHours(0, 0, 0, 0);
  if (checkInDate < today) {
    return "Check-in date cannot be in the past";
  }

  const checkOutDate = new Date(checkOut);
  checkOutDate.setHours(0, 0, 0, 0);
  if (checkOutDate < today) {
    return "Check-out date cannot be in the past";
  }

  if (checkOutDate <= checkInDate) {
    return "Check-out date must be after check-in date";
  }

  if (requireSearchContext) {
    if (
      !travelerCountryOfResidence ||
      travelerCountryOfResidence.trim() === ""
    ) {
      return "Nationality is required";
    }
  }

  const normalizedPax = normalizePaxData(paxData);
  const numRooms = normalizedPax.rooms || 1;
  const totalAdults = normalizedPax.adults || 0;
  const totalChildren = normalizedPax.kids || normalizedPax.children || 0;

  const maxAdultsAllowed = numRooms * 2;
  if (totalAdults < numRooms) {
    return `Minimum ${numRooms} adult${numRooms > 1 ? "s" : ""} required for ${numRooms} room${numRooms > 1 ? "s" : ""} (1 per room)`;
  }

  if (totalAdults > maxAdultsAllowed) {
    return `Maximum ${maxAdultsAllowed} adults allowed for ${numRooms} room${numRooms > 1 ? "s" : ""} (2 per room)`;
  }

  const maxChildrenAllowed = numRooms * 2;
  if (totalChildren > maxChildrenAllowed) {
    return `Maximum ${maxChildrenAllowed} children allowed for ${numRooms} room${numRooms > 1 ? "s" : ""} (2 per room)`;
  }

  if (totalChildren > 0) {
    const validChildAges = childAges.filter((age): age is number => age !== null);
    if (validChildAges.length !== totalChildren) {
      return "Please specify ages for all children";
    }
  }

  return null;
};
