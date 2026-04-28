import cabinIcon from "../../assets/svgs/cabin.svg";
import baggageIcon from "../../assets/svgs/baggage.svg";
// import entertainmentIcon from "../../assets/svgs/entertainment.svg";
// import mealIcon from "../../assets/svgs/meals.svg";
// import portIcon from "../../assets/svgs/ports.svg";
// import wifiIcon from "../../assets/svgs/wifi.svg";
// import arrownDownwardIcon from "../../assets/svgs/arrow-downwards.svg";
import EmirateLogo from "../../assets/images/emirates.png";
import React, { useEffect, useMemo, useRef, useState } from "react";
import FLightPriceBreakdown from "../atoms/FlightPriceBreakdown";
import Button from "../atoms/Button";
import CustomToggle from "../common/CustomToggle";
import FlightSummaryCard from "../atoms/FlightSummaryCard";
import TailiwindCustomDatePicker from "../common/TailiwindCustomDatePicker";
import TailwindCustomInput from "../common/TailwindCustomInput";
import SearchableDropdown from "../common/SearchableDropdown";
import FLightFareRule from "../atoms/FlightFareRule";
import {
  buildFlightSegmentFromTrip,
  formatDateToLocalISO,
  formatMoney,
  getPriceCabinClassForFlightSummary,
  parseLocalDateString,
} from "../../utils/helpers";
import { useFlightInitialBooking } from "../../hooks/useFlightBooking";
import toast from "react-hot-toast";
import {
  // validatePassengersForFlightProvisionalBooking,
  mapFlightProvBookingApiErrorsToPassengerFields,
  validatePassengersForFlightProvisionalBookingFields,
  withDefaultResidenceCountryFromIssuing,
} from "../../utils/flightBookingHelper";
import {
  getBirthDatePickerBoundsForPtc,
  genderFromFlightBookingNameTitle,
  getFlightBookingNameTitleDropdownOptions,
  getPassportIssuePickerBounds,
  mapSavedTravelerTitleToFlightBookingValue,
  sanitizeEmailInput,
  sanitizeIdentityDocumentInput,
} from "../../utils/travelerFieldValidation";
import axios from "axios";
import {
  extractAxiosErrorDetailsSource,
  extractErrorFromAxiosApiError,
} from "../../utils/apiErrorHanlder";
import LoginModal from "../common/LoginModal";
import { useAuth } from "../../features/auth/hooks/useAuth";
import { useNavigate } from "react-router-dom";
// import { getUniqueCountries } from "../../utils/dropdownHelper";
import { PhoneInput } from "react-international-phone";
import "react-international-phone/style.css";
import type { CountryOption } from "../../features/flights/types";
// import seaticon from "../../assets/svgs/seatsicon.svg";
import durationIcon from "../../assets/svgs/duration.svg";
import refundableIcon from "../../assets/svgs/redundable.svg";
import SEAT_ICON from "../../assets/svgs/seat.svg";
import PLANE_ICON from "../../assets/svgs/plane.svg";
import SavedTravelersSection, {
  type SavedTraveler,
} from "./SavedTravelersSection";
import {
  usePassengerCacheAdd,
  usePassengerCacheFetch,
} from "../../hooks/usePassengerCache";
import {
  buildPassengerCacheAddPayload,
  extractPassengersFromCacheResponse,
} from "../../utils/passengerCacheHelper";
import ConfirmationModal from "../common/ConfirmationModal";
import Loader from "../atoms/Loader";
import { Checkbox } from "antd";

type FlightBookingBookSectionProps = {
  trip: any;
  passengers: Array<any>;
  countries: CountryOption[];
  flightBookingPayload: any;
  onPassengerFieldChange: (index: number, path: string, value: any) => void;
  fareBookingSearchRules?: any;
  fareRuleData?: any;
  onNext?: (offerId?: string) => void;
  onUpdateFlightRaw?: (newRaw: {
    detail?: any;
    fare?: any;
    financialInfo?: any;
    journey?: any;
  }) => void;
  onChangeFlight?: () => void;
};

// function ChevronDown() {
//   return (
//     <img
//       alt="arrow-icon"
//       src={arrownDownwardIcon}
//       className="pointer-events-none absolute right-3 top-3/5"
//     />
//   );
// }

export default function FlightBookingBookSection({
  trip,
  passengers = [],
  countries = [],
  flightBookingPayload,
  onPassengerFieldChange,
  fareBookingSearchRules,
  fareRuleData,
  onNext,
  onUpdateFlightRaw,
  onChangeFlight,
}: FlightBookingBookSectionProps) {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [openPrice, setOpenPrice] = useState(false);
  const [validationErrors, setValidationErrors] = useState<
    Record<number, Record<string, string>>
  >({});
  const originalCacheKeyBySlotRef = useRef<Record<number, string>>({});
  const [hasAttemptedValidation, setHasAttemptedValidation] = useState(false);
  const [saveTravelerByPassengerKey, setSaveTravelerByPassengerKey] = useState<
    Record<string, boolean>
  >({});
  const [isBookingForSomeoneElse, setIsBookingForSomeoneElse] = useState(false);
  const [separateContactPerson, setSeparateContactPerson] = useState({
    nameTitle: "",
    givenName: "",
    surname: "",
    gender: "",
    email: "",
    phoneAreaCode: "+1",
    phoneNumber: "",
  });
  const [showBookingConfirm, setShowBookingConfirm] = useState(false);
  const [showFareChangeModal, setShowFareChangeModal] = useState(false);
  const [provisionalFareChange, setProvisionalFareChange] = useState<{
    newRaw: {
      detail?: any;
      fare?: any;
      financialInfo?: any;
      journey?: any;
      offerId?: string | number;
    };
    offerId: string | undefined;
    oldAmount: number;
    newAmount: number;
    oldCurrency: string;
    newCurrency: string;
    successToast: string | undefined;
  } | null>(null);
  const savedTravelerOffKeysRef = useRef<Set<string>>(new Set());

  const [isFareRuleChecked, setIsFareRuleChecked] = useState(false);
  const [showFareRuleError, setShowFareRuleError] = useState(false);
  const [fareRulesModalOpen, setFareRulesModalOpen] = useState(false);

  const pRules = fareBookingSearchRules?.passengerRules?.[0] ?? {};
  const { mutateAsync, isPending } = useFlightInitialBooking();
  const { mutateAsync: addPassengerCache, isPending: isAddingCache } =
    usePassengerCacheAdd();
  const { data: passengerCacheResp } = usePassengerCacheFetch();

  // First ADT's phone for CHD/INF fallback
  const firstAdtPhone = useMemo(() => {
    const firstAdt = passengers.find(
      (p) => (p.ptc || "").toUpperCase() === "ADT",
    );
    if (!firstAdt) return null;
    const areaCode =
      firstAdt.contact?.contactsProvided?.[0]?.phone?.[0]?.areaCode ?? "";
    const phoneNumber =
      firstAdt.contact?.contactsProvided?.[0]?.phone?.[0]?.phoneNumber ?? "";
    return areaCode || phoneNumber ? { areaCode, phoneNumber } : null;
  }, [passengers]);

  // Sync first ADT's phone to CHD/INF — keep syncing as ADT types; only stop when user edits CHD/INF to something different
  useEffect(() => {
    if (!firstAdtPhone) return;
    const firstAdtFull = firstAdtPhone.areaCode + firstAdtPhone.phoneNumber;
    passengers.forEach((p, idx) => {
      const ptc = (p.ptc || "").toUpperCase();
      if (ptc !== "CHD" && ptc !== "INF") return;
      const ownAreaCode =
        p.contact?.contactsProvided?.[0]?.phone?.[0]?.areaCode ?? "";
      const ownPhoneNumber =
        p.contact?.contactsProvided?.[0]?.phone?.[0]?.phoneNumber ?? "";
      const ownFull = ownAreaCode + ownPhoneNumber;
      // Only skip sync when user has explicitly set a different number in CHD/INF
      // (empty, or prefix/match of first ADT = still inheriting, keep syncing)
      if (
        ownFull &&
        !firstAdtFull.startsWith(ownFull) &&
        ownFull !== firstAdtFull
      )
        return;
      onPassengerFieldChange(
        idx,
        "contact.contactsProvided.0.phone.0.areaCode",
        firstAdtPhone.areaCode,
      );
      onPassengerFieldChange(
        idx,
        "contact.contactsProvided.0.phone.0.phoneNumber",
        firstAdtPhone.phoneNumber,
      );
    });
  }, [passengers, firstAdtPhone, onPassengerFieldChange]);

  const assets = {
    EmirateLogo,
    cabinIcon,
    baggageIcon,
    mealIcon: refundableIcon,
    wifiIcon: durationIcon,
    portIcon: SEAT_ICON,
    entertainmentIcon: PLANE_ICON,
  };
  const segments = buildFlightSegmentFromTrip(trip, assets);
  const firstPrice = getPriceCabinClassForFlightSummary(trip);
  const priceFareFamily = {
    label: "Fare family",
    value: firstPrice?.label ?? firstPrice?._priceClasses?.[0] ?? "Fare family",
    changeText: "Modify search",
    onChangeClick: () => {
      if (typeof onChangeFlight === "function") {
        onChangeFlight();
      } else {
        navigate("/search_flight");
      }
    },
  };

  // Helper to clear error for a specific field
  const clearFieldError = (passengerIndex: number, fieldPath: string) => {
    if (
      hasAttemptedValidation &&
      validationErrors[passengerIndex]?.[fieldPath]
    ) {
      setValidationErrors((prev) => {
        const updated = { ...prev };
        if (updated[passengerIndex]) {
          delete updated[passengerIndex][fieldPath];
          if (Object.keys(updated[passengerIndex]).length === 0) {
            delete updated[passengerIndex];
          }
        }
        return updated;
      });
    }
  };

  const handleFlightProvInitialBooking = async () => {
    // if (typeof validatePassengersForFlightProvisionalBooking === "function") {
    //   const { valid, error } = validatePassengersForFlightProvisionalBooking(
    //     fareBookingSearchRules,
    //     flightBookingPayload,
    //   );
    //   if (!valid) {
    //     toast.error(error || "Validation failed.");
    //     return;
    //   }
    // }
    // setHasAttemptedValidation(true);
    // const fieldErrors = validatePassengersForFlightProvisionalBookingFields(
    //   fareBookingSearchRules,
    //   flightBookingPayload,
    // );
    // setValidationErrors(fieldErrors);

    // if (Object.keys(fieldErrors).length > 0) {
    //   // Still check overall validation for backward compatibility
    //   if (typeof validatePassengersForFlightProvisionalBooking === "function") {
    //     const { valid } = validatePassengersForFlightProvisionalBooking(
    //       fareBookingSearchRules,
    //       flightBookingPayload,
    //     );
    //     if (!valid) {
    //       return;
    //     }
    //   }
    //   return;
    // }

    const selectedPassengersForCache = passengers.filter((p, idx) =>
      saveToggleChecked(saveToggleKey(idx, p?.passengerKey)),
    );

    const addPassengerCachePayload =
      selectedPassengersForCache.length > 0
        ? buildPassengerCacheAddPayload(
          selectedPassengersForCache,
          extractPassengersFromCacheResponse(passengerCacheResp),
          passengers.map((_, i) =>
            saveToggleChecked(saveToggleKey(i, passengers[i]?.passengerKey))
              ? (originalCacheKeyBySlotRef.current[i] ?? null)
              : null,
          ),
        )
        : null;
    // console.log('addPassengerCachePayload----', addPassengerCachePayload)
    // console.log('selectedPassengersForCache----', selectedPassengersForCache)
    try {
      if (addPassengerCachePayload) {
        try {
          await addPassengerCache(addPassengerCachePayload);
        } catch (e) {
          // Do not block flight flow if cache save fails.
          console.error("fetchAddPassengerCache(add) failed", e);
        }
      }
      const response = await mutateAsync(
        withDefaultResidenceCountryFromIssuing(flightBookingPayload),
      );
      if (
        response?.meta?.success &&
        response?.meta?.statusMessage == "SUCCESS"
      ) {
        const successMsg = response?.meta?.actionType;
        const updated = response?.data?.[0];
        if (!updated) {
          if (successMsg) toast.success(successMsg);
          return;
        }
        const { detail, fare, financialInfo, journey, offerId } = updated;
        const newRaw: {
          detail?: any;
          fare?: any;
          financialInfo?: any;
          journey?: any;
          offerId?: string | number;
        } = {};
        if (detail !== undefined) newRaw.detail = detail;
        if (fare !== undefined) newRaw.fare = fare;
        if (financialInfo !== undefined) newRaw.financialInfo = financialInfo;
        if (journey !== undefined) newRaw.journey = journey;
        if (offerId !== undefined) newRaw.offerId = offerId;

        const prov = updated as { oldFare?: number; newFare?: number };
        const oldN = Number(prov.oldFare);
        const newN = Number(prov.newFare);
        const currencyCode =
          (fare?.currencyCode as string) ??
          (fare?.currency as string) ??
          (trip?.raw?.fare?.currencyCode as string) ??
          (trip?.raw?.fare?.currency as string) ??
          "USD";
        if (
          !Number.isNaN(oldN) &&
          !Number.isNaN(newN) &&
          Math.abs(oldN - newN) >= 0.01
        ) {
          setProvisionalFareChange({
            newRaw,
            offerId: offerId as string | undefined,
            oldAmount: oldN,
            newAmount: newN,
            oldCurrency: currencyCode,
            newCurrency: currencyCode,
            successToast: successMsg,
          });
          setShowFareChangeModal(true);
          return;
        }

        // if (successMsg) toast.success(successMsg);
        if (Object.keys(newRaw).length > 0 && onUpdateFlightRaw) {
          onUpdateFlightRaw(newRaw);
        }
        if (typeof onNext === "function") {
          onNext(offerId);
        }
      }
    } catch (error) {
      console.log("error", error);
      const source = extractAxiosErrorDetailsSource(error);
      const fieldErrors =
        mapFlightProvBookingApiErrorsToPassengerFields(source);
      const hasMapped = Object.values(fieldErrors).some(
        (obj) => obj && Object.keys(obj).length > 0,
      );
      if (hasMapped) {
        setValidationErrors(fieldErrors);
        setHasAttemptedValidation(true);
        return;
      }
      const err = extractErrorFromAxiosApiError(error);
      toast.error(err);
      const status = axios.isAxiosError(error)
        ? (error.response?.status ?? 0)
        : 0;
      if (status === 404 || status === 410 || status === 409) {
        navigate("/search_flight");
      }
    }
  };

  const fillFromSavedTravelers = (
    selectedSlots: Array<SavedTraveler | undefined>,
  ) => {
    const normalizeIdType = (v?: string) => {
      const x = String(v ?? "")
        .trim()
        .toUpperCase();
      if (x === "PT" || x === "PASSPORT") return "PT";
      if (x === "NI" || x === "NATIONAL_ID") return "NI";
      if (x === "DL" || x === "DRIVING_LICENSE") return "DL";
      return "PT";
    };
    const genderToUi = (g?: string) => {
      const v = String(g ?? "")
        .trim()
        .toUpperCase();
      if (v === "M" || v === "MALE") return "M";
      if (v === "F" || v === "FEMALE") return "F";
      return "";
    };

    const apply = (idx: number, t?: SavedTraveler) => {
      if (!passengers[idx]) return;

      const clear = !t;
      const givenName = clear ? "" : (t.firstName ?? "");
      const surname = clear ? "" : (t.lastName ?? "");
      const nameTitle = clear
        ? ""
        : mapSavedTravelerTitleToFlightBookingValue(
          passengers[idx]?.ptc,
          t.nameTitle,
          t.gender,
        );
      const gender = clear ? "" : genderToUi(t.gender);
      const birthDate = clear ? null : (t.birthDate ?? null);
      const passport = clear ? "" : (t.passport ?? "");
      const idType = clear ? "PT" : normalizeIdType(t.idType);
      const issuingCountryCode = clear ? "" : (t.issuingCountryCode ?? "");
      const residenceCountryCode = clear ? "" : (t.residenceCountryCode ?? "");
      const dateOfIssue = clear ? null : (t.dateOfIssueIso ?? null);
      const expiryIso = clear ? null : (t.expiryIso ?? null);
      const email = clear ? "" : (t.email ?? "");
      const areaCode = clear
        ? ""
        : t.phoneAreaCode !== undefined &&
          t.phoneAreaCode !== null &&
          String(t.phoneAreaCode).trim() !== ""
          ? `+${String(t.phoneAreaCode).replace(/^\+/, "")}`
          : "";
      const phoneNumber = clear ? "" : String(t.phoneNumber ?? "");

      onPassengerFieldChange(idx, "passengerInfo.nameTitle", nameTitle);
      onPassengerFieldChange(idx, "passengerInfo.gender", gender);
      onPassengerFieldChange(idx, "passengerInfo.givenName", givenName);
      onPassengerFieldChange(idx, "passengerInfo.surname", surname);
      onPassengerFieldChange(idx, "passengerInfo.birthDate", birthDate);

      onPassengerFieldChange(
        idx,
        "identityDocuments.0.idDocumentNumber",
        passport,
      );
      onPassengerFieldChange(idx, "identityDocuments.0.idType", idType);
      onPassengerFieldChange(
        idx,
        "identityDocuments.0.issuingCountryCode",
        issuingCountryCode,
      );
      onPassengerFieldChange(
        idx,
        "identityDocuments.0.residenceCountryCode",
        residenceCountryCode,
      );
      onPassengerFieldChange(
        idx,
        "identityDocuments.0.dateOfIssue",
        dateOfIssue,
      );
      onPassengerFieldChange(idx, "identityDocuments.0.expiryDate", expiryIso);

      onPassengerFieldChange(
        idx,
        "contact.contactsProvided.0.emailAddress.0",
        email,
      );
      onPassengerFieldChange(
        idx,
        "contact.contactsProvided.0.phone.0.areaCode",
        areaCode,
      );
      onPassengerFieldChange(
        idx,
        "contact.contactsProvided.0.phone.0.phoneNumber",
        phoneNumber,
      );
      onPassengerFieldChange(idx, "isLead", idx === 0);
    };

    for (let i = 0; i < passengers.length; i++) {
      apply(i, selectedSlots[i]);
    }

    setSaveTravelerByPassengerKey((prev) => {
      const next = { ...prev };
      const currentOffFromSaved = new Set<string>();
      for (let i = 0; i < passengers.length; i++) {
        const p = passengers[i];
        const key = `${i}:${p?.passengerKey ?? ""}`;
        if (selectedSlots[i]) {
          next[key] = false;
          currentOffFromSaved.add(key);
        }
      }
      for (const key of savedTravelerOffKeysRef.current) {
        if (!currentOffFromSaved.has(key)) {
          delete next[key];
        }
      }
      savedTravelerOffKeysRef.current = currentOffFromSaved;
      return next;
    });

    for (let i = 0; i < passengers.length; i++) {
      const t = selectedSlots[i];
      if (t) {
        const given = String(t.firstName ?? "")
          .trim()
          .toUpperCase();
        const surname = String(t.lastName ?? "")
          .trim()
          .toUpperCase();
        const dob = String(t.birthDate ?? "").trim();
        const passport = String(t.passport ?? "")
          .trim()
          .toUpperCase();
        originalCacheKeyBySlotRef.current[i] =
          `${passport}|${given}|${surname}|${dob}`;
      } else {
        delete originalCacheKeyBySlotRef.current[i];
      }
    }
  };

  const saveToggleKey = (index: number, passengerKey?: string) =>
    `${index}:${passengerKey ?? ""}`;
  const saveToggleChecked = (key: string) => {
    const v = saveTravelerByPassengerKey[key];
    return v !== false;
  };
  const toggleSaveTraveler = (key: string) => {
    setSaveTravelerByPassengerKey((prev) => ({
      ...prev,
      [key]: !saveToggleChecked(key),
    }));
  };
  const normalizeIdType = (v?: string) => {
    const x = String(v ?? "")
      .trim()
      .toUpperCase();
    if (x === "PT" || x === "PASSPORT") return "PT";
    if (x === "NI" || x === "NATIONAL_ID") return "NI";
    if (x === "DL" || x === "DRIVING_LICENSE") return "DL";
    return "PT";
  };

  const getContactPersonFromPassenger = (passenger?: any) => ({
    nameTitle: passenger?.passengerInfo?.nameTitle ?? "",
    givenName: passenger?.passengerInfo?.givenName ?? "",
    surname: passenger?.passengerInfo?.surname ?? "",
    gender: passenger?.passengerInfo?.gender ?? "",
    email: passenger?.contact?.contactsProvided?.[0]?.emailAddress?.[0] ?? "",
    phoneAreaCode:
      passenger?.contact?.contactsProvided?.[0]?.phone?.[0]?.areaCode ?? "+1",
    phoneNumber:
      passenger?.contact?.contactsProvided?.[0]?.phone?.[0]?.phoneNumber ?? "",
  });

  const syncContactPersonToPrimaryTraveler = (
    contact = separateContactPerson,
  ) => {
    if (!passengers[0]) return;

    onPassengerFieldChange(0, "passengerInfo.nameTitle", contact.nameTitle);
    onPassengerFieldChange(0, "passengerInfo.givenName", contact.givenName);
    onPassengerFieldChange(0, "passengerInfo.surname", contact.surname);
    onPassengerFieldChange(0, "passengerInfo.gender", contact.gender);
    onPassengerFieldChange(
      0,
      "contact.contactsProvided.0.emailAddress.0",
      contact.email,
    );
    onPassengerFieldChange(
      0,
      "contact.contactsProvided.0.phone.0.areaCode",
      contact.phoneAreaCode,
    );
    onPassengerFieldChange(
      0,
      "contact.contactsProvided.0.phone.0.phoneNumber",
      contact.phoneNumber,
    );
  };

  const handleBookingForSomeoneElseToggle = () => {
    if (!isBookingForSomeoneElse) {
      setSeparateContactPerson(getContactPersonFromPassenger(passengers[0]));
      setIsBookingForSomeoneElse(true);
      return;
    }

    syncContactPersonToPrimaryTraveler();
    setIsBookingForSomeoneElse(false);
  };

  const updateContactPersonField = (
    field: keyof typeof separateContactPerson,
    value: string,
  ) => {
    if (isBookingForSomeoneElse) {
      setSeparateContactPerson((prev) => ({ ...prev, [field]: value }));
      return;
    }

    const fieldPathByContactField: Record<
      keyof typeof separateContactPerson,
      string
    > = {
      nameTitle: "passengerInfo.nameTitle",
      givenName: "passengerInfo.givenName",
      surname: "passengerInfo.surname",
      gender: "passengerInfo.gender",
      email: "contact.contactsProvided.0.emailAddress.0",
      phoneAreaCode: "contact.contactsProvided.0.phone.0.areaCode",
      phoneNumber: "contact.contactsProvided.0.phone.0.phoneNumber",
    };

    onPassengerFieldChange(0, fieldPathByContactField[field], value);
    clearFieldError(0, fieldPathByContactField[field]);
  };

  // const countryOptions = useMemo(() => {
  //   return getUniqueCountries(cities);
  // }, [cities]);

  return (
    <section className="mx-auto max-w-full px-10 flight-booking-section">
      <Loader
        show={isPending || isAddingCache}
        label={
          isPending
            ? "Verifying flight details and fare…"
            : "Saving traveler to your profile…"
        }
      />
      <div className="grid gap-4 md:grid-cols-[2fr_1fr] flight-booking-grid">
        <div className="space-y-4">
          <SavedTravelersSection
            onProceedSelection={fillFromSavedTravelers}
            maxSelectable={passengers.length}
          />
          {passengers.map((p, idx) => {
            const issuePickerBounds = getPassportIssuePickerBounds({
              birthDateIso: p.passengerInfo?.birthDate ?? null,
              expiryDateIso: p.identityDocuments?.[0]?.expiryDate ?? null,
            });
            const birthPickerBounds = getBirthDatePickerBoundsForPtc(p.ptc);
            const contactPersonDetails = isBookingForSomeoneElse
              ? separateContactPerson
              : getContactPersonFromPassenger(passengers[0]);
            const shouldShowTravelerPersonalFields =
              isBookingForSomeoneElse || idx > 0;
            return (
              <React.Fragment key={p.passengerKey || idx}>
                {idx === 0 && (
                  <div className="rounded-[16px] border-[1.5px] border-[#C2CAD6] bg-white shadow-sm">
                    <div className="flex items-center justify-between px-4 py-3 border-b-[1.5px] border-[#C2CAD6] rounded-t-[16px] bg-[#F2F2F3]">
                      <h3 className="text-[15px] font-medium text-[#0A0C0F]">
                        Contact person details
                      </h3>
                      <CustomToggle
                        label="I'm booking for someone else"
                        checked={isBookingForSomeoneElse}
                        onChange={handleBookingForSomeoneElseToggle}
                      />
                    </div>

                    <div className="px-4 py-4 bg-[#F2F2F3] rounded-b-[16px]">
                      <p className="mb-3 text-[12px] leading-5 text-[#3D495C]">
                        {isBookingForSomeoneElse
                          ? "Contact person is separate from the traveler. Traveler details below must be filled independently."
                          : "Contact person is Traveler 01. These details are used for the primary traveler."}
                      </p>
                      <div className="flight-contact-person-grid grid gap-x-4 gap-y-3 md:grid-cols-2">
                        <div
                          className={`relative w-full max-w-[300px] ${hasAttemptedValidation && !isBookingForSomeoneElse && validationErrors[0]?.["passengerInfo.nameTitle"] ? "pb-6" : ""}`}
                        >
                          <SearchableDropdown
                            options={getFlightBookingNameTitleDropdownOptions(
                              p.ptc,
                            )}
                            value={contactPersonDetails.nameTitle}
                            onChange={(value) => {
                              updateContactPersonField("nameTitle", value);
                              updateContactPersonField(
                                "gender",
                                genderFromFlightBookingNameTitle(value),
                              );
                            }}
                            placeholder="Select title"
                            label="Title *"
                            widthClass="w-full"
                            error={
                              hasAttemptedValidation && !isBookingForSomeoneElse
                                ? validationErrors[0]?.[
                                "passengerInfo.nameTitle"
                                ]
                                : null
                            }
                            className="h-[50px] w-full appearance-none rounded-[16px] border-[1.5px] border-[#C2CAD6] bg-[white] px-3 pr-8 text-sm text-[#C2CAD6] focus:outline-none"
                          />
                        </div>
                        <div
                          className={`relative w-full max-w-[561px] ${hasAttemptedValidation && !isBookingForSomeoneElse && validationErrors[0]?.["passengerInfo.givenName"] ? "pb-6" : ""}`}
                        >
                          <TailwindCustomInput
                            type="text"
                            placeholder="Enter your full name"
                            label="Full name (Filled based on ID/Passport/Driver’s license) *"
                            value={contactPersonDetails.givenName}
                            onChange={(event) => {
                              updateContactPersonField(
                                "givenName",
                                event.target.value,
                              );
                            }}
                            error={
                              hasAttemptedValidation && !isBookingForSomeoneElse
                                ? validationErrors[0]?.[
                                "passengerInfo.givenName"
                                ]
                                : null
                            }
                            className="h-[50px] w-full rounded-[16px] border-[1.5px] border-[#C2CAD6] bg-[#F9FAFB] px-3 text-sm placeholder:text-[#C2CAD6] text-[#0A0C0F] focus:outline-none focus:border-[#5383DA] focus:ring-2 focus:ring-[#5383DA]/20"
                          />
                        </div>

                        <div
                          className={`relative w-full max-w-[300px] ${hasAttemptedValidation && !isBookingForSomeoneElse && validationErrors[0]?.["passengerInfo.surname"] ? "pb-6" : ""}`}
                        >
                          <TailwindCustomInput
                            type="text"
                            placeholder="Enter your surname"
                            label="Surname *"
                            maxLength={80}
                            value={contactPersonDetails.surname}
                            onChange={(event) => {
                              updateContactPersonField(
                                "surname",
                                event.target.value,
                              );
                            }}
                            error={
                              hasAttemptedValidation && !isBookingForSomeoneElse
                                ? validationErrors[0]?.["passengerInfo.surname"]
                                : null
                            }
                            className="h-[50px] w-full rounded-[16px] border-[1.5px] border-[#C2CAD6] bg-[#F9FAFB] px-3 text-sm placeholder:text-[#C2CAD6] text-[#0A0C0F] focus:outline-none focus:border-[#5383DA] focus:ring-2 focus:ring-[#5383DA]/20"
                          />
                        </div>

                        <div
                          className={`relative w-full max-w-[561px] ${hasAttemptedValidation && !isBookingForSomeoneElse && validationErrors[0]?.["passengerInfo.gender"] ? "pb-6" : ""}`}
                        >
                          <SearchableDropdown
                            options={[
                              { id: "male", value: "M", label: "Male" },
                              { id: "female", value: "F", label: "Female" },
                            ]}
                            value={contactPersonDetails.gender}
                            onChange={(value) => {
                              updateContactPersonField("gender", value);
                            }}
                            placeholder="Select gender"
                            label="Gender *"
                            widthClass="w-full"
                            error={
                              hasAttemptedValidation && !isBookingForSomeoneElse
                                ? validationErrors[0]?.["passengerInfo.gender"]
                                : null
                            }
                            className="h-[50px] w-full appearance-none rounded-[16px] border-[1.5px] border-[#C2CAD6] bg-[#FFFFFF] px-3 pr-8 text-sm text-[#0A0C0F] focus:outline-none"
                          />
                        </div>

                        <div
                          className={`relative w-full max-w-[300px] ${hasAttemptedValidation && !isBookingForSomeoneElse && validationErrors[0]?.["contact.contactsProvided.0.phone.0"] ? "pb-6" : ""}`}
                        >
                          <label className="mb-1 block text-[12px] text-[#0A0C0F]">
                            Phone *
                          </label>
                          <div
                            className={
                              hasAttemptedValidation &&
                                !isBookingForSomeoneElse &&
                                validationErrors[0]?.[
                                "contact.contactsProvided.0.phone.0"
                                ]
                                ? "phone-input-error"
                                : ""
                            }
                          >
                            <PhoneInput
                              defaultCountry="us"
                              value={`${contactPersonDetails.phoneAreaCode}${contactPersonDetails.phoneNumber}`}
                              onChange={(phone, meta) => {
                                const dialCode = `+${meta.country.dialCode}`;
                                updateContactPersonField(
                                  "phoneAreaCode",
                                  dialCode,
                                );
                                updateContactPersonField(
                                  "phoneNumber",
                                  phone.replace(dialCode, ""),
                                );
                                clearFieldError(
                                  0,
                                  "contact.contactsProvided.0.phone.0",
                                );
                              }}
                              forceDialCode={true}
                              hideDropdown={false}
                              disableCountryGuess={false}
                              className="custom-phone-wrapper"
                              countrySelectorStyleProps={{
                                buttonClassName: "country-selector-btn",
                              }}
                              inputProps={{
                                placeholder: "Phone",
                              }}
                            />
                          </div>
                          {hasAttemptedValidation &&
                            !isBookingForSomeoneElse &&
                            validationErrors[0]?.[
                            "contact.contactsProvided.0.phone.0"
                            ] && (
                              <p className="absolute left-0 text-[12px] mt-1 text-[#E65959] whitespace-nowrap">
                                {
                                  validationErrors[0][
                                  "contact.contactsProvided.0.phone.0"
                                  ]
                                }
                              </p>
                            )}
                        </div>

                        <div
                          className={`relative w-full max-w-[561px] ${hasAttemptedValidation && !isBookingForSomeoneElse && validationErrors[0]?.["contact.contactsProvided.0.emailAddress.0"] ? "pb-6" : ""}`}
                        >
                          <TailwindCustomInput
                            type="email"
                            placeholder="Enter an email"
                            label="Email *"
                            value={contactPersonDetails.email}
                            onChange={(event) => {
                              updateContactPersonField(
                                "email",
                                sanitizeEmailInput(event.target.value),
                              );
                            }}
                            error={
                              hasAttemptedValidation && !isBookingForSomeoneElse
                                ? validationErrors[0]?.[
                                "contact.contactsProvided.0.emailAddress.0"
                                ]
                                : null
                            }
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Passenger details (separate card) */}

                <div className="rounded-[16px] border-[1.5px] border-[#C2CAD6] bg-white shadow-sm">
                  <div className="flex items-center justify-between px-4 py-2 border-b-[1.5px] border-[#C2CAD6] rounded-t-[16px]">
                    <h3 className="text-[15px] font-medium text-[#0A0C0F]">
                      Traveler {String(idx + 1).padStart(2, "0")} details
                    </h3>
                    <CustomToggle
                      label="Save Traveler information in my profile"
                      checked={saveToggleChecked(
                        saveToggleKey(idx, p?.passengerKey),
                      )}
                      onChange={() =>
                        toggleSaveTraveler(saveToggleKey(idx, p?.passengerKey))
                      }
                    />
                  </div>

                  <div className="px-4 py-4 rounded-b-[16px]">
                    <div className="flight-traveler-details-grid grid gap-x-4 gap-y-3 md:grid-cols-2">
                      {shouldShowTravelerPersonalFields && (
                        <>
                          <div
                            className={`relative w-full ${hasAttemptedValidation && validationErrors[idx]?.["passengerInfo.nameTitle"] ? "pb-6" : ""}`}
                          >
                            <SearchableDropdown
                              options={getFlightBookingNameTitleDropdownOptions(
                                p.ptc,
                              )}
                              value={p.passengerInfo?.nameTitle ?? ""}
                              onChange={(value) => {
                                onPassengerFieldChange(
                                  idx,
                                  "passengerInfo.nameTitle",
                                  value,
                                );
                                onPassengerFieldChange(
                                  idx,
                                  "passengerInfo.gender",
                                  genderFromFlightBookingNameTitle(value),
                                );
                                clearFieldError(idx, "passengerInfo.nameTitle");
                                clearFieldError(idx, "passengerInfo.gender");
                              }}
                              placeholder="Select title"
                              label="Traveler title *"
                              widthClass="w-full"
                              error={
                                hasAttemptedValidation
                                  ? validationErrors[idx]?.[
                                  "passengerInfo.nameTitle"
                                  ]
                                  : null
                              }
                              className="h-[50px] w-full appearance-none rounded-[16px] border-[1.5px] border-[#C2CAD6] bg-[#F9FAFB] px-3 pr-8 text-sm text-[#0A0C0F] focus:outline-none"
                            />
                          </div>

                          <div
                            className={`relative w-full ${hasAttemptedValidation && validationErrors[idx]?.["passengerInfo.givenName"] ? "pb-6" : ""}`}
                          >
                            <TailwindCustomInput
                              type="text"
                              placeholder="Enter traveler full name"
                              label="Traveler full name *"
                              value={p.passengerInfo?.givenName ?? ""}
                              onChange={(evOrVal) => {
                                const v =
                                  evOrVal && evOrVal.target
                                    ? evOrVal.target.value
                                    : evOrVal;
                                onPassengerFieldChange(
                                  idx,
                                  "passengerInfo.givenName",
                                  v ?? "",
                                );
                                clearFieldError(idx, "passengerInfo.givenName");
                              }}
                              error={
                                hasAttemptedValidation
                                  ? validationErrors[idx]?.[
                                  "passengerInfo.givenName"
                                  ]
                                  : null
                              }
                            />
                          </div>

                          <div
                            className={`relative w-full ${hasAttemptedValidation && validationErrors[idx]?.["passengerInfo.surname"] ? "pb-6" : ""}`}
                          >
                            <TailwindCustomInput
                              type="text"
                              placeholder="Enter traveler surname"
                              label="Traveler surname *"
                              maxLength={80}
                              value={p.passengerInfo?.surname ?? ""}
                              onChange={(evOrVal) => {
                                const v =
                                  evOrVal && evOrVal.target
                                    ? evOrVal.target.value
                                    : evOrVal;
                                onPassengerFieldChange(
                                  idx,
                                  "passengerInfo.surname",
                                  v ?? "",
                                );
                                clearFieldError(idx, "passengerInfo.surname");
                              }}
                              error={
                                hasAttemptedValidation
                                  ? validationErrors[idx]?.[
                                  "passengerInfo.surname"
                                  ]
                                  : null
                              }
                            />
                          </div>

                          <div
                            className={`relative w-full ${hasAttemptedValidation && validationErrors[idx]?.["passengerInfo.gender"] ? "pb-6" : ""}`}
                          >
                            <SearchableDropdown
                              options={[
                                { id: "male", value: "M", label: "Male" },
                                { id: "female", value: "F", label: "Female" },
                              ]}
                              value={p.passengerInfo?.gender ?? ""}
                              onChange={(value) => {
                                onPassengerFieldChange(
                                  idx,
                                  "passengerInfo.gender",
                                  value,
                                );
                                clearFieldError(idx, "passengerInfo.gender");
                              }}
                              placeholder="Select gender"
                              label="Traveler gender *"
                              widthClass="w-full"
                              error={
                                hasAttemptedValidation
                                  ? validationErrors[idx]?.[
                                  "passengerInfo.gender"
                                  ]
                                  : null
                              }
                              className="h-[50px] w-full appearance-none rounded-[16px] border-[1.5px] border-[#C2CAD6] bg-[#F9FAFB] px-3 pr-8 text-sm text-[#0A0C0F] focus:outline-none"
                            />
                          </div>
                        </>
                      )}

                      <div className="relative w-full">
                        <TailwindCustomInput
                          type="text"
                          placeholder="Select Pax Type"
                          label="Pax type"
                          value={p.ptc || ""}
                          disabled
                        />
                      </div>

                      {pRules.isIdTypeMandatory && (
                        <div
                          className={`relative w-full max-w-[561px] ${hasAttemptedValidation && validationErrors[idx]?.["identityDocuments.0.idType"] ? "pb-6" : ""}`}
                        >
                          <SearchableDropdown
                            options={[
                              {
                                id: "passport",
                                value: "PT",
                                label: "Passport (PT)",
                              },
                            ]}
                            value={normalizeIdType(
                              p.identityDocuments?.[0]?.idType,
                            )}
                            onChange={(value) => {
                              onPassengerFieldChange(
                                idx,
                                "identityDocuments.0.idType",
                                value,
                              );
                              clearFieldError(
                                idx,
                                "identityDocuments.0.idType",
                              );
                            }}
                            placeholder="Select ID type"
                            label="ID type"
                            widthClass="w-full"
                            error={
                              hasAttemptedValidation
                                ? validationErrors[idx]?.[
                                "identityDocuments.0.idType"
                                ]
                                : null
                            }
                            className="h-[50px] w-full appearance-none rounded-[16px] border-[1.5px] border-[#C2CAD6] bg-[#F9FAFB] px-3 pr-8 text-sm text-[#0A0C0F] focus:outline-none"
                          />
                        </div>
                      )}

                      {/* {pRules.isDocumentNumberMandatory && ( */}
                      <div
                        className={`relative w-full ${hasAttemptedValidation && validationErrors[idx]?.["identityDocuments.0.idDocumentNumber"] ? "pb-6" : ""}`}
                      >
                        <TailwindCustomInput
                          type="text"
                          placeholder={`Enter ${p.identityDocuments?.[0]?.idType === "PT"
                            ? "Passport number"
                            : p.identityDocuments?.[0]?.idType === "DL"
                              ? "Driving licence"
                              : "National ID"
                            }`}
                          label={`${p.identityDocuments?.[0]?.idType === "PT"
                            ? "Passport number"
                            : p.identityDocuments?.[0]?.idType === "DL"
                              ? "Driving licence"
                              : "National ID"
                            } *`}
                          maxLength={20}
                          value={
                            p.identityDocuments?.[0]?.idDocumentNumber ?? ""
                          }
                          onChange={(evOrVal) => {
                            const v =
                              evOrVal && evOrVal.target
                                ? evOrVal.target.value
                                : evOrVal;
                            onPassengerFieldChange(
                              idx,
                              "identityDocuments.0.idDocumentNumber",
                              sanitizeIdentityDocumentInput(
                                typeof v === "string" ? v : "",
                              ),
                            );
                            clearFieldError(
                              idx,
                              "identityDocuments.0.idDocumentNumber",
                            );
                          }}
                          error={
                            hasAttemptedValidation
                              ? validationErrors[idx]?.[
                              "identityDocuments.0.idDocumentNumber"
                              ]
                              : null
                          }
                        />
                      </div>
                      {/* )} */}

                      {/* {pRules.isIssuingCountryCodeMandatory && ( */}
                      <div
                        className={`relative w-full max-w-[561px] ${hasAttemptedValidation && validationErrors[idx]?.["identityDocuments.0.issuingCountryCode"] ? "pb-6" : ""}`}
                      >
                        <SearchableDropdown
                          // options={
                          //   cities?.map((c) => ({
                          //     id: c.id,
                          //     value: c.code,
                          //     label: c.city,
                          //   })) || []
                          // }
                          options={
                            countries?.map((c) => ({
                              id: c.iso2,
                              value: c.iso2,
                              label: c.label,
                            })) || []
                          }
                          value={
                            p.identityDocuments?.[0]?.issuingCountryCode ?? ""
                          }
                          onChange={(value) => {
                            onPassengerFieldChange(
                              idx,
                              "identityDocuments.0.issuingCountryCode",
                              value,
                            );
                            clearFieldError(
                              idx,
                              "identityDocuments.0.issuingCountryCode",
                            );
                          }}
                          placeholder="Select issuing country"
                          label="Issuing country *"
                          widthClass="w-full"
                          searchPlaceholder="Search countries..."
                          error={
                            hasAttemptedValidation
                              ? validationErrors[idx]?.[
                              "identityDocuments.0.issuingCountryCode"
                              ]
                              : null
                          }
                          className="h-[50px] w-full appearance-none rounded-[16px] border-[1.5px] border-[#C2CAD6] bg-[#F9FAFB] px-3 pr-8 text-sm text-[#0A0C0F] focus:outline-none"
                        />
                      </div>
                      {/* )} */}

                      {/* {pRules.isDateOfIssueMandatory && ( */}
                      <div
                        className={`w-full max-w-[561px] ${hasAttemptedValidation && validationErrors[idx]?.["identityDocuments.0.dateOfIssue"] ? "pb-6" : ""}`}
                      >
                        <label className="mb-1 block text-[12px] text-[#0A0C0F]">
                          Date of issue *
                        </label>
                        <TailiwindCustomDatePicker
                          value={
                            p.identityDocuments?.[0]?.dateOfIssue
                              ? parseLocalDateString(
                                p.identityDocuments?.[0]?.dateOfIssue,
                              )
                              : null
                          }
                          onChange={(date) => {
                            const iso = formatDateToLocalISO(date);
                            onPassengerFieldChange(
                              idx,
                              "identityDocuments.0.dateOfIssue",
                              iso,
                            );
                            clearFieldError(
                              idx,
                              "identityDocuments.0.dateOfIssue",
                            );
                          }}
                          minDate={issuePickerBounds.minDate}
                          maxDate={issuePickerBounds.maxDate}
                          placeholder="Please select"
                          error={
                            hasAttemptedValidation
                              ? validationErrors[idx]?.[
                              "identityDocuments.0.dateOfIssue"
                              ]
                              : null
                          }
                          overridesClass
                          inputClass="h-[50px] w-full rounded-[16px] border-[1.5px] border-[#C2CAD6] bg-[#F9FAFB] px-3 text-sm placeholder:text-[#98A4B3] text-[#0A0C0F] focus:outline-none"
                        />
                      </div>
                      {/* )} */}

                      {/* {pRules.isExpiryDateMandatory && ( */}
                      <div
                        className={`w-full max-w-[561px] ${hasAttemptedValidation && validationErrors[idx]?.["identityDocuments.0.expiryDate"] ? "pb-6" : ""}`}
                      >
                        <label className="mb-1 block text-[12px] text-[#0A0C0F]">
                          Expiry date *
                        </label>
                        <TailiwindCustomDatePicker
                          value={
                            p.identityDocuments?.[0]?.expiryDate
                              ? parseLocalDateString(
                                p.identityDocuments?.[0]?.expiryDate,
                              )
                              : null
                          }
                          onChange={(date) => {
                            const iso = formatDateToLocalISO(date);
                            onPassengerFieldChange(
                              idx,
                              "identityDocuments.0.expiryDate",
                              iso,
                            );
                            clearFieldError(
                              idx,
                              "identityDocuments.0.expiryDate",
                            );
                          }}
                          minDate={new Date()}
                          placeholder="Please select"
                          error={
                            hasAttemptedValidation
                              ? validationErrors[idx]?.[
                              "identityDocuments.0.expiryDate"
                              ]
                              : null
                          }
                          overridesClass
                          inputClass="h-[50px] w-full rounded-[16px] border-[1.5px] border-[#C2CAD6] bg-[#F9FAFB] px-3 text-sm placeholder:text-[#98A4B3] text-[#0A0C0F] focus:outline-none"
                        />
                      </div>
                      {/* )} */}

                      {/* {pRules.isResidenceCountryCodeMandatory && ( */}
                      <div
                        className={`relative w-full max-w-[561px] ${hasAttemptedValidation && validationErrors[idx]?.["identityDocuments.0.residenceCountryCode"] ? "pb-6" : ""}`}
                      >
                        <SearchableDropdown
                          // options={
                          //   cities?.map((c) => ({
                          //     id: c.id,
                          //     value: c.code,
                          //     label: c.city,
                          //   })) || []
                          // }
                          options={
                            countries?.map((c) => ({
                              id: c.iso2,
                              value: c.iso2,
                              label: c.label,
                            })) || []
                          }
                          value={
                            p.identityDocuments?.[0]?.residenceCountryCode ?? ""
                          }
                          onChange={(value) => {
                            onPassengerFieldChange(
                              idx,
                              "identityDocuments.0.residenceCountryCode",
                              value,
                            );
                            clearFieldError(
                              idx,
                              "identityDocuments.0.residenceCountryCode",
                            );
                          }}
                          placeholder="Select residence country"
                          label="Residence Country (optional)"
                          widthClass="w-full"
                          searchPlaceholder="Search countries..."
                          error={
                            hasAttemptedValidation
                              ? validationErrors[idx]?.[
                              "identityDocuments.0.residenceCountryCode"
                              ]
                              : null
                          }
                          className="h-[50px] w-full appearance-none rounded-[16px] border-[1.5px] border-[#C2CAD6] bg-[#F9FAFB] px-3 pr-8 text-sm text-[#0A0C0F] focus:outline-none"
                        />
                      </div>
                      {/* )} */}

                      {/* {fareBookingSearchRules?.isLeadEmailAddressMandatory && ( */}
                      <div
                        className={`relative w-full ${hasAttemptedValidation && validationErrors[idx]?.["contact.contactsProvided.0.emailAddress.0"] ? "pb-6" : ""}`}
                      >
                        <TailwindCustomInput
                          type="email"
                          placeholder="Enter an email"
                          label="Email *"
                          value={
                            p.contact?.contactsProvided?.[0]
                              ?.emailAddress?.[0] ?? ""
                          }
                          onChange={(evOrVal) => {
                            const v =
                              evOrVal && evOrVal.target
                                ? evOrVal.target.value
                                : evOrVal;
                            onPassengerFieldChange(
                              idx,
                              "contact.contactsProvided.0.emailAddress.0",
                              sanitizeEmailInput(
                                typeof v === "string" ? v : "",
                              ),
                            );
                            clearFieldError(
                              idx,
                              "contact.contactsProvided.0.emailAddress.0",
                            );
                          }}
                          error={
                            hasAttemptedValidation
                              ? validationErrors[idx]?.[
                              "contact.contactsProvided.0.emailAddress.0"
                              ]
                              : null
                          }
                        />
                      </div>
                      {/* )} */}

                      {pRules.isDateOfBirthMandatory && (
                        <div
                          className={`w-full max-w-[561px] ${hasAttemptedValidation && validationErrors[idx]?.["passengerInfo.birthDate"] ? "pb-6" : ""}`}
                        >
                          <label className="mb-1 block text-[12px] text-[#0A0C0F]">
                            Birth date *
                          </label>
                          <TailiwindCustomDatePicker
                            placeholder="Please select"
                            value={
                              p.passengerInfo?.birthDate
                                ? parseLocalDateString(
                                  p.passengerInfo?.birthDate,
                                )
                                : null
                            }
                            onChange={(date) => {
                              const iso = formatDateToLocalISO(date);
                              onPassengerFieldChange(
                                idx,
                                "passengerInfo.birthDate",
                                iso,
                              );
                              clearFieldError(idx, "passengerInfo.birthDate");
                            }}
                            minDate={birthPickerBounds.minDate}
                            maxDate={birthPickerBounds.maxDate}
                            error={
                              hasAttemptedValidation
                                ? validationErrors[idx]?.[
                                "passengerInfo.birthDate"
                                ]
                                : null
                            }
                            overridesClass
                            inputClass="h-[50px] w-full rounded-[16px] border-[1.5px] border-[#C2CAD6] bg-[#F9FAFB] px-3 text-sm placeholder:text-[#98A4B3] text-[#0A0C0F] focus:outline-none"
                          />
                        </div>
                      )}

                      {pRules.isPANMandatory && (
                        <TailwindCustomInput
                          type="text"
                          placeholder="Enter PAN"
                          label="PAN"
                          value={p.passengerInfo?.PAN ?? ""}
                          onChange={(evOrVal) => {
                            const v =
                              evOrVal && evOrVal.target
                                ? evOrVal.target.value
                                : evOrVal;
                            onPassengerFieldChange(
                              idx,
                              "passengerInfo.PAN",
                              v ?? "",
                            );
                            clearFieldError(idx, "passengerInfo.PAN");
                          }}
                          error={
                            hasAttemptedValidation
                              ? validationErrors[idx]?.["passengerInfo.PAN"]
                              : null
                          }
                        />
                      )}

                      {pRules.isAdditionalIdTypeMandatory && (
                        <TailwindCustomInput
                          type="text"
                          placeholder="Additional ID type"
                          label="Additional ID type"
                          value={p.additionalId?.type ?? ""}
                          onChange={(evOrVal) => {
                            const v =
                              evOrVal && evOrVal.target
                                ? evOrVal.target.value
                                : evOrVal;
                            onPassengerFieldChange(
                              idx,
                              "additionalId.type",
                              v ?? "",
                            );
                            clearFieldError(idx, "additionalId.type");
                          }}
                          error={
                            hasAttemptedValidation
                              ? validationErrors[idx]?.["additionalId.type"]
                              : null
                          }
                        />
                      )}

                      {pRules.isAdditionalDocumentNumberMandatory && (
                        <TailwindCustomInput
                          type="text"
                          placeholder="Additional document number"
                          label="Additional document number"
                          value={p.additionalId?.number ?? ""}
                          onChange={(evOrVal) => {
                            const v =
                              evOrVal && evOrVal.target
                                ? evOrVal.target.value
                                : evOrVal;
                            onPassengerFieldChange(
                              idx,
                              "additionalId.number",
                              v ?? "",
                            );
                            clearFieldError(idx, "additionalId.number");
                          }}
                          error={
                            hasAttemptedValidation
                              ? validationErrors[idx]?.["additionalId.number"]
                              : null
                          }
                        />
                      )}

                      {/* Seat, Meal, Baggage, OtherAncillary (only show if mandatory) */}
                      {pRules.isSeatMandatory && (
                        <TailwindCustomInput
                          type="text"
                          placeholder="Preferred seat (if any)"
                          label="Seat"
                          value={p.seat ?? ""}
                          onChange={(evOrVal) => {
                            onPassengerFieldChange(
                              idx,
                              "seat",
                              evOrVal.target?.value ?? evOrVal,
                            );
                            clearFieldError(idx, "seat");
                          }}
                          error={
                            hasAttemptedValidation
                              ? validationErrors[idx]?.["seat"]
                              : null
                          }
                        />
                      )}

                      {pRules.isMealMandatory && (
                        <TailwindCustomInput
                          type="text"
                          placeholder="Meal preference"
                          label="Meal"
                          value={p.meal ?? ""}
                          onChange={(evOrVal) => {
                            onPassengerFieldChange(
                              idx,
                              "meal",
                              evOrVal.target?.value ?? evOrVal,
                            );
                            clearFieldError(idx, "meal");
                          }}
                          error={
                            hasAttemptedValidation
                              ? validationErrors[idx]?.["meal"]
                              : null
                          }
                        />
                      )}

                      {pRules.isBaggageMandatory && (
                        <TailwindCustomInput
                          type="text"
                          placeholder="Baggage"
                          label="Baggage"
                          value={p.baggage ?? ""}
                          onChange={(evOrVal) => {
                            onPassengerFieldChange(
                              idx,
                              "baggage",
                              evOrVal.target?.value ?? evOrVal,
                            );
                            clearFieldError(idx, "baggage");
                          }}
                          error={
                            hasAttemptedValidation
                              ? validationErrors[idx]?.["baggage"]
                              : null
                          }
                        />
                      )}

                      {pRules.isOtherAncillaryMandatory && (
                        <TailwindCustomInput
                          type="text"
                          placeholder="Other ancillaries"
                          label="Other ancillaries"
                          value={p.otherAncillary ?? ""}
                          onChange={(evOrVal) => {
                            onPassengerFieldChange(
                              idx,
                              "otherAncillary",
                              evOrVal.target?.value ?? evOrVal,
                            );
                            clearFieldError(idx, "otherAncillary");
                          }}
                          error={
                            hasAttemptedValidation
                              ? validationErrors[idx]?.["otherAncillary"]
                              : null
                          }
                        />
                      )}

                      {/* {fareBookingSearchRules?.isLeadPhoneNumberMandatory && ( */}
                      {/* <div className="w-full">
                      <label className="mb-1 block text-[12px] text-[#0A0C0F]">
                        Phone
                      </label>
                      <div className="flex gap-2">
                        <div className="relative flex items-center">
                          <img
                            src={COUNTRY_CODE_FLAGS[p.contact?.contactsProvided?.[0]?.phone?.[0]?.areaCode ?? ""] ?? FlagUsa}
                            alt=""
                            aria-hidden
                            className="pointer-events-none absolute left-2 h-[26px] w-[26px] shrink-0 rounded-full object-cover object-center"
                          />
                          <select
                            aria-label="Country code"
                            className="h-10 w-28 appearance-none rounded-lg border border-[#C2CAD6] bg-white pr-6 text-sm text-[#3D495C] focus:outline-none pl-[40px]"
                            value={
                              p.contact?.contactsProvided?.[0]?.phone?.[0]
                                ?.areaCode ?? ""
                            }
                            onChange={(e) =>
                              onPassengerFieldChange(
                                idx,
                                "contact.contactsProvided.0.phone.0.areaCode",
                                e.target.value
                              )
                            }
                          >
                            <option value="+1">+1</option>
                            <option value="+92">+92</option>
                            <option value="+971">+971</option>
                          </select>
                          <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
                            <ChevronDown />
                          </div>
                        </div>

                        <TailwindCustomInput
                          type="text"
                          placeholder="Phone"
                          value={
                            p.contact?.contactsProvided?.[0]?.phone?.[0]
                              ?.phoneNumber ?? ""
                          }
                          onChange={(evOrVal) => {
                            const v =
                              evOrVal && evOrVal.target
                                ? evOrVal.target.value
                                : evOrVal;
                            onPassengerFieldChange(
                              idx,
                              "contact.contactsProvided.0.phone.0.phoneNumber",
                              v ?? ""
                            );
                          }}
                        />
                      </div>
                    </div> */}
                      <div
                        className={`relative w-full max-w-[561px] ${hasAttemptedValidation &&
                          validationErrors[idx]?.[
                          "contact.contactsProvided.0.phone.0"
                          ]
                          ? "pb-6"
                          : ""
                          }`}
                      >
                        <label className="mb-1 block text-[12px] text-[#0A0C0F]">
                          Phone *
                        </label>
                        <div
                          className={
                            hasAttemptedValidation &&
                              validationErrors[idx]?.[
                              "contact.contactsProvided.0.phone.0"
                              ]
                              ? "phone-input-error"
                              : ""
                          }
                        >
                          <PhoneInput
                            defaultCountry="us"
                            value={(() => {
                              const ownAreaCode =
                                p.contact?.contactsProvided?.[0]?.phone?.[0]
                                  ?.areaCode ?? "";
                              const ownPhoneNumber =
                                p.contact?.contactsProvided?.[0]?.phone?.[0]
                                  ?.phoneNumber ?? "";
                              const ownPhone = ownAreaCode + ownPhoneNumber;
                              if (ownAreaCode && ownPhoneNumber)
                                return ownPhone;
                              // if (ownPhone !== "+1") return ownPhone;
                              const ptc = (p.ptc || "").toUpperCase();
                              if (
                                (ptc === "CHD" || ptc === "INF") &&
                                firstAdtPhone
                              ) {
                                return (
                                  firstAdtPhone.areaCode +
                                  firstAdtPhone.phoneNumber
                                );
                              }
                              return "";
                            })()}
                            // value={
                            //   (p.contact?.contactsProvided?.[0]?.phone?.[0]
                            //     ?.areaCode || "") +
                            //   (p.contact?.contactsProvided?.[0]?.phone?.[0]
                            //     ?.phoneNumber || "")
                            // }
                            onChange={(phone, meta) => {
                              const dialCode = `+${meta.country.dialCode}`;
                              const phoneNumber = phone.replace(dialCode, "");
                              onPassengerFieldChange(
                                idx,
                                "contact.contactsProvided.0.phone.0.areaCode",
                                dialCode,
                              );
                              onPassengerFieldChange(
                                idx,
                                "contact.contactsProvided.0.phone.0.phoneNumber",
                                phoneNumber,
                              );
                              clearFieldError(
                                idx,
                                "contact.contactsProvided.0.phone.0",
                              );
                            }}
                            forceDialCode={true}
                            hideDropdown={false}
                            disableCountryGuess={false}
                            className="custom-phone-wrapper"
                            countrySelectorStyleProps={{
                              buttonClassName: "country-selector-btn",
                            }}
                            inputProps={{
                              placeholder: "Phone",
                            }}
                          />
                        </div>
                        {hasAttemptedValidation &&
                          validationErrors[idx]?.[
                          "contact.contactsProvided.0.phone.0"
                          ] && (
                            <p className="absolute left-0 text-[12px] mt-1 text-[#E65959] whitespace-nowrap">
                              {
                                validationErrors[idx][
                                "contact.contactsProvided.0.phone.0"
                                ]
                              }
                            </p>
                          )}
                      </div>
                      {/* )} */}
                    </div>
                  </div>
                </div>
              </React.Fragment>
            );
          })}
        </div>

        {/* RIGHT: Trip details */}
        <div className="md:sticky md:top-6 self-start">
          <div className="md:max-h-[calc(100vh-12rem)] md:overflow-auto pr-1">
            <FlightSummaryCard
              title="Trip details"
              // headerActionText="View all"
              // onHeaderActionClick={() => {/* handle view all */ }}
              segments={segments}
              fare={priceFareFamily}
            />

            <FLightFareRule
              trip={trip.raw}
              ruleData={fareRuleData}
              wideLayout
              externalModalOpen={fareRulesModalOpen}
              onExternalModalClose={() => setFareRulesModalOpen(false)}
            />

            <FLightPriceBreakdown
              open={openPrice}
              onToggleOpen={() => setOpenPrice((v) => !v)}
              trip={trip.raw}
            />
          </div>

          <div className="mt-3">
            <Checkbox
              checked={isFareRuleChecked}
              onChange={(e) => {
                setIsFareRuleChecked(e.target.checked);
                if (e.target.checked) setShowFareRuleError(false);
              }}
              className="items-start [&_.ant-checkbox-inner]:w-5 [&_.ant-checkbox-inner]:h-5 [&_.ant-checkbox-inner]:rounded-lg [&_.ant-checkbox-inner]:border-[#A7C0EC] [&_.ant-checkbox-inner]:border [&_.ant-checkbox]:mt-[2px]"
            >
              <span className="font-medium text-sm leading-none tracking-normal align-middle">
                I acknowledge and accept the{" "}
                <span
                  className="text-[#5383DA] cursor-pointer hover:underline"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setFareRulesModalOpen(true);
                  }}
                >
                  fare rules
                </span>{" "}
                for this booking.
              </span>
            </Checkbox>
            {showFareRuleError && (
              <p className="text-red-500 text-xs mt-1">
                You must agree to the fare rules policies to continue.
              </p>
            )}
          </div>

          <Button
            type="button"
            overrideClasses
            className="mt-4 mx-auto h-[47px] min-w-[155px] rounded-[100px] py-[14px] px-[40px] text-[16px] font-semibold text-white hover:brightness-95 active:brightness-90 bg-[#2351A3] flex items-center justify-center gap-[10px]"
            // onClick={() => handleFlightProvInitialBooking()}
            onClick={async () => {
              setHasAttemptedValidation(true);
              const fieldErrors =
                validatePassengersForFlightProvisionalBookingFields(
                  fareBookingSearchRules,
                  flightBookingPayload,
                );
              setValidationErrors(fieldErrors);

              if (!isFareRuleChecked) {
                setShowFareRuleError(true);
                return;
              }

              if (Object.keys(fieldErrors).length > 0) return;

              setShowBookingConfirm(true);
            }}
            disabled={isPending}
          >
            {isPending ? "Loading..." : "Continue"}
          </Button>
        </div>

        {!isAuthenticated && (
          <LoginModal
            showModal={!isAuthenticated}
            showGoBack
            onClose={() => navigate(-1)}
          />
        )}
      </div>

      <ConfirmationModal
        open={showBookingConfirm}
        title="Continue with these details?"
        description="We will use your passenger information to check the latest fare and availability for this itinerary. Please confirm that names, dates of birth, and travel documents match what you will travel with."
        note="You will still review a trip summary and complete payment before a ticket is issued."
        confirmText="Proceed"
        cancelText="Cancel"
        loading={isPending}
        onCancel={() => setShowBookingConfirm(false)}
        onConfirm={() => {
          setShowBookingConfirm(false);
          handleFlightProvInitialBooking();
        }}
      />

      <ConfirmationModal
        open={showFareChangeModal}
        title="Price has changed"
        description={
          provisionalFareChange ? (
            <div>
              <p
                style={{
                  margin: 0,
                  marginBottom: 14,
                  color: "#374151",
                  lineHeight: 1.65,
                  fontSize: 14,
                }}
              >
                The total fare is different from the price you saw when you
                selected this flight. You can go back to search, or continue
                with the updated amount.
              </p>
              <div
                style={{
                  background: "#F0F6FF",
                  borderRadius: 10,
                  padding: "12px 14px",
                  fontSize: 14,
                  color: "#4B5563",
                  lineHeight: 1.6,
                  borderLeft: "3px solid #2351A3",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 8,
                    gap: 12,
                  }}
                >
                  <span>Previous price</span>
                  <span style={{ fontWeight: 600, color: "#0A0C0F" }}>
                    {formatMoney(
                      provisionalFareChange.oldAmount,
                      provisionalFareChange.oldCurrency,
                    )}
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 12,
                  }}
                >
                  <span>New price</span>
                  <span style={{ fontWeight: 600, color: "#2351A3" }}>
                    {formatMoney(
                      provisionalFareChange.newAmount,
                      provisionalFareChange.newCurrency,
                    )}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            ""
          )
        }
        confirmText="Proceed"
        cancelText="Cancel"
        onCancel={() => {
          setShowFareChangeModal(false);
          setProvisionalFareChange(null);
          navigate("/search_flight");
        }}
        onConfirm={() => {
          const p = provisionalFareChange;
          if (!p) {
            setShowFareChangeModal(false);
            return;
          }
          // if (p.successToast) toast.success(p.successToast);
          if (Object.keys(p.newRaw).length > 0 && onUpdateFlightRaw) {
            onUpdateFlightRaw(p.newRaw);
          }
          if (typeof onNext === "function") {
            onNext(p.offerId);
          }
          setProvisionalFareChange(null);
          setShowFareChangeModal(false);
        }}
      />
    </section>
  );
}
