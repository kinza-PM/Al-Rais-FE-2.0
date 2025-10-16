import type { FlightInitialBooking } from "../services/api/flightBooking";
import { generateUUID } from "./helpers";

export const buildInitialFlightBookingPassengersPayload = (req?: Array<{ id?: string | number; ptc?: string }>) => {
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
                            areaCode: "",
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

export const validatePassengersForFlightProvisionalBooking = (fareBookingRules: any, flightBookingPayload: FlightInitialBooking) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const pRules = fareBookingRules?.passengerRules?.[0] ?? {};
    const passengers = flightBookingPayload?.passengers ?? [];

    for (let i = 0; i < passengers.length; i++) {
        const p = passengers[i];
        if (pRules.isDateOfBirthMandatory) {
            const bd = p?.passengerInfo?.birthDate ?? null;
            if (!bd) {
                return { valid: false, error: "Birth date is required." };
            }
            const bdDate = new Date(`${bd}T00:00:00`);
            bdDate.setHours(0, 0, 0, 0);
            if (bdDate > today) {
                return { valid: false, error: "Birth date cannot be in the future." };
            }
        }
        if (pRules.isExpiryDateMandatory) {
            const exp = p?.identityDocuments?.[0]?.expiryDate ?? null;
            if (!exp) {
                return { valid: false, error: "Expiry date is required." };
            }
            const expDate = new Date(`${exp}T00:00:00`);
            expDate.setHours(0, 0, 0, 0);
            // expiry must be booking date (today) or a future date
            if (expDate < today) {
                return { valid: false, error: "Expiry date must be booking date or a future date." };
            }
        }
    }

    return { valid: true };
};
