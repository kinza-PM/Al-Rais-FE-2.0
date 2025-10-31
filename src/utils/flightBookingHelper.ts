import type { FlightInitialBooking } from "../services/api/flightBooking";
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
      { value: phoneValue, msg: "Phone (country code and number) is required." },
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

    if (pRules.isExpiryDateMandatory) {
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
    }

    const ruleChecks: Array<[boolean, any, string]> = [
      [pRules.isIdTypeMandatory, id.idType, "ID type is required."],
      [
        pRules.isDocumentNumberMandatory,
        id.idDocumentNumber,
        "Document number is required.",
      ],
      [
        pRules.isIssuingCountryCodeMandatory,
        id.issuingCountryCode,
        "Issuing country is required.",
      ],
      [
        pRules.isDateOfIssueMandatory,
        id.dateOfIssue,
        "Date of issue is required.",
      ],
      [
        pRules.isResidenceCountryCodeMandatory,
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
