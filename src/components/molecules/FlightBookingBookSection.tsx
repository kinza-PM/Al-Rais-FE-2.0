import cabinIcon from "../../assets/svgs/cabin.svg";
import baggageIcon from "../../assets/svgs/baggage.svg";
// import entertainmentIcon from "../../assets/svgs/entertainment.svg";
// import mealIcon from "../../assets/svgs/meals.svg";
// import portIcon from "../../assets/svgs/ports.svg";
// import wifiIcon from "../../assets/svgs/wifi.svg";
// import arrownDownwardIcon from "../../assets/svgs/arrow-downwards.svg";
import EmirateLogo from "../../assets/images/emirates.png";
import FlagUsa from "../../assets/images/Flag-usa.png";
import FlagUae from "../../assets/svgs/Flag-uae.svg";
import FlagPakistan from "../../assets/svgs/Flag-pakistan.svg";
import React, { useMemo, useState } from "react";

const COUNTRY_CODE_FLAGS: Record<string, string> = {
  "+1": FlagUsa,
  "+92": FlagPakistan,
  "+971": FlagUae,
};
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
import { validatePassengersForFlightProvisionalBooking } from "../../utils/flightBookingHelper";
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
}: FlightBookingBookSectionProps) {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [openPrice, setOpenPrice] = useState(false);

  const pRules = fareBookingSearchRules?.passengerRules?.[0] ?? {};
  const { mutateAsync, isPending } = useFlightInitialBooking();
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
      navigate("/search_flight");
    },
  };

  const handleFlightProvInitialBooking = async () => {
    if (typeof validatePassengersForFlightProvisionalBooking === "function") {
      const { valid, error } = validatePassengersForFlightProvisionalBooking(
        fareBookingSearchRules,
        flightBookingPayload,
      );
      if (!valid) {
        toast.error(error || "Validation failed.");
        return;
      }
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
      const err = extractErrorFromAxiosApiError(error);
      toast.error(err);
      if (err == "Unable to perform air booking step") {
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
              <div className="rounded-xl border border-[#E4E4E7] bg-white shadow-sm">
                <div className="flex items-center justify-between px-4 py-3 border-b border-[#E4E4E7]">
                  <h3 className="text-[15px] font-medium text-[#0A0C0F]">
                    Contact person {String(idx + 1).padStart(2, "0")} details
                  </h3>
                  {/* <CustomToggle
                                        label="I’m booking for someone else"
                                        checked={bookingForOther}
                                        onChange={() => setBookingForOther((v) => !v)}
                                    /> */}
                </div>

                <div className="px-4 py-4">
                  <div className="grid gap-4 md:grid-cols-[1.2fr_1.8fr]">
                    <div className="relative w-full">
                      <SearchableDropdown
                        options={[
                          { id: "mr", value: "MR", label: "Mr" },
                          { id: "ms", value: "MS", label: "Ms" },
                          { id: "mrs", value: "MRS", label: "Mrs" },
                        ]}
                        value={p.passengerInfo?.nameTitle ?? ""}
                        onChange={(value) =>
                          onPassengerFieldChange(
                            idx,
                            "passengerInfo.nameTitle",
                            value,
                          )
                        }
                        placeholder="Select title"
                        label="Title"
                        widthClass="w-full"
                        className="h-10 w-full appearance-none rounded-lg border border-[#C2CAD6] bg-white px-3 pr-8 text-sm text-[#0A0C0F] focus:outline-none"
                      />
                    </div>
                    <TailwindCustomInput
                      type="text"
                      placeholder="Enter your full name"
                      label="Full name (Filled based on ID/Passport/Driver’s license)"
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
                      }}
                    />

                    <TailwindCustomInput
                      type="text"
                      placeholder="Enter your surname"
                      label="Surname"
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
                      }}
                    />

                    <div className="relative w-full">
                      <SearchableDropdown
                        options={[
                          { id: "male", value: "M", label: "Male" },
                          { id: "female", value: "F", label: "Female" },
                        ]}
                        value={p.passengerInfo?.gender ?? ""}
                        onChange={(value) =>
                          onPassengerFieldChange(
                            idx,
                            "passengerInfo.gender",
                            value,
                          )
                        }
                        placeholder="Select gender"
                        label="Gender"
                        widthClass="w-full"
                        className="h-10 w-full appearance-none rounded-lg border border-[#C2CAD6] bg-white px-3 pr-8 text-sm text-[#0A0C0F] focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Passenger details (separate card) */}

              <div className="rounded-xl border border-[#E4E4E7] bg-white shadow-sm">
                <div className="flex items-center justify-between px-4 py-2 border-b border-[#E4E4E7]">
                  <h3 className="text-[15px] font-medium text-[#0A0C0F]">
                    Passenger {String(idx + 1).padStart(2, "0")} details
                  </h3>
                </div>

                <div className="px-4 py-4">
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
                      <div className="relative w-full">
                        <SearchableDropdown
                          options={[
                            {
                              id: "passport",
                              value: "PT",
                              label: "Passport (PT)",
                            },
                          ]}
                          value={p.identityDocuments?.[0]?.idType ?? "PT"}
                          onChange={(value) =>
                            onPassengerFieldChange(
                              idx,
                              "identityDocuments.0.idType",
                              value,
                            )
                          }
                          placeholder="Select ID type"
                          label="ID type"
                          widthClass="w-full"
                          className="h-10 w-full appearance-none rounded-lg border border-[#C2CAD6] bg-white px-3 pr-8 text-sm text-[#0A0C0F] focus:outline-none"
                        />
                      </div>
                    )}

                    {/* {pRules.isDocumentNumberMandatory && ( */}
                    <TailwindCustomInput
                      type="text"
                      placeholder={`Enter ${
                        p.identityDocuments?.[0]?.idType === "PT"
                          ? "Passport number"
                          : p.identityDocuments?.[0]?.idType === "DL"
                            ? "Driving licence"
                            : "National ID"
                      }`}
                      label={`${
                        p.identityDocuments?.[0]?.idType === "PT"
                          ? "Passport number"
                          : p.identityDocuments?.[0]?.idType === "DL"
                            ? "Driving licence"
                            : "National ID"
                      }`}
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
                      }}
                    />
                    {/* )} */}

                    {/* {pRules.isIssuingCountryCodeMandatory && ( */}
                    <div className="relative w-full">
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
                        onChange={(value) =>
                          onPassengerFieldChange(
                            idx,
                            "identityDocuments.0.issuingCountryCode",
                            value,
                          )
                        }
                        placeholder="Select issuing country"
                        label="Issuing country"
                        widthClass="w-full"
                        searchPlaceholder="Search countries..."
                        className="h-10 w-full appearance-none rounded-lg border border-[#C2CAD6] bg-white px-3 pr-8 text-sm text-[#0A0C0F] focus:outline-none"
                      />
                    </div>
                    {/* )} */}

                    {pRules.isDateOfIssueMandatory && (
                      <div className="w-full">
                        <label className="mb-1 block text-[12px] text-[#3D495C]">
                          Date of issue
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
                          }}
                          placeholder="Please select"
                          overridesClass
                          inputClass="h-10 w-full rounded-lg border border-[#C2CAD6] px-3 text-sm placeholder:text-[#98A4B3] text-[#0A0C0F] focus:outline-none"
                        />
                      </div>
                    )}

                    {/* {pRules.isExpiryDateMandatory && ( */}
                    <div className="w-full">
                      <label className="mb-1 block text-[12px] text-[#3D495C]">
                        Expiry date
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
                        }}
                        placeholder="Please select"
                        overridesClass
                        inputClass="h-10 w-full rounded-lg border border-[#C2CAD6] px-3 text-sm placeholder:text-[#98A4B3] text-[#0A0C0F] focus:outline-none"
                      />
                    </div>
                    {/* )} */}

                    {/* {pRules.isResidenceCountryCodeMandatory && ( */}
                    <div className="relative w-full">
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
                        onChange={(value) =>
                          onPassengerFieldChange(
                            idx,
                            "identityDocuments.0.residenceCountryCode",
                            value,
                          )
                        }
                        placeholder="Select residence country"
                        label="Residence Country"
                        widthClass="w-full"
                        searchPlaceholder="Search countries..."
                        className="h-10 w-full appearance-none rounded-lg border border-[#C2CAD6] bg-white px-3 pr-8 text-sm text-[#0A0C0F] focus:outline-none"
                      />
                    </div>
                    {/* )} */}

                    {/* {fareBookingSearchRules?.isLeadEmailAddressMandatory && ( */}
                    <TailwindCustomInput
                      type="email"
                      placeholder="Enter an email"
                      label="Email"
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
                      }}
                    />
                    {/* )} */}

                    {pRules.isDateOfBirthMandatory && (
                      <div className="w-full">
                        <label className="mb-1 block text-[12px] text-[#3D495C]">
                          Birth date
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
                          }}
                          overridesClass
                          inputClass="h-10 w-full rounded-lg border border-[#C2CAD6] px-3 text-sm placeholder:text-[#98A4B3] text-[#0A0C0F] focus:outline-none"
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
                        }}
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
                        }}
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
                        }}
                      />
                    )}

                    {/* Seat, Meal, Baggage, OtherAncillary (only show if mandatory) */}
                    {pRules.isSeatMandatory && (
                      <TailwindCustomInput
                        type="text"
                        placeholder="Preferred seat (if any)"
                        label="Seat"
                        value={p.seat ?? ""}
                        onChange={(evOrVal) =>
                          onPassengerFieldChange(
                            idx,
                            "seat",
                            evOrVal.target?.value ?? evOrVal,
                          )
                        }
                      />
                    )}

                    {pRules.isMealMandatory && (
                      <TailwindCustomInput
                        type="text"
                        placeholder="Meal preference"
                        label="Meal"
                        value={p.meal ?? ""}
                        onChange={(evOrVal) =>
                          onPassengerFieldChange(
                            idx,
                            "meal",
                            evOrVal.target?.value ?? evOrVal,
                          )
                        }
                      />
                    )}

                    {pRules.isBaggageMandatory && (
                      <TailwindCustomInput
                        type="text"
                        placeholder="Baggage"
                        label="Baggage"
                        value={p.baggage ?? ""}
                        onChange={(evOrVal) =>
                          onPassengerFieldChange(
                            idx,
                            "baggage",
                            evOrVal.target?.value ?? evOrVal,
                          )
                        }
                      />
                    )}

                    {pRules.isOtherAncillaryMandatory && (
                      <TailwindCustomInput
                        type="text"
                        placeholder="Other ancillaries"
                        label="Other ancillaries"
                        value={p.otherAncillary ?? ""}
                        onChange={(evOrVal) =>
                          onPassengerFieldChange(
                            idx,
                            "otherAncillary",
                            evOrVal.target?.value ?? evOrVal,
                          )
                        }
                      />
                    )}

                    {/* {fareBookingSearchRules?.isLeadPhoneNumberMandatory && ( */}
                    {/* <div className="w-full">
                      <label className="mb-1 block text-[12px] text-[#3D495C]">
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
                    <div className="w-full">
                      <label className="mb-1 block text-[12px] text-[#3D495C]">
                        Phone
                      </label>
                      <PhoneInput
                        defaultCountry="us"
                        value={
                          (p.contact?.contactsProvided?.[0]?.phone?.[0]
                            ?.areaCode || "") +
                          (p.contact?.contactsProvided?.[0]?.phone?.[0]
                            ?.phoneNumber || "")
                        }
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
            className="mt-6 mx-4 w-[calc(100%-2rem)] rounded-xl bg-[#2351A3] py-3 text-[16px] font-semibold text-[#F2F2F3] hover:brightness-95 active:brightness-90"
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
