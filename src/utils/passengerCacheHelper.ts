export type PassengerCacheAddPayload = {
  type: "add";
  passengers: Array<any>;
};

type AnyPassengerLike = {
  passengerKey?: string;
  ptc?: string;
  passengerInfo?: {
    birthDate?: string | null;
    gender?: string;
    nameTitle?: string;
    givenName?: string;
    surname?: string;
  };
  identityDocuments?: Array<{
    idDocumentNumber?: string;
    idType?: string;
    issuingCountryCode?: string;
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
};

export function buildPassengerCacheAddPayload(
  passengersInput: AnyPassengerLike[],
): PassengerCacheAddPayload | null {
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

  const mapped = (passengersInput ?? []).map((passenger) => {
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
      passengerInfo: {
        birthDate: pi?.birthDate ?? null,
        gender,
        nameTitle,
        givenName: pi?.givenName ?? "",
        surname: pi?.surname ?? "",
      },
      identityDocuments: [
        {
          idDocumentNumber: doc0?.idDocumentNumber ?? "",
          idType:
            doc0?.idType && String(doc0.idType).toUpperCase() === "PASSPORT"
              ? "PT"
              : doc0?.idType ?? "PT",
          issuingCountryCode: doc0?.issuingCountryCode ?? "",
          residenceCountryCode: doc0?.issuingCountryCode ?? "",
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
    };
  });

  if (mapped.length === 0) return null;
  return { type: "add", passengers: mapped };
}

