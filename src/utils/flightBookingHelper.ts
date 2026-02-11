import type { FlightInitialBooking } from "../services/api/flightBooking";
import type { AllSelections, AncillaryEntry } from "../store/useAncillaryStore";
import { generateUUID } from "./helpers";

export type FlightFinalReservedBooking = {
  bookingStatus: string;
  priceChanged: boolean;
  bookingReferenceId: string;
  supplierLocator: string;
  journey: any[];
  financialInfo: any;
  passengers: any[];
  fare: any;
  ticketDocument: any[];
};

export type SegmentSummary = {
  segmentKey: string;
  departureDateTime?: string;
  arrivalDateTime?: string;
  departureTerminal?: string;
  arrivalTerminal?: string;
  duration?: string;
  marketingAirline?: string;
  operatingAirline?: string;
  cabinClass?: string;
  priceClassName?: string;
  flightNumber?: string;
};

export const buildInitialFlightBookingPassengersPayload = (
  req?: Array<{ id?: string | number; ptc?: string }>
) => {
  const emptyPassenger = () => ({
    passengerKey: generateUUID(),
    ptc: "",
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
        idType: "PT",
        issuingCountryCode: "",
        residenceCountryCode: "",
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
              areaCode: "+1",
              phoneNumber: "",
            },
          ],
        },
      ],
    },
  });

  if (!req || !req.length) return [emptyPassenger()];

  return req.map((p) => {
    const passenger = emptyPassenger();
    passenger.ptc = p.ptc || "";
    return passenger;
  });
};

// Field-level validation for passengers
export const validatePassengersForFlightProvisionalBookingFields = (
  fareBookingRules: any,
  flightBookingPayload: FlightInitialBooking
): Record<number, Record<string, string>> => {
  const errors: Record<number, Record<string, string>> = {};
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const pRules = fareBookingRules?.passengerRules?.[0] ?? {};
  const passengers = flightBookingPayload?.passengers ?? [];
  const isEmpty = (v: any) =>
    v === undefined || v === null || String(v).trim() === "";

  for (let i = 0; i < passengers.length; i++) {
    const p = passengers[i];
    const pi = p?.passengerInfo ?? {};
    const id = p?.identityDocuments?.[0] ?? {};
    const addId = p?.additionalId ?? {};
    const contactProvided = p?.contact?.contactsProvided?.[0] ?? {};
    const phone = contactProvided?.phone?.[0] ?? {};
    const email = contactProvided?.emailAddress?.[0];
    const phoneValue =
      phone && phone.areaCode && phone.phoneNumber
        ? `${phone.areaCode}${phone.phoneNumber}`
        : undefined;

    const passengerErrors: Record<string, string> = {};

    // Always required fields
    if (isEmpty(pi.nameTitle)) {
      passengerErrors["passengerInfo.nameTitle"] = "Title is required.";
    }
    if (isEmpty(pi.givenName)) {
      passengerErrors["passengerInfo.givenName"] = "Full name is required.";
    }
    if (isEmpty(pi.surname)) {
      passengerErrors["passengerInfo.surname"] = "Surname is required.";
    }
    if (isEmpty(pi.gender)) {
      passengerErrors["passengerInfo.gender"] = "Gender is required.";
    }
    if (isEmpty(email)) {
      passengerErrors["contact.contactsProvided.0.emailAddress.0"] = "Email address is required.";
    }
    if (isEmpty(phoneValue)) {
      passengerErrors["contact.contactsProvided.0.phone.0"] = "Phone (country code and number) is required.";
    }

    // Date of birth
    if (pRules.isDateOfBirthMandatory) {
      const bd = pi.birthDate ?? null;
      if (!bd) {
        passengerErrors["passengerInfo.birthDate"] = "Birth date is required.";
      } else {
        const bdDate = new Date(`${bd}T00:00:00`);
        bdDate.setHours(0, 0, 0, 0);
        if (bdDate > today) {
          passengerErrors["passengerInfo.birthDate"] = "Birth date cannot be in the future.";
        }
      }
    }

    // Expiry date
    const exp = id.expiryDate ?? null;
    if (!exp) {
      passengerErrors["identityDocuments.0.expiryDate"] = "Expiry date is required.";
    } else {
      const expDate = new Date(`${exp}T00:00:00`);
      expDate.setHours(0, 0, 0, 0);
      if (expDate < today) {
        passengerErrors["identityDocuments.0.expiryDate"] = "Expiry date must be booking date or a future date.";
      }
    }

    // Rule-based checks
    if (pRules.isIdTypeMandatory && isEmpty(id.idType)) {
      passengerErrors["identityDocuments.0.idType"] = "ID type is required.";
    }
    if (isEmpty(id.idDocumentNumber)) {
      passengerErrors["identityDocuments.0.idDocumentNumber"] = "Document number is required.";
    }
    if (isEmpty(id.issuingCountryCode)) {
      passengerErrors["identityDocuments.0.issuingCountryCode"] = "Issuing country is required.";
    }
    if (pRules.isDateOfIssueMandatory && isEmpty(id.dateOfIssue)) {
      passengerErrors["identityDocuments.0.dateOfIssue"] = "Date of issue is required.";
    }
    if (isEmpty(id.residenceCountryCode)) {
      passengerErrors["identityDocuments.0.residenceCountryCode"] = "Residence country is required.";
    }
    if (pRules.isPANMandatory && isEmpty(pi.PAN)) {
      passengerErrors["passengerInfo.PAN"] = "PAN is required.";
    }
    if (pRules.isAdditionalIdTypeMandatory && isEmpty(addId.type)) {
      passengerErrors["additionalId.type"] = "Additional ID type is required.";
    }
    if (pRules.isAdditionalDocumentNumberMandatory && isEmpty(addId.number)) {
      passengerErrors["additionalId.number"] = "Additional document number is required.";
    }
    if (pRules.isSeatMandatory && isEmpty(p.seat)) {
      passengerErrors["seat"] = "Seat is required.";
    }
    if (pRules.isMealMandatory && isEmpty(p.meal)) {
      passengerErrors["meal"] = "Meal is required.";
    }
    if (pRules.isBaggageMandatory && isEmpty(p.baggage)) {
      passengerErrors["baggage"] = "Baggage is required.";
    }
    if (pRules.isOtherAncillaryMandatory && isEmpty(p.otherAncillary)) {
      passengerErrors["otherAncillary"] = "Other ancillaries are required.";
    }

    if (Object.keys(passengerErrors).length > 0) {
      errors[i] = passengerErrors;
    }
  }

  return errors;
};

export const validatePassengersForFlightProvisionalBooking = (
  fareBookingRules: any,
  flightBookingPayload: FlightInitialBooking
) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const pRules = fareBookingRules?.passengerRules?.[0] ?? {};
  const passengers = flightBookingPayload?.passengers ?? [];
  const isEmpty = (v: any) =>
    v === undefined || v === null || String(v).trim() === "";

  const multiple = passengers.length > 1;
  const prefixFor = (index: number, msg: string) =>
    multiple ? `Passenger ${String(index + 1).padStart(2, "0")}: ${msg}` : msg;

  for (let i = 0; i < passengers.length; i++) {
    const p = passengers[i];
    const pi = p?.passengerInfo ?? {};
    const id = p?.identityDocuments?.[0] ?? {};
    const addId = p?.additionalId ?? {};
    const contactProvided = p?.contact?.contactsProvided?.[0] ?? {};
    const phone = contactProvided?.phone?.[0] ?? {};
    const email = contactProvided?.emailAddress?.[0];
    const phoneValue =
      phone && phone.areaCode && phone.phoneNumber
        ? `${phone.areaCode}${phone.phoneNumber}`
        : undefined;

    const alwaysRequired = [
      { value: pi.nameTitle, msg: "Title is required." },
      { value: pi.givenName, msg: "Full name is required." },
      { value: pi.surname, msg: "Surname is required." },
      { value: pi.gender, msg: "Gender is required." },
      { value: email, msg: "Email address is required." },
      {
        value: phoneValue,
        msg: "Phone (country code and number) is required.",
      },
    ];
    for (const r of alwaysRequired) {
      if (isEmpty(r.value)) return { valid: false, error: prefixFor(i, r.msg) };
    }

    if (pRules.isDateOfBirthMandatory) {
      const bd = pi.birthDate ?? null;
      if (!bd)
        return { valid: false, error: prefixFor(i, "Birth date is required.") };
      const bdDate = new Date(`${bd}T00:00:00`);
      bdDate.setHours(0, 0, 0, 0);
      if (bdDate > today)
        return {
          valid: false,
          error: prefixFor(i, "Birth date cannot be in the future."),
        };
    }

    // if (pRules.isExpiryDateMandatory) {
    const exp = id.expiryDate ?? null;
    if (!exp)
      return {
        valid: false,
        error: prefixFor(i, "Expiry date is required."),
      };
    const expDate = new Date(`${exp}T00:00:00`);
    expDate.setHours(0, 0, 0, 0);
    if (expDate < today)
      return {
        valid: false,
        error: prefixFor(
          i,
          "Expiry date must be booking date or a future date."
        ),
      };
    // }

    const ruleChecks: Array<[boolean, any, string]> = [
      [pRules.isIdTypeMandatory, id.idType, "ID type is required."],
      [
        // pRules.isDocumentNumberMandatory,
        true,
        id.idDocumentNumber,
        "Document number is required.",
      ],
      [
        // pRules.isIssuingCountryCodeMandatory,
        true,
        id.issuingCountryCode,
        "Issuing country is required.",
      ],
      [
        pRules.isDateOfIssueMandatory,
        id.dateOfIssue,
        "Date of issue is required.",
      ],
      [
        // pRules.isResidenceCountryCodeMandatory,
        true,
        id.residenceCountryCode,
        "Residence country is required.",
      ],
      // [
      //   fareBookingRules?.isLeadEmailAddressMandatory,
      //   email,
      //   "Email is required.",
      // ],
      // [
      //   // fareBookingRules?.isLeadPhoneNumberMandatory,
      //   phone && (phone.areaCode || phone.phoneNumber)
      //     ? `${phone.areaCode || ""}${phone.phoneNumber || ""}`
      //     : undefined,
      //   "Phone (country code and number) is required.",
      // ],
      [pRules.isPANMandatory, pi.PAN, "PAN is required."],
      [
        pRules.isAdditionalIdTypeMandatory,
        addId.type,
        "Additional ID type is required.",
      ],
      [
        pRules.isAdditionalDocumentNumberMandatory,
        addId.number,
        "Additional document number is required.",
      ],
      [pRules.isSeatMandatory, p.seat, "Seat is required."],
      [pRules.isMealMandatory, p.meal, "Meal is required."],
      [pRules.isBaggageMandatory, p.baggage, "Baggage is required."],
      [
        pRules.isOtherAncillaryMandatory,
        p.otherAncillary,
        "Other ancillaries are required.",
      ],
    ];

    for (const [flag, value, msg] of ruleChecks) {
      if (flag && isEmpty(value))
        return { valid: false, error: prefixFor(i, msg) };
    }
  }

  return { valid: true };
};

// Field-level validation for payment
export const validateReservationFlightBookingDataFields = (
  reservation: any,
  card: { number: string; expiry: string; cvv: string; holderName: string }
): Record<string, string> => {
  const errors: Record<string, string> = {};
  const isEmpty = (v: any) =>
    v === undefined || v === null || String(v).trim() === "";

  // Card number
  if (isEmpty(card.number)) {
    errors["card.number"] = "Card number is required.";
  } else {
    const numericCard = card.number.replace(/\s+/g, "");
    if (!/^\d{12,19}$/.test(numericCard)) {
      errors["card.number"] = "Card number looks invalid.";
    }
  }

  // Expiry
  if (isEmpty(card.expiry)) {
    errors["card.expiry"] = "Expiry date is required.";
  } else {
    if (!/^\d{4}$/.test(card.expiry)) {
      errors["card.expiry"] = "Expiry date is invalid. Please use MM/YY.";
    } else {
      const yy = Number(card.expiry.slice(0, 2));
      const mm = Number(card.expiry.slice(2, 4));
      if (!(mm >= 1 && mm <= 12)) {
        errors["card.expiry"] = "Expiry month is invalid.";
      } else {
        const fullYear = 2000 + yy;
        const expiryDate = new Date(fullYear, mm, 0);
        expiryDate.setHours(23, 59, 59, 999);
        if (expiryDate < new Date()) {
          errors["card.expiry"] = "Card expiry is in the past.";
        }
      }
    }
  }

  // CVV
  if (isEmpty(card.cvv)) {
    errors["card.cvv"] = "Security code (CVV) is required.";
  } else if (!/^\d{3,4}$/.test(card.cvv)) {
    errors["card.cvv"] = "Security code should be 3 or 4 digits.";
  }

  // Holder name
  if (isEmpty(card.holderName)) {
    errors["card.holderName"] = "Cardholder name is required.";
  }

  // Billing address
  const address = reservation?.paymentDetails?.address ?? null;
  if (!address) {
    errors["address"] = "Billing address is required.";
  } else {
    const street0 = Array.isArray(address.street)
      ? address.street[0]
      : address.street;
    if (isEmpty(street0)) {
      errors["address.street.0"] = "Billing address is required.";
    }
    if (isEmpty(address.postalCode)) {
      errors["address.postalCode"] = "Postal code is required.";
    }
    if (isEmpty(address.cityName)) {
      errors["address.cityName"] = "City is required.";
    }
    if (isEmpty(address.countryCode)) {
      errors["address.countryCode"] = "Country is required.";
    }
  }

  // Email
  if (isEmpty(reservation?.customerInfo?.emailAddress)) {
    errors["customerInfo.emailAddress"] = "Email is required.";
  }

  return errors;
};

export const validateReservationFlightBookingData = (
  reservation: any,
  card: { number: string; expiry: string; cvv: string; holderName: string }
) => {
  const isEmpty = (v: any) =>
    v === undefined || v === null || String(v).trim() === "";

  if (isEmpty(card.number))
    return { valid: false, error: "Card number is required." };
  const numericCard = card.number.replace(/\s+/g, "");
  if (!/^\d{12,19}$/.test(numericCard))
    return { valid: false, error: "Card number looks invalid." };
  // if (!luhnCheck(numericCard)) return { valid: false, error: "Card number failed validation." };

  if (isEmpty(card.expiry))
    return { valid: false, error: "Expiry date is required." };
  if (!/^\d{4}$/.test(card.expiry))
    return { valid: false, error: "Expiry date is invalid. Please use MM/YY." };

  const yy = Number(card.expiry.slice(0, 2));
  const mm = Number(card.expiry.slice(2, 4));
  if (!(mm >= 1 && mm <= 12))
    return { valid: false, error: "Expiry month is invalid." };

  const fullYear = 2000 + yy;
  const expiryDate = new Date(fullYear, mm, 0);
  expiryDate.setHours(23, 59, 59, 999);
  if (expiryDate < new Date())
    return { valid: false, error: "Card expiry is in the past." };

  if (isEmpty(card.cvv))
    return { valid: false, error: "Security code (CVV) is required." };
  if (!/^\d{3,4}$/.test(card.cvv))
    return { valid: false, error: "Security code should be 3 or 4 digits." };

  if (isEmpty(card.holderName))
    return { valid: false, error: "Cardholder name is required." };

  const address = reservation?.paymentDetails?.address ?? null;
  if (!address) return { valid: false, error: "Billing address is required." };

  const street0 = Array.isArray(address.street)
    ? address.street[0]
    : address.street;
  if (isEmpty(street0))
    return { valid: false, error: "Billing address is required." };

  if (isEmpty(address.postalCode))
    return { valid: false, error: "Postal code is required." };
  if (isEmpty(address.cityName))
    return { valid: false, error: "City is required." };
  if (isEmpty(address.countryCode))
    return { valid: false, error: "Country is required." };
  if (isEmpty(reservation?.customerInfo?.emailAddress))
    return { valid: false, error: "Email is required." };

  return { valid: true };
};

export const luhnCheck = (num: string) => {
  const s = num.replace(/\s+/g, "");
  if (!/^\d+$/.test(s)) return false;
  let sum = 0;
  let shouldDouble = false;
  for (let i = s.length - 1; i >= 0; i--) {
    let d = Number(s[i]);
    if (shouldDouble) {
      d = d * 2;
      if (d > 9) d -= 9;
    }
    sum += d;
    shouldDouble = !shouldDouble;
  }
  return sum % 10 === 0;
};

export function openBlankPopupAndCheckWebisteAllowPopup(
  windowName = "payfort3dsWindow",
  width = 600,
  height = 800
) {
  const left = Math.max(0, Math.floor((window.innerWidth - width) / 2));
  const top = Math.max(0, Math.floor((window.innerHeight - height) / 2));
  const features = `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`;

  const popup = window.open("", windowName, features);
  if (!popup) {
    throw new Error("Popup blocked. Please allow popups for this site.");
  }

  try {
    popup.document.title = "Secure Payment";
    popup.document.body.innerHTML = `
      <div style="font-family: Arial, sans-serif; display:flex;align-items:center;justify-content:center;height:100vh;">
        <div style="text-align:center">
          <div style="font-size:16px;margin-bottom:8px;">Opening secure payment...</div>
          <div style="font-size:12px;color:#666;">If nothing happens, allow popups or try again.</div>
        </div>
      </div>
    `;
  } catch (e) {}

  return popup;
}

export function waitFor3DSecurePaymentPopupReturnResponse(
  timeoutMs = 120000
): Promise<any> {
  return new Promise((resolve, reject) => {
    let timeoutId: number | null = null;

    const handler = (e: MessageEvent) => {
      try {
        const msg = e.data;
        if (!msg || msg.source !== "payfort-3ds") return;
        cleanup();
        resolve(msg.payload);
      } catch (err) {
        cleanup();
        reject(err);
      }
    };

    const cleanup = () => {
      try {
        window.removeEventListener("message", handler);
      } catch (_) {}
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
    };

    window.addEventListener("message", handler, false);

    timeoutId = window.setTimeout(() => {
      cleanup();
      reject(new Error("3DS flow timed out"));
    }, timeoutMs);
  });
}

export function transformFlightJourneysToObjects(
  journeys?: any[]
): Array<{ flightSegments: SegmentSummary[] }> {
  if (!Array.isArray(journeys)) return [];

  return journeys.map((journey) => {
    const segments = Array.isArray(journey?.flightSegments)
      ? journey.flightSegments
      : [];
    return {
      flightSegments: segments.map((s: any) => ({
        segmentKey: s.segmentKey,
        departureDateTime: s.departureDateTime,
        arrivalDateTime: s.arrivalDateTime,
        departureTerminal: s.departureTerminal,
        arrivalTerminal: s.arrivalTerminal,
        duration: s.duration,
        marketingAirline: s.marketingAirline,
        operatingAirline: s.operatingAirline,
        cabinClass: s.cabinClass,
        priceClassName: s.priceClassName,
        flightNumber: s.flightNumber,
      })),
    };
  });
}

export const buildAncillaryPayload = (all: AllSelections, offerId = "") => {
  const selectedAncillaries: AncillaryEntry[] = [];

  if (!all) {
    return { data: { offerId, selectedAncillaries } };
  }

  // 1) Baggage: segmentKey -> passengerKey -> ancillaryOfferId | null
  const baggage = all.baggage ?? {};
  Object.entries(baggage).forEach(([segmentKey, passengers]) => {
    Object.entries(passengers ?? {}).forEach(
      ([passengerKey, ancillaryOfferId]) => {
        if (ancillaryOfferId) {
          selectedAncillaries.push({
            ancillaryOfferId,
            passengerKey,
            segmentKey,
          });
        }
      }
    );
  });

  // 2) Meals: segmentKey -> passengerKey -> mealTypeKey -> { ancillaryOfferId -> quantity }
  const meals = all.meals ?? {};
  Object.entries(meals).forEach(([segmentKey, passengers]) => {
    Object.entries(passengers ?? {}).forEach(([passengerKey, mealTypes]) => {
      Object.values(mealTypes ?? {}).forEach((ancillaryMap) => {
        // ancillaryMap: Record<string, number>
        Object.entries(ancillaryMap ?? {}).forEach(
          ([ancillaryOfferId, quantity]) => {
            const qty = Number(quantity) || 0;
            for (let i = 0; i < qty; i++) {
              selectedAncillaries.push({
                ancillaryOfferId,
                passengerKey,
                segmentKey,
              });
            }
          }
        );
      });
    });
  });

  // 3) Seats: segmentKey -> passengerKey -> { seatNumber, ancillaryOfferId? }
  const seats = all.seats ?? {};
  Object.entries(seats).forEach(([segmentKey, passengers]) => {
    Object.entries(passengers ?? {}).forEach(([passengerKey, seatInfo]) => {
      const ancillaryOfferId = seatInfo?.ancillaryOfferId;
      if (ancillaryOfferId) {
        selectedAncillaries.push({
          ancillaryOfferId,
          passengerKey,
          segmentKey,
        });
      }
    });
  });

  // 4) Other ancillaries: segmentKey -> passengerKey -> ancillaryOfferId -> boolean
  const other = all.otherAncillaries ?? {};
  Object.entries(other).forEach(([segmentKey, passengers]) => {
    Object.entries(passengers ?? {}).forEach(([passengerKey, services]) => {
      Object.entries(services ?? {}).forEach(([ancillaryOfferId, selected]) => {
        if (selected) {
          selectedAncillaries.push({
            ancillaryOfferId,
            passengerKey,
            segmentKey,
          });
        }
      });
    });
  });

  return { data: { offerId, selectedAncillaries } };
};
