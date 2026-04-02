import cabinIcon from "../../assets/svgs/cabin.svg";
import baggageIcon from "../../assets/svgs/baggage.svg";
// import entertainmentIcon from "../../assets/svgs/entertainment.svg";
// import mealIcon from "../../assets/svgs/meals.svg";
// import portIcon from "../../assets/svgs/ports.svg";
// import wifiIcon from "../../assets/svgs/wifi.svg";
// import arrownDownwardIcon from "../../assets/svgs/arrow-downwards.svg";
import EmirateLogo from "../../assets/images/emirates.png";
import React, { useEffect, useMemo, useState } from "react";
import FLightPriceBreakdown from "../atoms/FlightPriceBreakdown";
import Button from "../atoms/Button";
// import CustomToggle from "../common/CustomToggle";
import FlightSummaryCard from "../atoms/FlightSummaryCard";
import TailiwindCustomDatePicker from "../common/TailiwindCustomDatePicker";
import TailwindCustomInput from "../common/TailwindCustomInput";
import SearchableDropdown from "../common/SearchableDropdown";
import FLightFareRule from "../atoms/FlightFareRule";
import {
  buildFlightSegmentFromTrip,
  formatDateToLocalISO,
  getPriceCabinClassForFlightSummary,
  parseLocalDateString,
} from "../../utils/helpers";
import { useFlightInitialBooking } from "../../hooks/useFlightBooking";
import toast from "react-hot-toast";
import {
  validatePassengersForFlightProvisionalBooking,
  validatePassengersForFlightProvisionalBookingFields,
} from "../../utils/flightBookingHelper";
import { extractErrorFromAxiosApiError } from "../../utils/apiErrorHanlder";
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

type FlightBookingBookSectionProps = {
  trip: any;
  passengers: Array<any>;
  countries: CountryOption[];
  flightBookingPayload: any;
  onPassengerFieldChange: (index: number, path: string, value: any) => void;
  fareBookingSearchRules?: any;
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
  const [hasAttemptedValidation, setHasAttemptedValidation] = useState(false);

  const pRules = fareBookingSearchRules?.passengerRules?.[0] ?? {};
  const { mutateAsync, isPending } = useFlightInitialBooking();

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
    changeText: "Change",
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
    setHasAttemptedValidation(true);
    const fieldErrors = validatePassengersForFlightProvisionalBookingFields(
      fareBookingSearchRules,
      flightBookingPayload,
    );
    setValidationErrors(fieldErrors);

    if (Object.keys(fieldErrors).length > 0) {
      // Still check overall validation for backward compatibility
      if (typeof validatePassengersForFlightProvisionalBooking === "function") {
        const { valid } = validatePassengersForFlightProvisionalBooking(
          fareBookingSearchRules,
          flightBookingPayload,
        );
        if (!valid) {
          return;
        }
      }
      return;
    }
    try {
      const response = await mutateAsync(flightBookingPayload);
      if (
        response?.meta?.success &&
        response?.meta?.statusMessage == "SUCCESS"
      ) {
        toast.success(response?.meta?.actionType);
        const updated = response?.data?.[0];
        const { detail, fare, financialInfo, journey, offerId } = updated;
        if (updated && typeof onUpdateFlightRaw === "function") {
          const newRaw: any = {};
          if (detail !== undefined) newRaw.detail = detail;
          if (fare !== undefined) newRaw.fare = fare;
          if (financialInfo !== undefined) newRaw.financialInfo = financialInfo;
          if (journey !== undefined) newRaw.journey = journey;
          if (offerId !== undefined) newRaw.offerId = offerId;
          if (Object.keys(newRaw).length) {
            onUpdateFlightRaw(newRaw);
          }
        }
        if (typeof onNext === "function") {
          onNext(offerId);
        }
      }
    } catch (error) {
      console.log("error", error);
      const err = extractErrorFromAxiosApiError(error);
      toast.error(err);
      if (
        err == "Unable to perform air booking step" ||
        err ==
        "PNR has not been created successfully, see remaining messages for details"
      ) {
        navigate("/search_flight");
      }
    }
  };

  // const countryOptions = useMemo(() => {
  //   return getUniqueCountries(cities);
  // }, [cities]);

  return (
    <section className="mx-auto max-w-full px-10 flight-booking-section">
      <div className="grid gap-4 md:grid-cols-[2fr_1fr] flight-booking-grid">
        <div className="space-y-4">
          {passengers.map((p, idx) => (
            <React.Fragment key={p.passengerKey || idx}>
              <div className="rounded-[16px] border-[1.5px] border-[#C2CAD6] bg-white shadow-sm">
                <div className="flex items-center justify-between px-4 py-3 border-b-[1.5px] border-[#C2CAD6] rounded-t-[16px] bg-[#F2F2F3]">
                  <h3 className="text-[15px] font-medium text-[#0A0C0F]">
                    Contact person {String(idx + 1).padStart(2, "0")} details
                  </h3>
                  {/* <CustomToggle
                                        label="I’m booking for someone else"
                                        checked={bookingForOther}
                                        onChange={() => setBookingForOther((v) => !v)}
                                    /> */}
                </div>

                <div className="px-4 py-4 bg-[#F2F2F3] rounded-b-[16px]">
                  <div className="grid gap-x-1 gap-y-3 md:grid-cols-[1.2fr_1.8fr] pr-4">
                    <div
                      className={`relative w-full max-w-[300px] ${hasAttemptedValidation && validationErrors[idx]?.["passengerInfo.nameTitle"] ? "pb-4" : ""}`}
                    >
                      <SearchableDropdown
                        options={[
                          { id: "mr", value: "MR", label: "Mr" },
                          { id: "ms", value: "MS", label: "Ms" },
                          { id: "mrs", value: "MRS", label: "Mrs" },
                        ]}
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
                            value === "MR" ? "M" : "F",
                          );
                          clearFieldError(idx, "passengerInfo.nameTitle");
                          clearFieldError(idx, "passengerInfo.gender");
                        }}
                        placeholder="Select title"
                        label="Title *"
                        widthClass="w-full"
                        error={
                          hasAttemptedValidation
                            ? validationErrors[idx]?.["passengerInfo.nameTitle"]
                            : null
                        }
                        className="h-[50px] w-full appearance-none rounded-[16px] border-[1.5px] border-[#C2CAD6] bg-[white] px-3 pr-8 text-sm text-[#C2CAD6] focus:outline-none"
                      />
                    </div>
                    <div
                      className={`relative w-full max-w-[561px] ${hasAttemptedValidation && validationErrors[idx]?.["passengerInfo.givenName"] ? "pb-4" : ""}`}
                    >
                      <TailwindCustomInput
                        type="text"
                        placeholder="Enter your full name"
                        label="Full name (Filled based on ID/Passport/Driver’s license) *"
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
                            ? validationErrors[idx]?.["passengerInfo.givenName"]
                            : null
                        }
                        className="h-[50px] w-full rounded-[16px] border-[1.5px] border-[#C2CAD6] bg-[#F9FAFB] px-3 text-sm placeholder:text-[#C2CAD6] text-[#0A0C0F] focus:outline-none focus:border-[#5383DA] focus:ring-2 focus:ring-[#5383DA]/20"
                      />
                    </div>

                    <div
                      className={`relative w-full max-w-[300px] ${hasAttemptedValidation && validationErrors[idx]?.["passengerInfo.surname"] ? "pb-4" : ""}`}
                    >
                      <TailwindCustomInput
                        type="text"
                        placeholder="Enter your surname"
                        label="Surname *"
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
                            ? validationErrors[idx]?.["passengerInfo.surname"]
                            : null
                        }
                        className="h-[50px] w-full rounded-[16px] border-[1.5px] border-[#C2CAD6] bg-[#F9FAFB] px-3 text-sm placeholder:text-[#C2CAD6] text-[#0A0C0F] focus:outline-none focus:border-[#5383DA] focus:ring-2 focus:ring-[#5383DA]/20"
                      />
                    </div>

                    <div
                      className={`relative w-full max-w-[561px] ${hasAttemptedValidation && validationErrors[idx]?.["passengerInfo.gender"] ? "pb-4" : ""}`}
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
                        label="Gender *"
                        widthClass="w-full"
                        error={
                          hasAttemptedValidation
                            ? validationErrors[idx]?.["passengerInfo.gender"]
                            : null
                        }
                        className="h-[50px] w-full appearance-none rounded-[16px] border-[1.5px] border-[#C2CAD6] bg-[#FFFFFF] px-3 pr-8 text-sm text-[#0A0C0F] focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Passenger details (separate card) */}

              <div className="rounded-[16px] border-[1.5px] border-[#C2CAD6] bg-white shadow-sm">
                <div className="flex items-center justify-between px-4 py-2 border-b-[1.5px] border-[#C2CAD6] rounded-t-[16px]">
                  <h3 className="text-[15px] font-medium text-[#0A0C0F]">
                    Passenger {String(idx + 1).padStart(2, "0")} details
                  </h3>
                </div>

                <div className="px-4 py-4 rounded-b-[16px]">
                  <div className="grid gap-4 md:grid-cols-[1.2fr_1.8fr]">
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
                        className={`relative w-full max-w-[561px] ${hasAttemptedValidation && validationErrors[idx]?.["identityDocuments.0.idType"] ? "pb-4" : ""}`}
                      >
                        <SearchableDropdown
                          options={[
                            {
                              id: "passport",
                              value: "PT",
                              label: "Passport (PT)",
                            },
                          ]}
                          value={p.identityDocuments?.[0]?.idType ?? "PT"}
                          onChange={(value) => {
                            onPassengerFieldChange(
                              idx,
                              "identityDocuments.0.idType",
                              value,
                            );
                            clearFieldError(idx, "identityDocuments.0.idType");
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
                      className={`relative w-full ${hasAttemptedValidation && validationErrors[idx]?.["identityDocuments.0.idDocumentNumber"] ? "pb-4" : ""}`}
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
                        value={p.identityDocuments?.[0]?.idDocumentNumber ?? ""}
                        onChange={(evOrVal) => {
                          const v =
                            evOrVal && evOrVal.target
                              ? evOrVal.target.value
                              : evOrVal;
                          onPassengerFieldChange(
                            idx,
                            "identityDocuments.0.idDocumentNumber",
                            v ?? "",
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
                      className={`relative w-full max-w-[561px] ${hasAttemptedValidation && validationErrors[idx]?.["identityDocuments.0.issuingCountryCode"] ? "pb-4" : ""}`}
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
                            value: c.iso3,
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

                    {pRules.isDateOfIssueMandatory && (
                      <div
                        className={`w-full max-w-[561px] ${hasAttemptedValidation && validationErrors[idx]?.["identityDocuments.0.dateOfIssue"] ? "pb-4" : ""}`}
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
                    )}

                    {/* {pRules.isExpiryDateMandatory && ( */}
                    <div
                      className={`w-full max-w-[561px] ${hasAttemptedValidation && validationErrors[idx]?.["identityDocuments.0.expiryDate"] ? "pb-4" : ""}`}
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
                      className={`relative w-full max-w-[561px] ${hasAttemptedValidation && validationErrors[idx]?.["identityDocuments.0.residenceCountryCode"] ? "pb-4" : ""}`}
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
                            value: c.iso3,
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
                        label="Residence Country"
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
                      className={`relative w-full ${hasAttemptedValidation && validationErrors[idx]?.["contact.contactsProvided.0.emailAddress.0"] ? "pb-4" : ""}`}
                    >
                      <TailwindCustomInput
                        type="email"
                        placeholder="Enter an email"
                        label="Email *"
                        value={
                          p.contact?.contactsProvided?.[0]?.emailAddress?.[0] ??
                          ""
                        }
                        onChange={(evOrVal) => {
                          const v =
                            evOrVal && evOrVal.target
                              ? evOrVal.target.value
                              : evOrVal;
                          onPassengerFieldChange(
                            idx,
                            "contact.contactsProvided.0.emailAddress.0",
                            v ?? "",
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
                        className={`w-full max-w-[561px] ${hasAttemptedValidation && validationErrors[idx]?.["passengerInfo.birthDate"] ? "pb-4" : ""}`}
                      >
                        <label className="mb-1 block text-[12px] text-[#0A0C0F]">
                          Birth date *
                        </label>
                        <TailiwindCustomDatePicker
                          placeholder="Please select"
                          value={
                            p.passengerInfo?.birthDate
                              ? parseLocalDateString(p.passengerInfo?.birthDate)
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
                    <div className="relative w-full max-w-[561px]">
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
                            if (ownAreaCode && ownPhoneNumber) return ownPhone;
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
          ))}
        </div>

        {/* RIGHT: Trip details */}
        <div>
          <FlightSummaryCard
            title="Trip details"
            // headerActionText="View all"
            // onHeaderActionClick={() => {/* handle view all */ }}
            segments={segments}
            fare={priceFareFamily}
          />

          <FLightFareRule trip={trip.raw} />

          <FLightPriceBreakdown
            open={openPrice}
            onToggleOpen={() => setOpenPrice((v) => !v)}
            trip={trip.raw}
          />

          <Button
            type="button"
            overrideClasses
            className="mt-6 mx-auto h-[47px] min-w-[155px] rounded-[100px] py-[14px] px-[40px] text-[16px] font-semibold text-white hover:brightness-95 active:brightness-90 bg-[#2351A3] flex items-center justify-center gap-[10px]"
            onClick={() => handleFlightProvInitialBooking()}
            disabled={isPending}
          >
            {isPending ? "Loading..." : "Continue"}
          </Button>
        </div>

        {!isAuthenticated && <LoginModal showModal={!isAuthenticated} />}
      </div>
    </section>
  );
}
