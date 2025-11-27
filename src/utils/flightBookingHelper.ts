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

export const validateReservationFlightBookingData = (
  reservation: any,
  card: { number: string; expiry: string; cvv: string; holderName: string }
) => {
  const isEmpty = (v: any) =>
    v === undefined || v === null || String(v).trim() === "";

  if (isEmpty(card.number)) return { valid: false, error: "Card number is required." };
  const numericCard = card.number.replace(/\s+/g, "");
  if (!/^\d{12,19}$/.test(numericCard))
    return { valid: false, error: "Card number looks invalid." };
  // if (!luhnCheck(numericCard)) return { valid: false, error: "Card number failed validation." };

  if (isEmpty(card.expiry)) return { valid: false, error: "Expiry date is required." };
  if (!/^\d{4}$/.test(card.expiry))
    return { valid: false, error: "Expiry date is invalid. Please use MM/YY." };

  const yy = Number(card.expiry.slice(0, 2));
  const mm = Number(card.expiry.slice(2, 4));
  if (!(mm >= 1 && mm <= 12)) return { valid: false, error: "Expiry month is invalid." };

  const fullYear = 2000 + yy;
  const expiryDate = new Date(fullYear, mm, 0);
  expiryDate.setHours(23, 59, 59, 999);
  if (expiryDate < new Date())
    return { valid: false, error: "Card expiry is in the past." };

  if (isEmpty(card.cvv)) return { valid: false, error: "Security code (CVV) is required." };
  if (!/^\d{3,4}$/.test(card.cvv)) return { valid: false, error: "Security code should be 3 or 4 digits." };

  if (isEmpty(card.holderName)) return { valid: false, error: "Cardholder name is required." };

  const address = reservation?.paymentDetails?.address ?? null;
  if (!address)
    return { valid: false, error: "Billing address is required." };

  const street0 = Array.isArray(address.street) ? address.street[0] : address.street;
  if (isEmpty(street0)) return { valid: false, error: "Billing address line 1 is required." };

  if (isEmpty(address.postalCode)) return { valid: false, error: "Postal code is required." };
  if (isEmpty(address.cityName)) return { valid: false, error: "City is required." };
  if (isEmpty(address.countryCode)) return { valid: false, error: "Country is required." };
  if (isEmpty(reservation?.customerInfo?.emailAddress)) return { valid: false, error: "Email is required." };


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

export function openBlankPopupAndCheckWebisteAllowPopup(windowName = "payfort3dsWindow", width = 600, height = 800) {
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
  } catch (e) {
  }

  return popup;
}

export function waitFor3DSecurePaymentPopupReturnResponse(timeoutMs = 120000): Promise<any> {
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
      try { window.removeEventListener("message", handler); } catch (_) { }
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

