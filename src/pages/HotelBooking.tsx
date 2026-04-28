import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "../components";
import HotelBookingBookSection from "../components/molecules/HotelBookingBookSection";
import HotelBookingReviewSection from "../components/molecules/HotelBookingReviewSection";
import HotelBookingPaymentSection from "../components/molecules/HotelBookingPaymentSection";
import HotelBookingETicketSetion from "../components/molecules/HotelBookingETicketSetion";
import { useHotelStore } from "../store/UseHotelStore";
import { useAuth } from "../features/auth/hooks/useAuth";
import LoginModal from "../components/common/LoginModal";
import {
  extractErrorFromAxiosApiError,
  extractMessageFromApiResponseBody,
} from "../utils/apiErrorHanlder";
import toast from "react-hot-toast";
import { useHotelPreBooking } from "../hooks/useHotelBooking";
import Loader from "../components/atoms/Loader";
import {
  buildInitialHotelBookingPayload,
  type HotelBookingPayload,
} from "../utils/hotelBookingHelper";
import { useCountriesOptions } from "../hooks/masterListings/listing";
import * as RemoteUserService from "../services/api/remoteUserService";
import { AuthService } from "../features/auth/services/authService";

const HotelBooking = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { hotel: hotelFromStore } = useHotelStore();
  const state = (location.state || {}) as {
    hotelDetail?: any;
    searchKey?: string;
    bookingParams?: {
      checkIn?: string;
      checkOut?: string;
      paxData?: {
        adults?: number;
        children?: number;
        kids?: number;
        rooms?: number;
      };
    };
    selectedRooms?: any[];
    totalPrice?: number;
    currency?: string;
    hotelKey?: string;
  };
  const [preBookData, setPreBookData] = useState<any>(null);
  const [hotelBookingResponse, setHotelBookingResponse] = useState<any>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, _] = useState<string[]>(["Book", "Review", "Pay", "Receipt"]);
  const { data: countriesOptions } = useCountriesOptions();
  const progressPct =
    steps.length > 1 ? (currentStep / (steps.length - 1)) * 100 : 0;
  // console.log("state", state);
  const { mutateAsync, isPending } = useHotelPreBooking();
  const [isPassengerCacheSaving, setIsPassengerCacheSaving] = useState(false);
  const [isPassengerCacheFetching, setIsPassengerCacheFetching] = useState(false);
  const bookingParams = state.bookingParams ?? hotelFromStore ?? null;
  const { user } = useAuth(); // isAuthenticated already use ho raha hai, user bhi lo
  const hasPrefilledRef = useRef(false);
  const [resolvedUser, setResolvedUser] = useState(user);

  useEffect(() => {
    if (user) setResolvedUser(user);
  }, [user]);

  // const init = async () => {
  //   if (isAuthenticated) {
  //     try {
  //       const body = {
  //         hotelKey: state.hotelKey ?? "",
  //         searchKey: state.searchKey ?? "",
  //         rooms: (state.selectedRooms ?? []).flatMap((selectedRoom) =>
  //           Array.from({ length: selectedRoom.count }, () => ({
  //             roomIndex: selectedRoom.room?.roomIndex ?? 1,
  //             roomKey: selectedRoom.roomKey ?? "",
  //           })),
  //         ),
  //       };
  //       const response = await mutateAsync(body);
  //       if (
  //         response?.meta?.success &&
  //         response?.meta?.statusMessage === "SUCCESS"
  //       ) {
  //         setPreBookData(response);
  //         toast.success("Hotel pre-booking successful");
  //       } else {
  //         window.history.back();
  //       }
  //     } catch (error) {
  //       const err = extractErrorFromAxiosApiError(error);
  //       toast.error(err);
  //       window.history.back();
  //     }
  //   }
  // };

  // preBook checkIn/checkOut (used when available - may differ from search)
  const preBookCheckIn = preBookData?.data?.[0]?.hotel?.checkInDate;
  const preBookCheckOut = preBookData?.data?.[0]?.hotel?.checkOutDate;

  // Calculate total nights from preBook dates (preferred) or bookingParams
  const totalNights = useMemo(() => {
    const checkIn = preBookCheckIn || bookingParams?.checkIn;
    const checkOut = preBookCheckOut || bookingParams?.checkOut;
    if (!checkIn || !checkOut) return 1;
    try {
      const d1 = new Date(checkIn);
      const d2 = new Date(checkOut);
      const diffTime = Math.abs(d2.getTime() - d1.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays > 0 ? diffDays : 1;
    } catch {
      return 1;
    }
  }, [
    preBookCheckIn,
    preBookCheckOut,
    bookingParams?.checkIn,
    bookingParams?.checkOut,
  ]);

  const pax = bookingParams?.paxData;
  const selectedRooms = state.selectedRooms ?? [];
  // console.log(bookingParams);
  // Child ages distribution per room (same logic as hotel search convertPaxToRoom)
  const rawChildAges = (bookingParams as any)?.childAges ?? [];
  const childAgesPerRoom: number[][] = useMemo(() => {
    const totalChildren = (pax?.children ?? 0) + (pax?.kids ?? 0);
    if (!totalChildren) return [];

    const roomsCount =
      (Array.isArray(selectedRooms) && selectedRooms.length > 0
        ? selectedRooms.length
        : pax?.rooms) || 1;

    const agesFlat: number[] = rawChildAges
      .filter((age: any): age is number => age !== null && age !== undefined)
      .slice(0, totalChildren);

    const baseChildrenPerRoom = Math.floor(totalChildren / roomsCount);
    const extraChildren = totalChildren % roomsCount;

    const result: number[][] = [];
    let idx = 0;

    for (let i = 0; i < roomsCount; i++) {
      const childrenInRoom = Math.min(
        baseChildrenPerRoom + (i < extraChildren ? 1 : 0),
        2,
      );
      const roomAges: number[] = [];
      for (let j = 0; j < childrenInRoom; j++) {
        if (idx < agesFlat.length) {
          roomAges.push(agesFlat[idx]);
          idx += 1;
        }
      }
      result.push(roomAges);
    }

    return result;
  }, [pax, selectedRooms, rawChildAges]);

  // Prepare booking info (prefer preBook dates; fallback to bookingParams/state)
  const bookingInfo = useMemo(
    () => ({
      checkIn: preBookCheckIn || bookingParams?.checkIn || "",
      checkOut: preBookCheckOut || bookingParams?.checkOut || "",
      checkInTime: state.hotelDetail?.checkInTime || "",
      checkOutTime: state.hotelDetail?.checkOutTime || "",
      totalNights,
      rooms: pax?.rooms ?? 0,
      adults: pax?.adults ?? 0,
      children: (pax?.children ?? 0) + (pax?.kids ?? 0),
    }),
    [
      preBookCheckIn,
      preBookCheckOut,
      bookingParams,
      state.hotelDetail,
      totalNights,
      pax,
    ],
  );

  const hotelDetail = state.hotelDetail || {};
  const preBookHotel = preBookData?.data?.[0]?.hotel;
  const totalPrice = preBookHotel?.totalNet ?? state.totalPrice ?? 0;
  const currency = preBookHotel?.currency ?? state.currency ?? "AED";

  // Use preBook checkIn/checkOut (they may have changed); fallback to state
  const effectiveCheckIn =
    preBookHotel?.checkInDate ||
    bookingInfo.checkIn ||
    selectedRooms[0]?.room?.roomRate?.rates?.[0]?.from ||
    "";
  const effectiveCheckOut =
    preBookHotel?.checkOutDate ||
    bookingInfo.checkOut ||
    selectedRooms[0]?.room?.roomRate?.rates?.[0]?.to ||
    "";

  const [hotelBookingPayload, setHotelBookingPayload] =
    useState<HotelBookingPayload | null>(null);

  const effectiveHotelKey = preBookHotel?.hotelKey ?? state.hotelKey ?? "";

  useEffect(() => {
    if (
      selectedRooms.length > 0 &&
      state.searchKey &&
      effectiveHotelKey &&
      effectiveCheckIn &&
      effectiveCheckOut &&
      hotelBookingPayload === null
    ) {
      const payload = buildInitialHotelBookingPayload(
        preBookData,
        state.searchKey,
        effectiveHotelKey,
        totalPrice,
        currency,
        effectiveCheckIn,
        effectiveCheckOut,
        selectedRooms,
        pax,
        bookingInfo.checkInTime,
      );
      setHotelBookingPayload(payload);
    }
  }, [
    preBookData,
    selectedRooms,
    state.searchKey,
    effectiveHotelKey,
    totalPrice,
    currency,
    effectiveCheckIn,
    effectiveCheckOut,
    pax,
    bookingInfo.checkInTime,
  ]);

  useEffect(() => {
    const syncAuthUser = async () => {
      const currentUser = await AuthService.getCurrentUser();
      if (currentUser) setResolvedUser(currentUser);
    };

    const onAuthChanged = () => {
      void syncAuthUser();
    };

    window.addEventListener("alrais:auth-changed", onAuthChanged);
    return () => window.removeEventListener("alrais:auth-changed", onAuthChanged);
  }, []);

  useEffect(() => {
    if (!resolvedUser || hasPrefilledRef.current || !hotelBookingPayload) return;

    const fetchAndPrefill = async () => {
      try {
        const email = (resolvedUser.email || "").trim().toLowerCase();
        const phoneNumber = (resolvedUser.phone || "").trim();

        const userDetails =
          email || phoneNumber
            ? await RemoteUserService.getByIdentifier({
              email: email || undefined,
              phoneNumber: phoneNumber || undefined,
            })
            : null;

        if (userDetails) {
          prefillFirstPassengerFromUserDetail(userDetails);
        } else {
          prefillFirstPassengerFromAuthUser(resolvedUser);
        }
        hasPrefilledRef.current = true;
      } catch (error) {
        console.error("User detail fetch failed:", error);
        prefillFirstPassengerFromAuthUser(resolvedUser);
        hasPrefilledRef.current = true;
      }
    };

    fetchAndPrefill();
  }, [resolvedUser, hotelBookingPayload]);

  const setNested = (obj: any, path: string, value: any) => {
    const parts = path.split(".");
    let cur = obj;
    for (let i = 0; i < parts.length - 1; i++) {
      const key = parts[i];
      if (/^\d+$/.test(key)) {
        const idx = Number(key);
        if (!Array.isArray(cur)) cur = [];
        if (!cur[idx]) cur[idx] = {};
        cur = cur[idx];
      } else {
        if (!cur[key] || typeof cur[key] !== "object") cur[key] = {};
        cur = cur[key];
      }
    }
    const last = parts[parts.length - 1];
    if (/^\d+$/.test(last)) {
      cur[Number(last)] = value;
    } else {
      cur[last] = value;
    }
  };

  const prefillFirstPassengerFromUserDetail = (ud: any) => {
    if (!ud) return;

    const fullName = (ud.name || "").trim();
    const nameParts = fullName.split(" ").filter(Boolean);
    const surname = nameParts.length > 1 ? nameParts[nameParts.length - 1] : "";
    const givenName =
      nameParts.length > 1
        ? nameParts.slice(0, -1).join(" ")
        : nameParts[0] || "";

    const titleMap: Record<string, string> = { MR: "MR", MS: "MS", MRS: "MRS" };
    const nameTitle = titleMap[(ud.title || "").toUpperCase()] ?? "";

    const genderMap: Record<string, string> = {
      M: "male",
      F: "female",
      MALE: "male",
      FEMALE: "female",
    };
    const gender = (ud.gender && genderMap[(ud.gender || "").toUpperCase()]) ?? "";

    setHotelBookingPayload((prev) => {
      if (!prev) return prev;
      const next = JSON.parse(JSON.stringify(prev));
      if (!next.rooms?.[0]?.passengers?.[0]) return prev;

      next.rooms[0].passengers[0].passengerInfo = {
        ...next.rooms[0].passengers[0].passengerInfo,
        nameTitle,
        givenName,
        surname,
        gender,
      };

      return next;
    });
  };

  const prefillFirstPassengerFromAuthUser = (authUser: { name?: string }) => {
    const fullName = (authUser?.name || "").trim();
    if (!fullName) return;

    const nameParts = fullName.split(" ").filter(Boolean);
    const surname = nameParts.length > 1 ? nameParts[nameParts.length - 1] : "";
    const givenName =
      nameParts.length > 1 ? nameParts.slice(0, -1).join(" ") : nameParts[0] || "";

    setHotelBookingPayload((prev) => {
      if (!prev) return prev;
      const next = JSON.parse(JSON.stringify(prev));
      const passengerInfo = next.rooms?.[0]?.passengers?.[0]?.passengerInfo;
      if (!passengerInfo) return prev;

      passengerInfo.givenName = passengerInfo.givenName || givenName;
      passengerInfo.surname = passengerInfo.surname || surname;
      return next;
    });
  };

  const updatePassengerField = useCallback(
    (roomIndex: number, passengerIndex: number, path: string, value: any) => {
      setHotelBookingPayload((prev) => {
        if (!prev || !prev.rooms[roomIndex]?.passengers[passengerIndex])
          return prev;
        const next = JSON.parse(JSON.stringify(prev));
        setNested(
          next.rooms[roomIndex].passengers[passengerIndex],
          path,
          value,
        );
        return next;
      });
    },
    [],
  );

  const patchHotelBookingPayload = useCallback(
    (patch: Partial<HotelBookingPayload>) => {
      setHotelBookingPayload((prev) => (prev ? { ...prev, ...patch } : prev));
    },
    [],
  );

  const handleBookSectionContinue = useCallback(async () => {
    if (!hotelBookingPayload) return;
    try {
      const body = {
        hotelKey: state.hotelKey ?? "",
        searchKey: state.searchKey ?? "",
        rooms: (state.selectedRooms ?? []).flatMap((selectedRoom) =>
          Array.from({ length: selectedRoom.count }, () => ({
            roomIndex: selectedRoom.room?.roomIndex ?? 1,
            roomKey: selectedRoom.roomKey ?? "",
          })),
        ),
      };
      const response = await mutateAsync(body);
      if (
        response?.meta?.success &&
        response?.meta?.statusMessage === "SUCCESS"
      ) {
        setPreBookData(response);
        const preBookHotelData = response?.data?.[0]?.hotel;
        const bookingKey =
          preBookHotelData?.bookingKey ?? response?.data?.[0]?.bookingKey ?? "";
        const preBookRooms = preBookHotelData?.rooms ?? [];

        setHotelBookingPayload((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            bookingKey,
            totalNet: preBookHotelData?.totalNet ?? prev.totalNet,
            stayDateRange: {
              checkIn:
                preBookHotelData?.checkInDate ?? prev.stayDateRange.checkIn,
              checkOut:
                preBookHotelData?.checkOutDate ?? prev.stayDateRange.checkOut,
            },
            rooms: prev.rooms.map((room, idx) => ({
              ...room,
              roomKey: preBookRooms[idx]?.roomKey ?? room.roomKey,
              roomIndex: preBookRooms[idx]?.roomIndex ?? room.roomIndex,
            })),
          };
        });
        // toast.success("Hotel pre-booking successful");
        setCurrentStep(1);
      } else {
        const msg =
          extractMessageFromApiResponseBody(response) ||
          "Pre-booking failed. Please try again.";
        toast.error(msg);
      }
    } catch (error) {
      const err = extractErrorFromAxiosApiError(error);
      toast.error(err);
    }
    setCurrentStep(1);
  }, [hotelBookingPayload, state]);

  // useEffect(() => {
  //   init();
  // }, [isAuthenticated]);

  return (
    <>
      <div className="py-4 sm:py-6 lg:py-8 px-[16px] md:px-[24px] min-[1200px]:px-[clamp(24px,8vw,180px)] box-border">
        <Loader
          show={isPending || isPassengerCacheSaving || isPassengerCacheFetching}
          label={
            isPassengerCacheFetching
              ? "Please wait while we are fetching data"
              : "Checking availability and securing your room..."
          }
        />
        {/* <div className={`p-8 ${showTimerBanner ? "pt-8" : ""}`}> */}
        <div className="relative mx-auto max-w-[420px] md:max-w-[520px]">
          <div className="absolute left-[10px] right-[15px] top-3 -translate-y-1/2 z-0">
            <div className="relative h-[2px]">
              <div className="absolute inset-0 bg-[#F2F2F3]" />
              <div
                className="absolute inset-y-0 left-0 bg-[#2351A3] transition-all duration-300"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>

          <ol className="relative z-10 flex items-center justify-between gap-2">
            {steps.map((label, i) => {
              const isReached = i <= currentStep;

              return (
                <li key={label} className="flex flex-col items-center">
                  <Button
                    type="button"
                    // onClick={() => setCurrentStep(i)}
                    className={[
                      "flex h-5 w-5 items-center justify-center rounded-full border transition p-0", // keep circle shape
                      "focus:outline-none",
                      isReached
                        ? "bg-[#2351A3] border-[#2351A3]"
                        : "bg-[#C2CAD6] border-[#C2CAD6]",
                    ].join(" ")}
                    overrideClasses
                  >
                    {""}
                  </Button>

                  <Button
                    type="button"
                    // onClick={() => setCurrentStep(i)}
                    className={[
                      "mt-2 text-xs sm:text-sm transition-colors bg-transparent border-none hover:text-[#2351A3]",
                      isReached
                        ? "text-[#2351A3] font-medium"
                        : "text-[#3D495C]",
                    ].join(" ")}
                    overrideClasses
                  >
                    {label}
                  </Button>
                </li>
              );
            })}
          </ol>
        </div>

        <div className="mt-6">
          {currentStep === 0 && hotelBookingPayload && (
            <HotelBookingBookSection
              hotelBookingPayload={hotelBookingPayload}
              onPassengerFieldChange={updatePassengerField}
              onPassengerCacheSavingChange={setIsPassengerCacheSaving}
              onPassengerCacheFetchLoadingChange={setIsPassengerCacheFetching}
              onNext={handleBookSectionContinue}
              childAgesPerRoom={childAgesPerRoom}
              checkInDate={effectiveCheckIn}
              countries={countriesOptions ?? []}
              hotelDetail={hotelDetail}
              bookingInfo={bookingInfo}
              selectedRooms={selectedRooms}
              totalPrice={totalPrice}
              currency={currency}
            />
          )}
          {currentStep === 1 && (
            <HotelBookingReviewSection
              onNext={() => {
                setCurrentStep(2);
              }}
              onPrevious={() => {
                setCurrentStep(0);
              }}
              hotelBookingPayload={hotelBookingPayload}
              onPatchHotelBookingPayload={patchHotelBookingPayload}
              hotelDetail={hotelDetail}
              bookingInfo={bookingInfo}
              selectedRooms={selectedRooms}
              totalPrice={totalPrice}
              currency={currency}
            />
          )}
          {currentStep === 2 && (
            <HotelBookingPaymentSection
              onNext={(bookingResponse) => {
                setHotelBookingResponse(bookingResponse);
                setCurrentStep(3);
              }}
              onEditPassengers={() => setCurrentStep(0)}
              hotelDetail={hotelDetail}
              bookingInfo={bookingInfo}
              selectedRooms={selectedRooms}
              totalPrice={totalPrice}
              currency={currency}
              hotelBookingPayload={hotelBookingPayload}
            />
          )}
          {currentStep === 3 && (
            <HotelBookingETicketSetion
              bookingResponse={hotelBookingResponse}
              hotelDetail={hotelDetail}
            />
          )}
        </div>
      </div>
      {!isAuthenticated && (
        <LoginModal
          showModal={!isAuthenticated}
          showGoBack
          onClose={() => navigate(-1)}
        />
      )}
    </>
  );
};

export default HotelBooking;
