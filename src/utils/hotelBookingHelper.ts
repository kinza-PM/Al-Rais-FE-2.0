// import { generateUUID } from "./helpers";
import {
  validateIdentityDocumentNumberForType,
  validateInternationalPhoneParts,
  validatePassportDateOfIssue,
  validatePersonName,
} from "./travelerFieldValidation";

/** Normalize loose time strings to `HH:mm` for pickers / API (24h). */
export function normalizeHotelArrivalTimeHHMM(time?: string | null): string {
  if (!time || typeof time !== "string") return "12:00";
  const m = /^(\d{1,2}):(\d{2})/.exec(time.trim());
  if (!m) return "14:00";
  const h = Math.min(23, Math.max(0, parseInt(m[1], 10)));
  const min = Math.min(59, Math.max(0, parseInt(m[2], 10)));
  return `${String(h).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
}

export type HotelBookingPayload = {
  searchKey: string;
  bookingKey: string;
  hotelKey: string;
  totalNet: number;
  currency: string;
  culture: string;
  stayDateRange: { checkIn: string; checkOut: string };
  /** Guest-indicated arrival date (YYYY-MM-DD), within stay; sent to `/hotelBooking`. */
  userSelectedArrivalDate?: string;
  /** Guest-indicated arrival time (HH:mm 24h); sent to `/hotelBooking`. */
  userSelectedArrivalTime?: string;
  rooms: Array<{
    roomIndex: number;
    roomKey: string;
    passengers: Array<{
      passengerKey: string;
      isLead: boolean;
      ptc: string;
      passengerInfo: {
        birthDate: string | null;
        gender: string;
        nameTitle: string;
        givenName: string;
        surname: string;
      };
      identityDocuments: Array<{
        idDocumentNumber: string;
        idType: string;
        issuingCountryCode: string;
        dateOfIssue: string | null;
        expiryDate: string | null;
      }>;
      contact: {
        contactsProvided: Array<{
          emailAddress: string[];
          phone: Array<{
            label: string;
            areaCode: string | number;
            phoneNumber: string | number;
          }>;
        }>;
      };
    }>;
  }>;
  paymentDetails: {
    paymentMode: string;
    transactionAmount?: number | null;
    cardInfo?: string;
    address?: {
      label?: string;
      street?: string[] | string;
      postalCode?: string;
      cityName?: string;
      countryCode?: string;
      state?: string;
    };
  };
  customerInfo?: {
    emailAddress?: string;
  };
};

const emptyPassenger = (
  isLead: boolean,
  ptc: string,
  passengerNumber: number,
) => ({
  passengerKey: String(passengerNumber),
  // passengerKey: generateUUID(),
  isLead,
  ptc,
  passengerInfo: {
    birthDate: null,
    gender: "",
    nameTitle: "",
    givenName: "",
    surname: "",
  },
  identityDocuments: [
    {
      idDocumentNumber: "",
      idType: "PASSPORT",
      issuingCountryCode: "",
      dateOfIssue: null,
      expiryDate: null,
    },
  ],
  contact: {
    contactsProvided: [
      {
        emailAddress: [""],
        phone: [
          {
            label: "Origin",
            areaCode: "",
            phoneNumber: "",
          },
        ],
      },
    ],
  },
});

export function buildInitialHotelBookingPayload(
  preBookData: any,
  searchKey: string,
  hotelKey: string,
  totalNet: number,
  currency: string,
  checkIn: string,
  checkOut: string,
  selectedRooms: Array<{ roomKey: string; room?: any; count?: number }>,
  paxData?: {
    adults?: number;
    children?: number;
    kids?: number;
    rooms?: number;
  },
  /** Defaults `userSelectedArrivalTime` when hotel publishes standard check-in time. */
  hotelStandardCheckInTime?: string | null,
): HotelBookingPayload {
  const adults = paxData?.adults ?? 1;
  const children = (paxData?.children ?? 0) + (paxData?.kids ?? 0);
  const roomsCount = selectedRooms.length || 1;

  // Same distribution as search form convertPaxToRoom: base + extra (first rooms get extra)
  const MAX_ADULTS_PER_ROOM = 2;
  const MAX_CHILDREN_PER_ROOM = 2;

  const baseAdultsPerRoom = Math.floor(adults / roomsCount);
  const extraAdults = adults % roomsCount;
  const baseChildrenPerRoom = Math.floor(children / roomsCount);
  const extraChildren = children % roomsCount;

  const perRoomAdults: number[] = [];
  const perRoomChildren: number[] = [];
  for (let i = 0; i < roomsCount; i++) {
    perRoomAdults.push(
      Math.min(
        baseAdultsPerRoom + (i < extraAdults ? 1 : 0),
        MAX_ADULTS_PER_ROOM,
      ),
    );
    perRoomChildren.push(
      Math.min(
        baseChildrenPerRoom + (i < extraChildren ? 1 : 0),
        MAX_CHILDREN_PER_ROOM,
      ),
    );
  }

  const preBookRooms = preBookData?.data?.[0]?.hotel?.rooms ?? [];
  const rooms = selectedRooms.map((sel, idx) => {
    const preBookRoom = preBookRooms[idx];
    const roomIndex = preBookRoom?.roomIndex ?? sel.room?.roomIndex ?? idx + 1;
    const roomKey = preBookRoom?.roomKey ?? sel.roomKey ?? "";
    const numAdults = perRoomAdults[idx] || 1;
    const numChildren = perRoomChildren[idx] || 0;
    const passengers: any[] = [];
    let paxCounter = 1;
    for (let i = 0; i < numAdults; i++) {
      passengers.push(emptyPassenger(i === 0, "ADT", paxCounter++));
    }
    for (let i = 0; i < numChildren; i++) {
      passengers.push(emptyPassenger(false, "CHD", paxCounter++));
    }
    if (passengers.length === 0) {
      passengers.push(emptyPassenger(true, "ADT", paxCounter++));
    }
    return { roomIndex, roomKey, passengers };
  });

  const bookingKey =
    preBookData?.data?.[0]?.hotel?.bookingKey ??
    preBookData?.data?.[0]?.bookingKey ??
    preBookData?.bookingKey ??
    "";

  return {
    searchKey,
    bookingKey,
    hotelKey,
    totalNet,
    currency,
    culture: "en",
    stayDateRange: { checkIn, checkOut },
    userSelectedArrivalDate: checkIn,
    userSelectedArrivalTime: normalizeHotelArrivalTimeHHMM(
      hotelStandardCheckInTime ?? undefined,
    ),
    rooms,
    paymentDetails: { paymentMode: "CR" },
  };
}

export type HotelPaymentCardDetails = {
  number: string;
  expiryDisplay: string;
  expiry: string; // YYMM
  cvv: string;
  holderName: string;
};

export type HotelPassengerFieldErrors = Record<
  number,
  Record<number, Record<string, string>>
>;

export function validateHotelBookingPassengersFields(
  payload: HotelBookingPayload,
  options?: {
    /**
     * Expected child ages per room (distributed same as search),
     * e.g. [[5], [7, 9]] => room 0 has one child age 5, room 1 has two children 7 & 9.
     */
    childAgesPerRoom?: number[][];
    /**
     * Reference date to calculate age (typically check-in date).
     * Falls back to today's date when not provided.
     */
    checkInDate?: string;
  },
): HotelPassengerFieldErrors {
  const errors: HotelPassengerFieldErrors = {};
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const referenceDate = (() => {
    if (options?.checkInDate) {
      const d = new Date(options.checkInDate);
      if (!Number.isNaN(d.getTime())) {
        d.setHours(0, 0, 0, 0);
        return d;
      }
    }
    return today;
  })();

  const isEmpty = (v: any) =>
    v === undefined || v === null || String(v).trim() === "";

  const expectedChildAgesPerRoom = options?.childAgesPerRoom ?? [];
  const childIndexByRoom: Record<number, number> = {};

  payload.rooms.forEach((room, roomIdx) => {
    room.passengers.forEach((p, pIdx) => {
      const pi = p?.passengerInfo ?? {};
      const id = p?.identityDocuments?.[0] ?? {};
      const contactProvided = p?.contact?.contactsProvided?.[0] ?? {};
      const phone = contactProvided?.phone?.[0] ?? {};
      const email = contactProvided?.emailAddress?.[0];
      const phoneValue =
        phone && phone.areaCode && phone.phoneNumber
          ? `${phone.areaCode}${phone.phoneNumber}`
          : undefined;

      const passengerErrors: Record<string, string> = {};

      if (isEmpty(pi.nameTitle)) {
        passengerErrors["passengerInfo.nameTitle"] = "Title is required.";
      }
      if (isEmpty(pi.givenName)) {
        passengerErrors["passengerInfo.givenName"] = "Full name is required.";
      } else {
        const givenFmt = validatePersonName(pi.givenName, {
          fieldLabel: "Full name",
        });
        if (givenFmt) {
          passengerErrors["passengerInfo.givenName"] = givenFmt;
        }
      }
      if (isEmpty(pi.surname)) {
        passengerErrors["passengerInfo.surname"] = "Surname is required.";
      } else {
        const surnameFmt = validatePersonName(pi.surname, {
          fieldLabel: "Surname",
        });
        if (surnameFmt) {
          passengerErrors["passengerInfo.surname"] = surnameFmt;
        }
      }
      if (isEmpty(pi.gender)) {
        passengerErrors["passengerInfo.gender"] = "Gender is required.";
      }
      if (isEmpty(pi.birthDate)) {
        passengerErrors["passengerInfo.birthDate"] = "Birth date is required.";
      } else if (pi.birthDate) {
        const bdDate = new Date(`${pi.birthDate}T00:00:00`);
        bdDate.setHours(0, 0, 0, 0);
        if (bdDate > today) {
          passengerErrors["passengerInfo.birthDate"] =
            "Birth date cannot be in the future.";
        } else {
          const ageYears =
            (referenceDate.getTime() - bdDate.getTime()) /
            (365.25 * 24 * 60 * 60 * 1000);
          const ptc = (p?.ptc ?? "ADT").toUpperCase();
          if (ptc === "CHD") {
            if (ageYears < 2 || ageYears > 12) {
              passengerErrors["passengerInfo.birthDate"] =
                "Child must be between 2 and 12 years old.";
            }
          } else if (ptc === "ADT") {
            if (ageYears <= 12) {
              passengerErrors["passengerInfo.birthDate"] =
                "Adult must be older than 12 years.";
            }
          }
          console.log(
            "expectedChildAgesPerRoom.length",
            expectedChildAgesPerRoom.length,
            expectedChildAgesPerRoom,
          );
          // Extra validation for children: age must match the age used at search time (per room)
          if (ptc === "CHD" && expectedChildAgesPerRoom.length > 0) {
            const currentChildIndex =
              childIndexByRoom[roomIdx] !== undefined
                ? childIndexByRoom[roomIdx]
                : 0;
            console.log("currentChildIndex", currentChildIndex);
            const expectedAge =
              expectedChildAgesPerRoom[roomIdx]?.[currentChildIndex];
            console.log("expectedAge", expectedChildAgesPerRoom[roomIdx]);
            if (typeof expectedAge === "number") {
              const roundedAge = Math.floor(ageYears);
              if (roundedAge !== expectedAge) {
                passengerErrors["passengerInfo.birthDate"] =
                  `Child age must match selected age (${expectedAge} years).`;
              }
            }
          }

          if ((p?.ptc ?? "").toUpperCase() === "CHD") {
            childIndexByRoom[roomIdx] = (childIndexByRoom[roomIdx] ?? 0) + 1;
          }
        }
      }
      // if (isEmpty(email)) {
      //   passengerErrors["contact.contactsProvided.0.emailAddress.0"] =
      //     "Email address is required.";
      // }
      const emailVal = email ?? "";
      if (isEmpty(emailVal)) {
        passengerErrors["contact.contactsProvided.0.emailAddress.0"] =
          "Email address is required.";
      } else if (emailVal !== emailVal.trim()) {
        passengerErrors["contact.contactsProvided.0.emailAddress.0"] =
          "Remove spaces at the beginning or end of your email.";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal.trim())) {
        passengerErrors["contact.contactsProvided.0.emailAddress.0"] =
          "Enter a valid email address.";
      }
      if (isEmpty(phoneValue)) {
        passengerErrors["contact.contactsProvided.0.phone.0"] =
          "Phone (country code and number) is required.";
      } else {
        const phoneFmt = validateInternationalPhoneParts(
          phone.areaCode != null ? String(phone.areaCode) : phone.areaCode,
          phone.phoneNumber != null
            ? String(phone.phoneNumber)
            : phone.phoneNumber,
        );
        if (phoneFmt) {
          passengerErrors["contact.contactsProvided.0.phone.0"] = phoneFmt;
        }
      }
      if (isEmpty(id.idDocumentNumber)) {
        passengerErrors["identityDocuments.0.idDocumentNumber"] =
          "Document number is required.";
      } else {
        const normalizedIdType = String(id.idType ?? "PASSPORT")
          .trim()
          .toUpperCase();
        const mappedIdType =
          normalizedIdType === "PASSPORT"
            ? "PT"
            : normalizedIdType === "NATIONAL_ID"
              ? "NI"
              : normalizedIdType === "DRIVING_LICENSE"
                ? "DL"
                : normalizedIdType;
        const docFmt = validateIdentityDocumentNumberForType(
          id.idDocumentNumber,
          mappedIdType,
        );
        if (docFmt) {
          passengerErrors["identityDocuments.0.idDocumentNumber"] = docFmt;
        }
      }
      if (isEmpty(id.issuingCountryCode)) {
        passengerErrors["identityDocuments.0.issuingCountryCode"] =
          "Issuing country is required.";
      }
      if (isEmpty(id.dateOfIssue)) {
        passengerErrors["identityDocuments.0.dateOfIssue"] =
          "Date of issue is required.";
      } else {
        const issueFmt = validatePassportDateOfIssue(
          id.dateOfIssue,
          pi.birthDate ?? null,
          id.expiryDate ?? null,
          today,
        );
        if (issueFmt) {
          passengerErrors["identityDocuments.0.dateOfIssue"] = issueFmt;
        }
      }
      if (isEmpty(id.expiryDate)) {
        passengerErrors["identityDocuments.0.expiryDate"] =
          "Expiry date is required.";
      } else if (id.expiryDate) {
        const expDate = new Date(`${id.expiryDate}T00:00:00`);
        expDate.setHours(0, 0, 0, 0);
        if (expDate < today) {
          passengerErrors["identityDocuments.0.expiryDate"] =
            "Expiry date must be today or a future date.";
        }
      }

      if (Object.keys(passengerErrors).length > 0) {
        if (!errors[roomIdx]) errors[roomIdx] = {};
        errors[roomIdx][pIdx] = passengerErrors;
      }
    });
  });

  return errors;
}
// export function validateHotelBookingPassengersFields(
//   payload: HotelBookingPayload,
//   _options?: {
//     childAgesPerRoom?: number[][];
//     checkInDate?: string;
//   },
// ): HotelPassengerFieldErrors {
//   const errors: HotelPassengerFieldErrors = {};

//   const isEmpty = (v: any) =>
//     v === undefined || v === null || String(v).trim() === "";

//   // Only passengerKey, isLead, and ptc are required here (rest set by flow / optional for now).

//   payload.rooms.forEach((room, roomIdx) => {
//     room.passengers.forEach((p, pIdx) => {
//       const passengerErrors: Record<string, string> = {};

//       if (isEmpty(p.passengerKey)) {
//         passengerErrors["passengerKey"] = "Passenger key is required.";
//       }
//       if (typeof p.isLead !== "boolean") {
//         passengerErrors["isLead"] = "Lead status is required.";
//       }
//       if (isEmpty(p.ptc)) {
//         passengerErrors["ptc"] = "Passenger type is required.";
//       }

//       if (Object.keys(passengerErrors).length > 0) {
//         if (!errors[roomIdx]) errors[roomIdx] = {};
//         errors[roomIdx][pIdx] = passengerErrors;
//       }
//     });
//   });

//   return errors;
// }

export const validateHotelReservationBookingDataFields = (
  reservation:
    | Pick<HotelBookingPayload, "customerInfo" | "paymentDetails">
    | any,
  card: HotelPaymentCardDetails,
): Record<string, string> => {
  const MAX_CARD_EXPIRY_YEARS_AHEAD = 35;
  const errors: Record<string, string> = {};
  const isEmpty = (v: any) =>
    v === undefined || v === null || String(v).trim() === "";
  const getCardBrandFromNumber = (
    cardNumber: string | null | undefined,
  ): "amex" | "other" | "unknown" => {
    const digits = String(cardNumber ?? "").replace(/\D/g, "");
    if (!digits) return "unknown";
    if (/^3[47]/.test(digits)) return "amex";
    return "other";
  };
  const getAllowedCvvLengthsForCard = (
    cardNumber: string | null | undefined,
  ): number[] => {
    const brand = getCardBrandFromNumber(cardNumber);
    if (brand === "amex") return [4];
    if (brand === "unknown") return [3, 4];
    return [3];
  };
  const validateCardExpiryYYMM = (expiry: string): string | null => {
    const raw = String(expiry ?? "").trim();
    if (!/^\d{4}$/.test(raw)) {
      return "Expiry date is invalid. Please use MM/YY.";
    }
    const yy = Number(raw.slice(0, 2));
    const mm = Number(raw.slice(2, 4));
    if (!(mm >= 1 && mm <= 12)) {
      return "Expiry month is invalid.";
    }
    const fullYear = 2000 + yy;
    const expiryDate = new Date(fullYear, mm, 0);
    expiryDate.setHours(23, 59, 59, 999);
    const now = new Date();
    if (expiryDate < now) {
      return "Card expiry is in the past.";
    }
    const latestAllowed = new Date(
      now.getFullYear() + MAX_CARD_EXPIRY_YEARS_AHEAD,
      now.getMonth(),
      1,
    );
    latestAllowed.setHours(23, 59, 59, 999);
    if (expiryDate > latestAllowed) {
      return "Expiry date looks too far in the future.";
    }
    return null;
  };

  // Card number
  if (isEmpty(card.number)) {
    errors["card.number"] = "Card number is required.";
  } else {
    const numericCard = card.number.replace(/\s+/g, "");
    if (!/^\d{12,19}$/.test(numericCard)) {
      errors["card.number"] = "Card number looks invalid.";
    }
  }

  if (isEmpty(card.expiry)) {
    errors["card.expiry"] = "Expiry date is required.";
  } else {
    const expiryError = validateCardExpiryYYMM(card.expiry);
    if (expiryError) {
      errors["card.expiry"] = expiryError;
    }
  }

  if (isEmpty(card.cvv)) {
    errors["card.cvv"] = "Security code (CVV) is required.";
  } else if (!/^\d+$/.test(card.cvv)) {
    errors["card.cvv"] = "Security code should contain numbers only.";
  } else {
    const numericCard = card.number.replace(/\s+/g, "");
    const allowedLengths = getAllowedCvvLengthsForCard(numericCard);
    if (!allowedLengths.includes(card.cvv.length)) {
      errors["card.cvv"] =
        allowedLengths.length === 1
          ? `Security code should be ${allowedLengths[0]} digits for this card.`
          : "Security code should be 3 or 4 digits.";
    }
  }

  if (isEmpty(card.holderName)) {
    errors["card.holderName"] = "Cardholder name is required.";
  } else {
    const holderFmt = validatePersonName(card.holderName, {
      fieldLabel: "Cardholder name",
    });
    if (holderFmt) {
      errors["card.holderName"] = holderFmt;
    }
  }

  // if (isEmpty(reservation?.customerInfo?.emailAddress)) {
  //   errors["customerInfo.emailAddress"] = "Email is required.";
  // }

  const emailVal = reservation?.customerInfo?.emailAddress ?? "";
  if (isEmpty(emailVal)) {
    errors["customerInfo.emailAddress"] = "Email is required.";
  } else if (emailVal !== emailVal.trim()) {
    errors["customerInfo.emailAddress"] =
      "Remove spaces at the beginning or end of your email.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal.trim())) {
    errors["customerInfo.emailAddress"] = "Enter a valid email address.";
  }

  return errors;
};

/** Tax line from supplier room rate (amounts are per room selection unit unless noted). */
export type HotelRoomTaxItem = {
  name?: string;
  amount?: number;
  included?: boolean;
};

/**
 * Sums tax lines across all selected room rows, multiplying each line by that row's `count`
 * (number of rooms of that type). Same tax name (case-insensitive) is merged into one line.
 */
export function aggregateHotelTaxesFromSelectedRooms(
  selectedRooms:
    | Array<{
      count?: number;
      room?: { roomRate?: { taxes?: HotelRoomTaxItem[] } };
    }>
    | undefined
    | null,
): HotelRoomTaxItem[] {
  const byName = new Map<
    string,
    { displayName: string; amount: number; included: boolean }
  >();

  for (const sel of selectedRooms ?? []) {
    const count =
      typeof sel?.count === "number" && sel.count > 0 ? sel.count : 1;
    const taxes = sel?.room?.roomRate?.taxes;
    if (!Array.isArray(taxes)) continue;

    for (const t of taxes) {
      const displayName = (t?.name || "Tax").trim() || "Tax";
      const key = displayName.toLowerCase();
      const add = (typeof t?.amount === "number" ? t.amount : 0) * count;
      const prev = byName.get(key);
      if (prev) {
        prev.amount += add;
        if (t?.included) prev.included = true;
      } else {
        byName.set(key, {
          displayName,
          amount: add,
          included: !!t?.included,
        });
      }
    }
  }

  return Array.from(byName.values()).map(
    ({ displayName, amount, included }) => ({
      name: displayName,
      amount,
      included,
    }),
  );
}

/**
 * Aggregate taxes from a flat list of room rows (e.g. search `hotel.rooms`, favourites `roomDetails`).
 * Each row is treated as one priced unit (same as `selectedRooms` with `count: 1` each).
 */
export function aggregateHotelTaxesFromRoomArray(
  rooms:
    | Array<{ roomRate?: { taxes?: HotelRoomTaxItem[] } }>
    | undefined
    | null,
): HotelRoomTaxItem[] {
  return aggregateHotelTaxesFromSelectedRooms(
    (rooms ?? []).map((room) => ({ count: 1, room })),
  );
}
