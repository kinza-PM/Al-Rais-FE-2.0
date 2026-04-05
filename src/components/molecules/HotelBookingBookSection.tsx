import React, { useState } from "react";
import TailwindCustomInput from "../common/TailwindCustomInput";
import SearchableDropdown from "../common/SearchableDropdown";
import Button from "../atoms/Button";
import HotelImage from "../../../src/assets/images/Hotel Image.png";
import HotelSummaryCard from "../atoms/HotelSummaryCard";
import HotelPriceBreakdown from "../atoms/HotelPriceBreakdown";
import HotelFareRule from "../atoms/HotelFareRule";
import TailiwindCustomDatePicker from "../common/TailiwindCustomDatePicker";
// import SavedTravelersSection from "./SavedTravelersSection";
import {
  formatDateToLocalISO,
  parseLocalDateString,
} from "../../utils/helpers";
import {
  validateHotelBookingPassengersFields,
  type HotelBookingPayload,
  type HotelPassengerFieldErrors,
} from "../../utils/hotelBookingHelper";
import { PhoneInput } from "react-international-phone";
import "react-international-phone/style.css";
import type { CountryOption } from "../../features/flights/types";
import CustomToggle from "../common/CustomToggle";
// import { extractErrorFromAxiosApiError } from "../../utils/apiErrorHanlder";
// import toast from "react-hot-toast";
// import { useHotelReservationBooking } from "../../hooks/useHotelBooking";

type HotelBookingBookSectionProps = {
  hotelBookingPayload: HotelBookingPayload;
  onPassengerFieldChange: (
    roomIndex: number,
    passengerIndex: number,
    path: string,
    value: any,
  ) => void;
  onNext?: () => void;
  countries?: CountryOption[];
  hotelDetail?: any;
  bookingInfo?: any;
  selectedRooms?: any[];
  totalPrice?: number;
  currency?: string;
  /**
   * Expected child ages per room (distributed same as hotel search).
   * Example: [[5], [7, 9]] => room 0 has one child aged 5; room 1 has two children aged 7 & 9.
   */
  childAgesPerRoom?: number[][];
  /**
   * Check-in date used as reference for child age validation.
   */
  checkInDate?: string;
};

export default function HotelBookingBookSection({
  hotelBookingPayload,
  onPassengerFieldChange,
  onNext,
  countries = [],
  hotelDetail = {},
  bookingInfo = {},
  selectedRooms = [],
  totalPrice = 0,
  currency = "AED",
  childAgesPerRoom,
  checkInDate,
}: HotelBookingBookSectionProps) {
  const [validationErrors, setValidationErrors] =
    useState<HotelPassengerFieldErrors>({});
  const [hasAttemptedValidation, setHasAttemptedValidation] = useState(false);
  const [openPrice, setOpenPrice] = useState(false);

  // const { mutateAsync, isPending } = useHotelReservationBooking();
  const rooms = hotelBookingPayload?.rooms ?? [];
  const flatPassengers = rooms.flatMap((room, roomIdx) =>
    (room.passengers ?? []).map((passenger, pIdx) => ({
      roomIndex: roomIdx,
      passengerIndex: pIdx,
      passenger,
    })),
  );
  const roomOptions = rooms.map((_, i) => {
    const sel = selectedRooms[i];
    const roomName = sel?.room?.roomTypeName || `Room ${i + 1}`;
    const subcategory = sel?.room?.ratePlan?.meal || "";
    const label = subcategory ? `${roomName} - ${subcategory}` : roomName;
    return {
      id: String(i),
      value: String(i),
      label,
    };
  });

  const clearFieldError = (
    roomIdx: number,
    passengerIdx: number,
    fieldPath: string,
  ) => {
    if (
      hasAttemptedValidation &&
      validationErrors[roomIdx]?.[passengerIdx]?.[fieldPath]
    ) {
      setValidationErrors((prev) => {
        const updated = { ...prev };
        if (updated[roomIdx]?.[passengerIdx]) {
          delete updated[roomIdx][passengerIdx][fieldPath];
          if (Object.keys(updated[roomIdx][passengerIdx]).length === 0) {
            delete updated[roomIdx][passengerIdx];
          }
          if (Object.keys(updated[roomIdx]).length === 0) {
            delete updated[roomIdx];
          }
        }
        return updated;
      });
    }
  };

  const handleContinue = async () => {
    setHasAttemptedValidation(true);
    const fieldErrors = validateHotelBookingPassengersFields(
      hotelBookingPayload,
      {
        childAgesPerRoom: childAgesPerRoom ?? [],
        checkInDate: checkInDate,
      },
    );
    setValidationErrors(fieldErrors);
    const hasErrors = Object.keys(fieldErrors).some(
      (ri) => Object.keys(fieldErrors[Number(ri)] || {}).length > 0,
    );
    if (hasErrors) {
      return;
    }

    if (typeof onNext === "function") {
      onNext();
    }

    // try {
    //   const response = await mutateAsync(hotelBookingPayload);
    //   if (
    //     response?.meta?.success &&
    //     response?.meta?.statusMessage == "SUCCESS"
    //   ) {
    //     toast.success(response?.meta?.actionType);
    //     if (typeof onNext === "function") {
    //       onNext();
    //     }
    //   }
    // } catch (error) {
    //   console.log("error", error);
    //   const err = extractErrorFromAxiosApiError(error);
    //   toast.error(err);
    // }
  };

  return (
    <section className="mx-auto max-w-full px-0 sm:px-2 lg:px-4 flight-booking-section">
      <div className="grid gap-4 lg:grid-cols-[2fr_1fr] flight-booking-grid">
        <div className="space-y-4">
          {/* <SavedTravelersSection /> */}
          {flatPassengers.map(
            ({ roomIndex, passengerIndex, passenger: p }, flatIdx) => (
              <React.Fragment key={p.passengerKey || flatIdx}>
                <div className="rounded-2xl border border-[#E4E4E7] bg-white shadow-sm">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-[#E4E4E7]">
                    <h3 className="text-[15px] font-medium text-[#0A0C0F]">
                      Contact person {String(flatIdx + 1).padStart(2, "0")}{" "}
                      details
                    </h3>
                  </div>
                  <div className="px-4 py-4">
                    <div className="grid grid-cols-1 gap-x-4 gap-y-3 min-w-0 md:grid-cols-2">
                      <div
                        className={`relative w-full min-w-0 ${hasAttemptedValidation && validationErrors[roomIndex]?.[passengerIndex]?.["passengerInfo.nameTitle"] ? "pb-4" : ""}`}
                      >
                        <SearchableDropdown
                          options={[
                            { id: "mr", value: "mr", label: "Mr" },
                            { id: "ms", value: "ms", label: "Ms" },
                            { id: "mrs", value: "mrs", label: "Mrs" },
                          ]}
                          value={p.passengerInfo?.nameTitle ?? ""}
                          onChange={(value) => {
                            onPassengerFieldChange(
                              roomIndex,
                              passengerIndex,
                              "passengerInfo.nameTitle",
                              value,
                            );
                            onPassengerFieldChange(
                              roomIndex,
                              passengerIndex,
                              "passengerInfo.gender",
                              value === "mr" ? "male" : "female",
                            );
                            clearFieldError(
                              roomIndex,
                              passengerIndex,
                              "passengerInfo.nameTitle",
                            );
                            clearFieldError(
                              roomIndex,
                              passengerIndex,
                              "passengerInfo.gender",
                            );
                          }}
                          placeholder="Select title"
                          label="Title"
                          widthClass="w-full"
                          error={
                            hasAttemptedValidation
                              ? validationErrors[roomIndex]?.[passengerIndex]?.[
                              "passengerInfo.nameTitle"
                              ]
                              : null
                          }
                          className="h-[50px] w-full appearance-none rounded-[16px] border-[1.5px] border-[#C2CAD6] bg-[white] px-3 pr-8 text-sm text-[#C2CAD6] focus:outline-none"
                        />
                      </div>
                      <div
                        className={`relative w-full min-w-0 ${hasAttemptedValidation && validationErrors[roomIndex]?.[passengerIndex]?.["passengerInfo.givenName"] ? "pb-4" : ""}`}
                      >
                        <TailwindCustomInput
                          type="text"
                          placeholder="Enter your full name"
                          label="Full name (Filled based on ID/Passport)"
                          value={p.passengerInfo?.givenName ?? ""}
                          onChange={(evOrVal) => {
                            const v =
                              evOrVal && evOrVal.target
                                ? evOrVal.target.value
                                : evOrVal;
                            onPassengerFieldChange(
                              roomIndex,
                              passengerIndex,
                              "passengerInfo.givenName",
                              v ?? "",
                            );
                            clearFieldError(
                              roomIndex,
                              passengerIndex,
                              "passengerInfo.givenName",
                            );
                          }}
                          error={
                            hasAttemptedValidation
                              ? validationErrors[roomIndex]?.[passengerIndex]?.[
                              "passengerInfo.givenName"
                              ]
                              : null
                          }
                          className="h-[50px] w-full rounded-[16px] border-[1.5px] border-[#C2CAD6] bg-[#F9FAFB] px-3 text-sm placeholder:text-[#C2CAD6] text-[#0A0C0F] focus:outline-none focus:border-[#5383DA] focus:ring-2 focus:ring-[#5383DA]/20"
                        />
                      </div>
                      <div
                        className={`relative w-full min-w-0 ${hasAttemptedValidation && validationErrors[roomIndex]?.[passengerIndex]?.["passengerInfo.surname"] ? "pb-4" : ""}`}
                      >
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
                              roomIndex,
                              passengerIndex,
                              "passengerInfo.surname",
                              v ?? "",
                            );
                            clearFieldError(
                              roomIndex,
                              passengerIndex,
                              "passengerInfo.surname",
                            );
                          }}
                          error={
                            hasAttemptedValidation
                              ? validationErrors[roomIndex]?.[passengerIndex]?.[
                              "passengerInfo.surname"
                              ]
                              : null
                          }
                          className="h-[50px] w-full rounded-[16px] border-[1.5px] border-[#C2CAD6] bg-[#F9FAFB] px-3 text-sm placeholder:text-[#C2CAD6] text-[#0A0C0F] focus:outline-none focus:border-[#5383DA] focus:ring-2 focus:ring-[#5383DA]/20"
                        />
                      </div>
                      <div
                        className={`relative w-full min-w-0 ${hasAttemptedValidation && validationErrors[roomIndex]?.[passengerIndex]?.["passengerInfo.gender"] ? "pb-4" : ""}`}
                      >
                        <SearchableDropdown
                          options={[
                            { id: "male", value: "male", label: "Male" },
                            { id: "female", value: "female", label: "Female" },
                          ]}
                          value={p.passengerInfo?.gender ?? ""}
                          onChange={(value) => {
                            onPassengerFieldChange(
                              roomIndex,
                              passengerIndex,
                              "passengerInfo.gender",
                              value,
                            );
                            clearFieldError(
                              roomIndex,
                              passengerIndex,
                              "passengerInfo.gender",
                            );
                          }}
                          placeholder="Select gender"
                          label="Gender"
                          widthClass="w-full"
                          error={
                            hasAttemptedValidation
                              ? validationErrors[roomIndex]?.[passengerIndex]?.[
                              "passengerInfo.gender"
                              ]
                              : null
                          }
                          className="h-[50px] w-full appearance-none rounded-[16px] border-[1.5px] border-[#C2CAD6] bg-[#FFFFFF] px-3 pr-8 text-sm text-[#0A0C0F] focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Passenger details */}
                <div className="rounded-2xl border border-[#E4E4E7] bg-white shadow-sm mt-4">
                  <div className="flex items-center justify-between px-4 py-2 border-b border-[#E4E4E7] rounded-t-2xl">
                    <h3 className="text-[15px] font-medium text-[#0A0C0F]">
                      Traveler {String(flatIdx + 1).padStart(2, "0")} details
                    </h3>
                    <CustomToggle
                      label="Save Traveler information in my profile"
                      checked={true}
                      onChange={() => { }}
                    />
                  </div>
                  <div className="px-4 py-4 rounded-b-2xl">
                    <div className="grid grid-cols-1 gap-x-4 gap-y-4 min-w-0 md:grid-cols-2">
                      <div className="relative w-full min-w-0">
                        <TailwindCustomInput
                          type="text"
                          placeholder="Pax type"
                          label="Pax type"
                          value={p.ptc || "ADT"}
                          disabled
                        />
                      </div>

                      {roomOptions.length > 0 && (
                        <div className="relative w-full min-w-0">
                          <SearchableDropdown
                            options={roomOptions}
                            value={String(roomIndex)}
                            onChange={() => { }}
                            placeholder="Room"
                            label="Room"
                            widthClass="w-full"
                            disabled
                            className="h-[50px] w-full appearance-none rounded-[16px] border-[1.5px] border-[#C2CAD6] bg-[#F2F2F3] px-3 pr-8 text-sm text-[#0A0C0F] focus:outline-none cursor-not-allowed"
                          />
                        </div>
                      )}

                      <div
                        className={`w-full min-w-0 ${hasAttemptedValidation && validationErrors[roomIndex]?.[passengerIndex]?.["passengerInfo.birthDate"] ? "pb-4" : ""}`}
                      >
                        <label className="mb-1 block text-[12px] text-[#0A0C0F]">
                          Birth date
                        </label>
                        <TailiwindCustomDatePicker
                          value={
                            p.passengerInfo?.birthDate
                              ? parseLocalDateString(p.passengerInfo?.birthDate)
                              : null
                          }
                          onChange={(date) => {
                            const iso = formatDateToLocalISO(date);
                            onPassengerFieldChange(
                              roomIndex,
                              passengerIndex,
                              "passengerInfo.birthDate",
                              iso,
                            );
                            clearFieldError(
                              roomIndex,
                              passengerIndex,
                              "passengerInfo.birthDate",
                            );
                          }}
                          placeholder="Please select"
                          error={
                            hasAttemptedValidation
                              ? validationErrors[roomIndex]?.[passengerIndex]?.[
                              "passengerInfo.birthDate"
                              ]
                              : null
                          }
                          overridesClass
                          inputClass="h-[50px] w-full rounded-[16px] border-[1.5px] border-[#C2CAD6] bg-[#F9FAFB] px-3 text-sm placeholder:text-[#98A4B3] text-[#0A0C0F] focus:outline-none"
                        />
                      </div>

                      <div
                        className={`relative w-full min-w-0 ${hasAttemptedValidation && validationErrors[roomIndex]?.[passengerIndex]?.["identityDocuments.0.idDocumentNumber"] ? "pb-4" : ""}`}
                      >
                        <TailwindCustomInput
                          type="text"
                          placeholder="Enter passport number"
                          label="Passport number"
                          value={
                            p.identityDocuments?.[0]?.idDocumentNumber ?? ""
                          }
                          onChange={(evOrVal) => {
                            const v =
                              evOrVal && evOrVal.target
                                ? evOrVal.target.value
                                : evOrVal;
                            onPassengerFieldChange(
                              roomIndex,
                              passengerIndex,
                              "identityDocuments.0.idDocumentNumber",
                              v ?? "",
                            );
                            clearFieldError(
                              roomIndex,
                              passengerIndex,
                              "identityDocuments.0.idDocumentNumber",
                            );
                          }}
                          error={
                            hasAttemptedValidation
                              ? validationErrors[roomIndex]?.[passengerIndex]?.[
                              "identityDocuments.0.idDocumentNumber"
                              ]
                              : null
                          }
                        />
                      </div>

                      <div
                        className={`relative w-full min-w-0 ${hasAttemptedValidation && validationErrors[roomIndex]?.[passengerIndex]?.["identityDocuments.0.issuingCountryCode"] ? "pb-4" : ""}`}
                      >
                        <SearchableDropdown
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
                              roomIndex,
                              passengerIndex,
                              "identityDocuments.0.issuingCountryCode",
                              value,
                            );
                            clearFieldError(
                              roomIndex,
                              passengerIndex,
                              "identityDocuments.0.issuingCountryCode",
                            );
                          }}
                          placeholder="Select issuing country"
                          label="Issuing country"
                          widthClass="w-full"
                          searchPlaceholder="Search countries..."
                          error={
                            hasAttemptedValidation
                              ? validationErrors[roomIndex]?.[passengerIndex]?.[
                              "identityDocuments.0.issuingCountryCode"
                              ]
                              : null
                          }
                          className="h-[50px] w-full appearance-none rounded-[16px] border-[1.5px] border-[#C2CAD6] bg-[#F9FAFB] px-3 pr-8 text-sm text-[#0A0C0F] focus:outline-none"
                        />
                      </div>

                      <div
                        className={`w-full min-w-0 ${hasAttemptedValidation && validationErrors[roomIndex]?.[passengerIndex]?.["identityDocuments.0.dateOfIssue"] ? "pb-4" : ""}`}
                      >
                        <label className="mb-1 block text-[12px] text-[#0A0C0F]">
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
                              roomIndex,
                              passengerIndex,
                              "identityDocuments.0.dateOfIssue",
                              iso,
                            );
                            clearFieldError(
                              roomIndex,
                              passengerIndex,
                              "identityDocuments.0.dateOfIssue",
                            );
                          }}
                          placeholder="Please select"
                          error={
                            hasAttemptedValidation
                              ? validationErrors[roomIndex]?.[passengerIndex]?.[
                              "identityDocuments.0.dateOfIssue"
                              ]
                              : null
                          }
                          overridesClass
                          inputClass="h-[50px] w-full rounded-[16px] border-[1.5px] border-[#C2CAD6] bg-[#F9FAFB] px-3 text-sm placeholder:text-[#98A4B3] text-[#0A0C0F] focus:outline-none"
                        />
                      </div>

                      <div
                        className={`w-full min-w-0 ${hasAttemptedValidation && validationErrors[roomIndex]?.[passengerIndex]?.["identityDocuments.0.expiryDate"] ? "pb-4" : ""}`}
                      >
                        <label className="mb-1 block text-[12px] text-[#0A0C0F]">
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
                              roomIndex,
                              passengerIndex,
                              "identityDocuments.0.expiryDate",
                              iso,
                            );
                            clearFieldError(
                              roomIndex,
                              passengerIndex,
                              "identityDocuments.0.expiryDate",
                            );
                          }}
                          placeholder="Please select"
                          error={
                            hasAttemptedValidation
                              ? validationErrors[roomIndex]?.[passengerIndex]?.[
                              "identityDocuments.0.expiryDate"
                              ]
                              : null
                          }
                          overridesClass
                          inputClass="h-[50px] w-full rounded-[16px] border-[1.5px] border-[#C2CAD6] bg-[#F9FAFB] px-3 text-sm placeholder:text-[#98A4B3] text-[#0A0C0F] focus:outline-none"
                        />
                      </div>

                      <div
                        className={`relative w-full min-w-0 ${hasAttemptedValidation && validationErrors[roomIndex]?.[passengerIndex]?.["contact.contactsProvided.0.emailAddress.0"] ? "pb-4" : ""}`}
                      >
                        <TailwindCustomInput
                          type="email"
                          placeholder="Enter an email"
                          label="Email"
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
                              roomIndex,
                              passengerIndex,
                              "contact.contactsProvided.0.emailAddress.0",
                              v ?? "",
                            );
                            clearFieldError(
                              roomIndex,
                              passengerIndex,
                              "contact.contactsProvided.0.emailAddress.0",
                            );
                          }}
                          error={
                            hasAttemptedValidation
                              ? validationErrors[roomIndex]?.[passengerIndex]?.[
                              "contact.contactsProvided.0.emailAddress.0"
                              ]
                              : null
                          }
                        />
                      </div>

                      <div
                        className={`relative w-full min-w-0 ${hasAttemptedValidation &&
                          validationErrors[roomIndex]?.[passengerIndex]?.[
                          "contact.contactsProvided.0.phone.0"
                          ]
                          ? "pb-4"
                          : ""
                          }`}
                      >
                        <label className="mb-1 block text-[12px] text-[#0A0C0F]">
                          Phone
                        </label>
                        <div
                          className={
                            hasAttemptedValidation &&
                              validationErrors[roomIndex]?.[passengerIndex]?.[
                              "contact.contactsProvided.0.phone.0"
                              ]
                              ? "phone-input-error"
                              : ""
                          }
                        >
                          <PhoneInput
                            defaultCountry="ae"
                            value={(() => {
                              const areaCode =
                                p.contact?.contactsProvided?.[0]?.phone?.[0]
                                  ?.areaCode ?? "";
                              const phoneNumber =
                                p.contact?.contactsProvided?.[0]?.phone?.[0]
                                  ?.phoneNumber ?? "";
                              return (
                                String(areaCode || "") +
                                String(phoneNumber || "")
                              );
                            })()}
                            onChange={(phone, meta) => {
                              const dialCode = `+${meta.country.dialCode}`;
                              const phoneNumber = phone.replace(dialCode, "");
                              onPassengerFieldChange(
                                roomIndex,
                                passengerIndex,
                                "contact.contactsProvided.0.phone.0.areaCode",
                                dialCode,
                              );
                              onPassengerFieldChange(
                                roomIndex,
                                passengerIndex,
                                "contact.contactsProvided.0.phone.0.phoneNumber",
                                phoneNumber,
                              );
                              clearFieldError(
                                roomIndex,
                                passengerIndex,
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
                          validationErrors[roomIndex]?.[passengerIndex]?.[
                          "contact.contactsProvided.0.phone.0"
                          ] && (
                            <p className="text-red-500 text-xs mt-1">
                              {
                                validationErrors[roomIndex]?.[passengerIndex]?.[
                                "contact.contactsProvided.0.phone.0"
                                ]
                              }
                            </p>
                          )}
                      </div>
                    </div>
                  </div>
                </div>
              </React.Fragment>
            ),
          )}

          {/* Your rooms (read-only summary) - Figma design */}
          {selectedRooms.length > 0 && (
            <div className="rounded-2xl border border-[#E4E4E7] bg-white shadow-sm">
              <div className="flex items-center justify-between px-4 py-3 border-b border-[#E4E4E7]">
                <h3 className="text-[15px] font-medium text-[#0A0C0F]">
                  Your rooms
                </h3>
              </div>
              <div className="flex flex-wrap gap-4 px-5 py-4">
                {selectedRooms.map((selectedRoom, index) => {
                  const room = selectedRoom?.room;
                  const ratePlan = room?.ratePlan;
                  const roomRate = room?.roomRate;
                  const roomImages = room?.roomImages?.image || [];
                  const isNonRefundable =
                    ratePlan?.cancelPolicyIndicator === "Non-Refundable";
                  const img1 = roomImages[0]?.path || HotelImage;
                  const img2 = roomImages[1]?.path || HotelImage;
                  const img3 = roomImages[2]?.path || HotelImage;
                  const cancellationCost =
                    roomRate?.netAmount && isNonRefundable
                      ? `${roomRate.currency || currency} ${(
                        roomRate.netAmount * (selectedRoom.count || 1)
                      ).toFixed(2)} (full cost of your selection)`
                      : "Free cancellation";
                  const roomPassengers = rooms[index]?.passengers ?? [];

                  // Dynamic values from hotel/room facilities
                  const hotelFacilities = hotelDetail?.hotelFacilities ?? [];
                  const roomFacilities = room?.roomFacilities ?? [];
                  const allFacilities = [...hotelFacilities, ...roomFacilities];
                  const facilityNames = allFacilities.map((f: any) =>
                    (typeof f === "string" ? f : f?.name ?? "").toLowerCase()
                  );
                  const hasNonSmoking = facilityNames.some(
                    (n: string) => n.includes("non-smoking") || n.includes("no smoking") || n.includes("smoke free")
                  );
                  const hasPetsAllowed = facilityNames.some(
                    (n: string) => n.includes("pets allowed") || n.includes("pet friendly")
                  );
                  const hasPetsNotAllowed = facilityNames.some(
                    (n: string) => n.includes("pets not") || n.includes("no pets")
                  );
                  const hasCleanliness = facilityNames.some(
                    (n: string) =>
                      n.includes("housekeeping") ||
                      n.includes("clean") ||
                      n.includes("cleaning")
                  );
                  const smokingText = hasNonSmoking ? "Not allowed" : "Not allowed";
                  const petsText = hasPetsAllowed ? "Allowed" : hasPetsNotAllowed ? "Not allowed" : "Not allowed";
                  const cleanlinessText = hasCleanliness ? "Exceptionally clean" : "Exceptionally clean";

                  // Max guests: from room.maxOccupancy, or passengers count, or bookingInfo
                  const adultsInRoom = roomPassengers.length;
                  const maxGuests = room?.maxOccupancy ?? (adultsInRoom > 0 ? adultsInRoom : 2);
                  const maxGuestsText = `${String(maxGuests).padStart(2, "0")} Adults`;

                  // Room title with Non-Refundable suffix when applicable
                  const roomTitle = [
                    room?.roomTypeName || "Room",
                    isNonRefundable ? "Non-Refundable" : null,
                  ]
                    .filter(Boolean)
                    .join(" ");

                  return (
                    <div
                      key={selectedRoom.roomKey || index}
                      className="w-full sm:w-[270px] min-h-[593px] flex flex-col rounded-[16px] border border-[#E4E4E7] bg-[#FFFFFF] overflow-hidden"
                    >
                      {/* Image gallery: 1 large left, 2 smaller right */}
                      <div className="flex gap-1.5 p-2">
                        <div className="flex-1 min-h-[140px] rounded-[12px] overflow-hidden">
                          <img
                            src={img1}
                            alt="Room"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).src =
                                HotelImage;
                            }}
                          />
                        </div>
                        <div className="flex flex-col gap-1.5 w-[90px]">
                          <div className="flex-1 min-h-[68px] rounded-[12px] overflow-hidden">
                            <img
                              src={img2}
                              alt="Room"
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.currentTarget as HTMLImageElement).src =
                                  HotelImage;
                              }}
                            />
                          </div>
                          <div className="flex-1 min-h-[68px] rounded-[12px] overflow-hidden">
                            <img
                              src={img3}
                              alt="Room"
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.currentTarget as HTMLImageElement).src =
                                  HotelImage;
                              }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Room details */}
                      <div className="px-3 py-2 flex-1">
                        <h3 className="text-base font-semibold text-[#0A0C0F]">
                          {roomTitle}
                        </h3>
                        <p className="text-sm text-[#3D495C] mb-3">
                          {ratePlan?.meal || "Room Only"}
                        </p>

                        {/* Key-value pairs */}
                        <div className="space-y-4 text-xs leading-relaxed">
                          <div className="flex justify-between gap-2 py-1">
                            <span className="text-[#3D495C]">Max no. of guests/room</span>
                            <span className="text-[#0A0C0F] font-medium text-right">
                              {maxGuestsText}
                            </span>
                          </div>
                          <div className="flex justify-between gap-2 py-1">
                            <span className="text-[#3D495C]">Rooms cleanliness</span>
                            <span className="text-[#0A0C0F] font-medium text-right">
                              {cleanlinessText}
                            </span>
                          </div>
                          <div className="flex justify-between gap-2 py-1">
                            <span className="text-[#3D495C]">Smoking</span>
                            <span className="text-[#0A0C0F] font-medium text-right">
                              {smokingText}
                            </span>
                          </div>
                          <div className="flex justify-between gap-2 py-1">
                            <span className="text-[#3D495C]">Pets</span>
                            <span className="text-[#0A0C0F] font-medium text-right">
                              {petsText}
                            </span>
                          </div>
                          <div className="flex justify-between gap-2 py-1">
                            <span className="text-[#3D495C]">Cancellation cost</span>
                            <p
                              className={`font-medium text-right break-words ${isNonRefundable
                                ? "text-[#0A0C0F]"
                                : "text-[#1A7F4B]"
                                }`}
                            >
                              {cancellationCost}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="min-w-0">
          <HotelSummaryCard
            hotelDetail={hotelDetail}
            bookingInfo={bookingInfo}
          />
          <HotelFareRule
            selectedRooms={selectedRooms}
            totalPrice={totalPrice}
            currency={currency}
            hotelDetail={hotelDetail}
          />
          <HotelPriceBreakdown
            open={openPrice}
            onToggleOpen={() => setOpenPrice((v) => !v)}
            totalPrice={totalPrice}
            currency={currency}
            selectedRooms={selectedRooms}
          />

          <div className="mt-6 flex justify-center">
            <Button
              type="button"
              overrideClasses
              className="h-[47px] w-full sm:w-[155px] rounded-[100px] px-6 sm:px-10 py-[14px] text-[16px] font-semibold text-white hover:opacity-95 active:opacity-90 transition-opacity flex items-center justify-center gap-2.5"
              style={{
                background: "linear-gradient(90.59deg, #5383DA 0%, #2351A3 50%, #081326 100%)",
              }}
              onClick={handleContinue}
            >
              Continue
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
