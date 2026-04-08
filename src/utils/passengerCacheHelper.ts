export type PassengerCacheAddPayload = {
  type: "add";
  passengers: Array<any>;
};

type AnyPassengerLike = {
  passengerKey?: string;
  ptc?: string;
  isLead?: boolean;
  passengerInfo?: {
    birthDate?: string | null;
    gender?: string;
    nameTitle?: string;
    givenName?: string;
    surname?: string;
    PAN?: string;
  };
  identityDocuments?: Array<{
    idDocumentNumber?: string;
    idType?: string;
    issuingCountryCode?: string;
    residenceCountryCode?: string;
    dateOfIssue?: string | null;
    expiryDate?: string | null;
  }>;
  contact?: {
    contactsProvided?: Array<{
      emailAddress?: string[];
      phone?: Array<{
        label?: string;
        areaCode?: string | number;
        phoneNumber?: string | number;
      }>;
    }>;
  };
  additionalIdentityDetails?: {
    type?: string;
    number?: string;
  };
  seat?: string;
  meal?: string;
  baggage?: string;
  otherAncillary?: string;
};

const normalizeTitle = (t: any) => String(t || "").trim().toUpperCase();
const normalizeGender = (g: any, title?: any) => {
  const gg = String(g || "").trim().toLowerCase();
  if (gg === "m" || gg === "male") return "M";
  if (gg === "f" || gg === "female") return "F";
  const tt = String(title || "").trim().toLowerCase();
  if (tt === "mr") return "M";
  if (tt === "ms" || tt === "mrs") return "F";
  return "";
};
const digitsOnly = (v: any) => String(v ?? "").replace(/[^\d]/g, "");

const toCachePassenger = (passenger: AnyPassengerLike) => {
  const pi = passenger?.passengerInfo ?? ({} as any);
  const doc0 = passenger?.identityDocuments?.[0] ?? ({} as any);
  const c0 = passenger?.contact?.contactsProvided?.[0] ?? ({} as any);
  const phone0 = c0?.phone?.[0] ?? ({} as any);

  const nameTitle = normalizeTitle(pi?.nameTitle);
  const gender = normalizeGender(pi?.gender, pi?.nameTitle);
  const areaDigits = digitsOnly(phone0?.areaCode);
  const phoneDigits = digitsOnly(phone0?.phoneNumber);

  return {
    passengerKey: passenger?.passengerKey,
    ptc: String(passenger?.ptc ?? "").toUpperCase(),
    isLead: Boolean(passenger?.isLead),
    passengerInfo: {
      birthDate: pi?.birthDate ?? null,
      gender,
      nameTitle,
      givenName: pi?.givenName ?? "",
      surname: pi?.surname ?? "",
      PAN: pi?.PAN ?? "",
    },
    identityDocuments: [
      {
        idDocumentNumber: doc0?.idDocumentNumber ?? "",
        idType:
          doc0?.idType && String(doc0.idType).toUpperCase() === "PASSPORT"
            ? "PT"
            : doc0?.idType ?? "PT",
        issuingCountryCode: doc0?.issuingCountryCode ?? "",
        residenceCountryCode:
          doc0?.residenceCountryCode ?? doc0?.issuingCountryCode ?? "",
        dateOfIssue: doc0?.dateOfIssue ?? null,
        expiryDate: doc0?.expiryDate ?? null,
      },
    ],
    contact: {
      contactsProvided: [
        {
          emailAddress: [c0?.emailAddress?.[0] ?? ""],
          phone: [
            {
              label: phone0?.label ?? "Origin",
              areaCode: areaDigits ? Number(areaDigits) : phone0?.areaCode,
              phoneNumber: phoneDigits
                ? Number(phoneDigits)
                : phone0?.phoneNumber,
            },
          ],
        },
      ],
    },
    ...(passenger?.additionalIdentityDetails
      ? { additionalIdentityDetails: passenger.additionalIdentityDetails }
      : {}),
    ...(passenger?.seat ? { seat: passenger.seat } : {}),
    ...(passenger?.meal ? { meal: passenger.meal } : {}),
    ...(passenger?.baggage ? { baggage: passenger.baggage } : {}),
    ...(passenger?.otherAncillary ? { otherAncillary: passenger.otherAncillary } : {}),
  };
};

const passengerFingerprint = (passenger: any) => {
  const pi = passenger?.passengerInfo ?? {};
  const doc0 = passenger?.identityDocuments?.[0] ?? {};
  return [
    String(passenger?.passengerKey ?? "").trim(),
    String(passenger?.ptc ?? "").trim().toUpperCase(),
    String(doc0?.idDocumentNumber ?? "").trim().toUpperCase(),
    String(doc0?.expiryDate ?? "").trim(),
    String(pi?.birthDate ?? "").trim(),
    String(pi?.givenName ?? "").trim().toUpperCase(),
    String(pi?.surname ?? "").trim().toUpperCase(),
  ].join("|");
};

export function extractPassengersFromCacheResponse(resp: any): AnyPassengerLike[] {
  if (!resp) return [];
  if (Array.isArray(resp)) return resp;
  const candidates = [resp?.data?.passengers, resp?.passengers, resp?.data, resp?.data?.data];
  for (const c of candidates) {
    if (Array.isArray(c)) return c;
  }
  return [];
}

export function buildPassengerCacheAddPayload(
  passengersInput: AnyPassengerLike[],
  existingPassengersInput: AnyPassengerLike[] = [],
): PassengerCacheAddPayload | null {
  const mappedExisting = (existingPassengersInput ?? []).map(toCachePassenger);
  const mappedNew = (passengersInput ?? []).map(toCachePassenger);
  const merged = [...mappedExisting];
  const byFingerprint = new Map<string, number>();

  merged.forEach((p, idx) => {
    byFingerprint.set(passengerFingerprint(p), idx);
  });
  for (const p of mappedNew) {
    const fp = passengerFingerprint(p);
    const existingIdx = byFingerprint.get(fp);
    if (existingIdx === undefined) {
      byFingerprint.set(fp, merged.length);
      merged.push(p);
    } else {
      merged[existingIdx] = p;
    }
  }

  if (merged.length === 0) return null;
  return { type: "add", passengers: merged };
}

