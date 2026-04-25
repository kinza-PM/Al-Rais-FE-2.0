import React, { useMemo, useRef, useState } from "react";
import TailwindCustomInput from "../common/TailwindCustomInput";
import SearchableDropdown from "../common/SearchableDropdown";
import Button from "../atoms/Button";
import HotelImage from "../../../src/assets/images/Hotel Image.png";
import HotelSummaryCard from "../atoms/HotelSummaryCard";
import HotelPriceBreakdown from "../atoms/HotelPriceBreakdown";
import HotelFareRule from "../atoms/HotelFareRule";
import TailiwindCustomDatePicker from "../common/TailiwindCustomDatePicker";
import SavedTravelersSection, {
  type SavedTraveler,
} from "./SavedTravelersSection";
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
import { usePassengerCacheAdd, usePassengerCacheFetch } from "../../hooks/usePassengerCache";
import {
  buildPassengerCacheAddPayload,
  extractPassengersFromCacheResponse,
} from "../../utils/passengerCacheHelper";
import {
  collectHotelGalleryUrls,
  resolveHotelImageUrl,
} from "../../utils/hotelImages";
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
  onPassengerCacheSavingChange?: (saving: boolean) => void;
  onPassengerCacheFetchLoadingChange?: (loading: boolean) => void;
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
  onPassengerCacheSavingChange,
  onPassengerCacheFetchLoadingChange,
  countries = [],
  hotelDetail = {},
  bookingInfo = {},
  selectedRooms = [],
  totalPrice = 0,
  currency = "AED",
  childAgesPerRoom,
  checkInDate,
}: HotelBookingBookSectionProps) {
  const getHotelTitleOptions = (ptc?: string) => {
    const type = String(ptc ?? "")
      .trim()
      .toUpperCase();
    if (type === "CHD" || type === "INF") {
      return [
        { id: "master", value: "master", label: "Master" },
        { id: "miss", value: "miss", label: "Miss" },
      ];
    }
    return [
      { id: "mr", value: "mr", label: "Mr" },
      { id: "ms", value: "ms", label: "Ms" },
      { id: "mrs", value: "mrs", label: "Mrs" },
    ];
  };

  const genderFromHotelTitle = (title?: string) => {
    const t = String(title ?? "")
      .trim()
      .toLowerCase();
    if (t === "mr" || t === "master") return "male";
    return "female";
  };

  const [validationErrors, setValidationErrors] =
    useState<HotelPassengerFieldErrors>({});
  const [hasAttemptedValidation, setHasAttemptedValidation] = useState(false);
  const [openPrice, setOpenPrice] = useState(false);
  const [saveTravelerByPassengerKey, setSaveTravelerByPassengerKey] = useState<
    Record<string, boolean>
  >({});
  const originalCacheKeyBySlotRef = useRef<Record<number, string>>({});
  /** Keys forced OFF by saved-traveler selection only — clear when that selection is removed to restore default ON. */
  const savedTravelerOffKeysRef = useRef<Set<string>>(new Set());

  const { mutateAsync: addPassengerCache } = usePassengerCacheAdd();
  const { data: passengerCacheResp } = usePassengerCacheFetch();

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

  const fillFromSavedTravelers = (selectedSlots: Array<SavedTraveler | undefined>) => {
    const titleToUi = (ptc?: string, t?: string, g?: string) => {
      const type = String(ptc ?? "")
        .trim()
        .toUpperCase();
      const v = String(t ?? "").trim().toUpperCase();
      const gender = String(g ?? "").trim().toUpperCase();
      if (type === "CHD" || type === "INF") {
        if (v === "MSTR" || v === "MASTER" || v === "MR") return "master";
        if (v === "MISS" || v === "MS" || v === "MRS") return "miss";
        if (gender === "M" || gender === "MALE") return "master";
        if (gender === "F" || gender === "FEMALE") return "miss";
        return "";
      }
      if (v === "MR") return "mr";
      if (v === "MS") return "ms";
      if (v === "MRS") return "mrs";
      if (v === "MSTR" || v === "MASTER") return "mr";
      if (v === "MISS") return "ms";
      return "";
    };
    const normalizeIdType = (v?: string) => {
      const x = String(v ?? "").trim().toUpperCase();
      if (x === "PT" || x === "PASSPORT") return "PASSPORT";
      if (x === "NI" || x === "NATIONAL_ID") return "NATIONAL_ID";
      if (x === "DL" || x === "DRIVING_LICENSE") return "DRIVING_LICENSE";
      return "PASSPORT";
    };
    const genderToUi = (g?: string) => {
      const v = String(g ?? "").trim().toUpperCase();
      if (v === "M" || v === "MALE") return "male";
      if (v === "F" || v === "FEMALE") return "female";
      return "";
    };

    const apply = (idx: number, t?: SavedTraveler) => {
      const target = flatPassengers[idx];
      if (!target) return;
      const { roomIndex, passengerIndex } = target;

      const clear = !t;
      const givenName = clear ? "" : t.firstName ?? "";
      const surname = clear ? "" : t.lastName ?? "";
      const nameTitle = clear
        ? ""
        : titleToUi(target.passenger?.ptc, t.nameTitle, t.gender);
      const gender = clear ? "" : genderToUi(t.gender);
      const birthDate = clear ? null : (t.birthDate ?? null);
      const passport = clear ? "" : (t.passport ?? "");
      const idType = clear ? "PASSPORT" : normalizeIdType(t.idType);
      const issuingCountryCode = clear ? "" : (t.issuingCountryCode ?? "");
      const residenceCountryCode = clear ? "" : (t.residenceCountryCode ?? "");
      const dateOfIssue = clear ? null : (t.dateOfIssueIso ?? null);
      const expiryIso = clear ? null : (t.expiryIso ?? null);
      const email = clear ? "" : (t.email ?? "");
      const areaCode = clear
        ? ""
        : t.phoneAreaCode !== undefined && t.phoneAreaCode !== null && String(t.phoneAreaCode).trim() !== ""
          ? `+${String(t.phoneAreaCode).replace(/^\+/, "")}`
          : "";
      const phoneNumber = clear ? "" : String(t.phoneNumber ?? "");

      onPassengerFieldChange(roomIndex, passengerIndex, "passengerInfo.nameTitle", nameTitle);
      onPassengerFieldChange(roomIndex, passengerIndex, "passengerInfo.gender", gender);
      onPassengerFieldChange(roomIndex, passengerIndex, "passengerInfo.givenName", givenName);
      onPassengerFieldChange(roomIndex, passengerIndex, "passengerInfo.surname", surname);
      onPassengerFieldChange(roomIndex, passengerIndex, "passengerInfo.birthDate", birthDate);

      onPassengerFieldChange(roomIndex, passengerIndex, "identityDocuments.0.idDocumentNumber", passport);
      onPassengerFieldChange(roomIndex, passengerIndex, "identityDocuments.0.idType", idType);
      onPassengerFieldChange(roomIndex, passengerIndex, "identityDocuments.0.issuingCountryCode", issuingCountryCode);
      onPassengerFieldChange(
        roomIndex,
        passengerIndex,
        "identityDocuments.0.residenceCountryCode",
        residenceCountryCode,
      );
      onPassengerFieldChange(roomIndex, passengerIndex, "identityDocuments.0.dateOfIssue", dateOfIssue);
      onPassengerFieldChange(roomIndex, passengerIndex, "identityDocuments.0.expiryDate", expiryIso);

      onPassengerFieldChange(roomIndex, passengerIndex, "contact.contactsProvided.0.emailAddress.0", email);
      onPassengerFieldChange(roomIndex, passengerIndex, "contact.contactsProvided.0.phone.0.areaCode", areaCode);
      onPassengerFieldChange(roomIndex, passengerIndex, "contact.contactsProvided.0.phone.0.phoneNumber", phoneNumber);
      // Lead guest is always the first passenger in each room (matches buildInitialHotelBookingPayload).
      onPassengerFieldChange(roomIndex, passengerIndex, "isLead", passengerIndex === 0);
    };

    // Fill/clear sequentially based on current passenger slots.
    for (let i = 0; i < flatPassengers.length; i++) {
      apply(i, selectedSlots[i]);
    }

    // Default save toggle is ON; saved-traveler fill sets OFF. Deselecting saved traveler restores default ON.
    setSaveTravelerByPassengerKey((prev) => {
      const next = { ...prev };
      const currentOffFromSaved = new Set<string>();
      for (let i = 0; i < flatPassengers.length; i++) {
        const fp = flatPassengers[i];
        const key = `${fp.roomIndex}:${fp.passengerIndex}:${fp.passenger?.passengerKey ?? ""}`;
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

    for (let i = 0; i < flatPassengers.length; i++) {
      const t = selectedSlots[i];
      if (t) {
        const given = String(t.firstName ?? "").trim().toUpperCase();
        const surname = String(t.lastName ?? "").trim().toUpperCase();
        const dob = String(t.birthDate ?? "").trim();
        const passport = String(t.passport ?? "").trim().toUpperCase();
        originalCacheKeyBySlotRef.current[i] = `${passport}|${given}|${surname}|${dob}`;
      } else {
        delete originalCacheKeyBySlotRef.current[i];
      }
    }
  };

  const saveToggleKey = (
    roomIndex: number,
    passengerIndex: number,
    passengerKey: string | undefined,
  ) => `${roomIndex}:${passengerIndex}:${passengerKey ?? ""}`;

  const saveToggleChecked = (key: string) => {
    const v = saveTravelerByPassengerKey[key];
    // default ON (unless explicitly set to false)
    return v !== false;
  };

  const toggleSaveTraveler = (key: string) => {
    setSaveTravelerByPassengerKey((prev) => ({
      ...prev,
      [key]: !saveToggleChecked(key),
    }));
  };

  const addPassengerCachePayload = useMemo(() => {
    const selectedPassengers = flatPassengers
      .filter(({ roomIndex, passengerIndex, passenger }) =>
        saveToggleChecked(saveToggleKey(roomIndex, passengerIndex, passenger?.passengerKey)),
      )
      .map(({ passenger }) => passenger);

    if (selectedPassengers.length === 0) return null;

    const originalCacheKeys = flatPassengers.map((_, i) =>
      saveToggleChecked(saveToggleKey(flatPassengers[i].roomIndex, flatPassengers[i].passengerIndex, flatPassengers[i].passenger?.passengerKey))
        ? (originalCacheKeyBySlotRef.current[i] ?? null)
        : null
    );

    const existingSavedPassengers = extractPassengersFromCacheResponse(passengerCacheResp);
    return buildPassengerCacheAddPayload(selectedPassengers, existingSavedPassengers, originalCacheKeys);
  }, [flatPassengers, saveTravelerByPassengerKey, passengerCacheResp]);

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

    if (addPassengerCachePayload) {
      try {
        onPassengerCacheSavingChange?.(true);
        await addPassengerCache(addPassengerCachePayload);
      } catch (e) {
        // Don't block the booking flow if cache save fails
        console.error("fetchAddPassengerCache(add) failed", e);
      } finally {
        onPassengerCacheSavingChange?.(false);
      }
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
          <SavedTravelersSection
            onProceedSelection={fillFromSavedTravelers}
            maxSelectable={flatPassengers.length}
            onInitialFetchLoadingChange={onPassengerCacheFetchLoadingChange}
          />
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
                          options={getHotelTitleOptions(p.ptc)}
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
                              genderFromHotelTitle(value),
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
                          maxLength={80}
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
                      checked={saveToggleChecked(
                        saveToggleKey(roomIndex, passengerIndex, p.passengerKey),
                      )}
                      onChange={() =>
                        toggleSaveTraveler(
                          saveToggleKey(
                            roomIndex,
                            passengerIndex,
                            p.passengerKey,
                          ),
                        )
                      }
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
                  const roomUrls = roomImages
                    .map((img: unknown) => resolveHotelImageUrl(img))
                    .filter(Boolean) as string[];
                  const hotelUrls = collectHotelGalleryUrls(hotelDetail, 8);
                  const merged: string[] = [...roomUrls];
                  for (const u of hotelUrls) {
                    if (merged.length >= 3) break;
                    if (!merged.includes(u)) merged.push(u);
                  }
                  const img1 = merged[0] || HotelImage;
                  const img2 = merged[1] || merged[0] || HotelImage;
                  const img3 = merged[2] || merged[1] || merged[0] || HotelImage;
                  const isNonRefundable =
                    ratePlan?.cancelPolicyIndicator === "Non-Refundable";
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
                    (typeof f === "string" ? f : (f?.name ?? "")).toLowerCase(),
                  );
                  const hasNonSmoking = facilityNames.some(
                    (n: string) =>
                      n.includes("non-smoking") ||
                      n.includes("no smoking") ||
                      n.includes("smoke free"),
                  );
                  const hasPetsAllowed = facilityNames.some(
                    (n: string) =>
                      n.includes("pets allowed") || n.includes("pet friendly"),
                  );
                  const hasPetsNotAllowed = facilityNames.some(
                    (n: string) =>
                      n.includes("pets not") || n.includes("no pets"),
                  );
                  const hasCleanliness = facilityNames.some(
                    (n: string) =>
                      n.includes("housekeeping") ||
                      n.includes("clean") ||
                      n.includes("cleaning"),
                  );
                  const smokingText = hasNonSmoking
                    ? "Not allowed"
                    : "Not allowed";
                  const petsText = hasPetsAllowed
                    ? "Allowed"
                    : hasPetsNotAllowed
                      ? "Not allowed"
                      : "Not allowed";
                  const cleanlinessText = hasCleanliness
                    ? "Exceptionally clean"
                    : "Exceptionally clean";

                  // Max guests: from room.maxOccupancy, or passengers count, or bookingInfo
                  const adultsInRoom = roomPassengers.length;
                  const maxGuests =
                    room?.maxOccupancy && room?.maxOccupancy > 0
                      ? room?.maxOccupancy
                      : adultsInRoom > 0
                        ? adultsInRoom
                        : 2;
                  const maxGuestsText = `${String(maxGuests).padStart(2, "0")} Adults`;
                  // console.log("room?.maxOccupancy", room?.maxOccupancy);
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
                        <div className="relative flex-1 min-h-[140px] rounded-[12px] overflow-hidden bg-[#F4F4F5]">
                          <img
                            src={img1}
                            alt="Room"
                            className="absolute inset-0 h-full w-full object-cover"
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).src =
                                HotelImage;
                            }}
                          />
                        </div>
                        <div className="flex w-[90px] shrink-0 flex-col gap-1.5">
                          <div className="relative min-h-[68px] flex-1 overflow-hidden rounded-[12px] bg-[#F4F4F5]">
                            <img
                              src={img2}
                              alt="Room"
                              className="absolute inset-0 h-full w-full object-cover"
                              onError={(e) => {
                                (e.currentTarget as HTMLImageElement).src =
                                  HotelImage;
                              }}
                            />
                          </div>
                          <div className="relative min-h-[68px] flex-1 overflow-hidden rounded-[12px] bg-[#F4F4F5]">
                            <img
                              src={img3}
                              alt="Room"
                              className="absolute inset-0 h-full w-full object-cover"
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
                            <span className="text-[#3D495C]">
                              Max no. of guests/room
                            </span>
                            <span className="text-[#0A0C0F] font-medium text-right">
                              {maxGuestsText}
                            </span>
                          </div>
                          <div className="flex justify-between gap-2 py-1">
                            <span className="text-[#3D495C]">
                              Rooms cleanliness
                            </span>
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
                            <span className="text-[#3D495C]">
                              Cancellation cost
                            </span>
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

        <div className="min-w-0 min-[1025px]:sticky min-[1025px]:top-24 min-[1025px]:z-[1] min-[1025px]:self-start">
          <div className="min-[1025px]:max-h-[calc(100vh-7rem)] min-[1025px]:overflow-y-auto min-[1025px]:overflow-x-hidden min-[1025px]:pr-1 [scrollbar-gutter:stable]">
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
                  background:
                    "linear-gradient(90.59deg, #5383DA 0%, #2351A3 50%, #081326 100%)",
                }}
                onClick={handleContinue}
              >
                Continue
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
