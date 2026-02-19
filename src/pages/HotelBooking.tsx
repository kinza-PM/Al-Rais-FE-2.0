import { useState, useMemo, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Button } from "../components";
import HotelBookingBookSection from "../components/molecules/HotelBookingBookSection";
import HotelBookingReviewSection from "../components/molecules/HotelBookingReviewSection";
import HotelBookingPaymentSection from "../components/molecules/HotelBookingPaymentSection";
import HotelBookingETicketSetion from "../components/molecules/HotelBookingETicketSetion";
import { useHotelStore } from "../store/UseHotelStore";
import { useAuth } from "../features/auth/hooks/useAuth";
import LoginModal from "../components/common/LoginModal";
import { extractErrorFromAxiosApiError } from "../utils/apiErrorHanlder";
import toast from "react-hot-toast";
import { useHotelPreBooking } from "../hooks/useHotelBooking";
import Loader from "../components/atoms/Loader";

const HotelBooking = () => {
  const location = useLocation();
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
  console.log("state----------", state);
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, _] = useState<string[]>(["Book", "Review", "Pay", "Receipt"]);
  const progressPct =
    steps.length > 1 ? (currentStep / (steps.length - 1)) * 100 : 0;

  const { mutateAsync, isPending } = useHotelPreBooking();
  const bookingParams = state.bookingParams ?? hotelFromStore ?? null;

  const init = async () => {
    if (isAuthenticated) {
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
        console.log("response------------", response);
        if (
          response?.meta?.success &&
          response?.meta?.statusMessage === "SUCCESS"
        ) {
          toast.success("Hotel Pre Booking Successfully.");
        } else {
          window.history.back();
        }
      } catch (error) {
        const err = extractErrorFromAxiosApiError(error);
        toast.error(err);
        window.history.back();
      }
    }
  };

  // Calculate total nights from check-in and check-out dates
  const totalNights = useMemo(() => {
    const checkIn = bookingParams?.checkIn;
    const checkOut = bookingParams?.checkOut;
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
  }, [bookingParams?.checkIn, bookingParams?.checkOut]);

  const pax = bookingParams?.paxData;

  // Prepare booking info (from bookingParams / state so it works when store was cleared)
  const bookingInfo = useMemo(
    () => ({
      checkIn: bookingParams?.checkIn || "",
      checkOut: bookingParams?.checkOut || "",
      checkInTime: state.hotelDetail?.checkInTime || "",
      checkOutTime: state.hotelDetail?.checkOutTime || "",
      totalNights,
      rooms: pax?.rooms ?? 0,
      adults: pax?.adults ?? 0,
      children: (pax?.children ?? 0) + (pax?.kids ?? 0),
    }),
    [bookingParams, state.hotelDetail, totalNights, pax],
  );

  const hotelDetail = state.hotelDetail || {};
  const selectedRooms = state.selectedRooms ?? [];
  const totalPrice = state.totalPrice ?? 0;
  const currency = state.currency ?? "AED";

  useEffect(() => {
    init();
  }, [isAuthenticated]);

  return (
    <>
      <div className={`p-8`}>
        <Loader
          show={isPending}
          label="Please wait while we complete your provisional booking"
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

          <ol className="relative z-10 flex items-center justify-between">
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
                      "mt-2 text-sm transition-colors bg-transparent border-none hover:text-[#2351A3]",
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
          {currentStep === 0 && (
            <HotelBookingBookSection
              onNext={() => {
                setCurrentStep(1);
              }}
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
              hotelDetail={hotelDetail}
              bookingInfo={bookingInfo}
              selectedRooms={selectedRooms}
              totalPrice={totalPrice}
              currency={currency}
            />
          )}
          {currentStep === 2 && (
            <HotelBookingPaymentSection
              onNext={() => {
                setCurrentStep(3);
              }}
              hotelDetail={hotelDetail}
              bookingInfo={bookingInfo}
              totalPrice={totalPrice}
              currency={currency}
            />
          )}
          {currentStep === 3 && <HotelBookingETicketSetion />}
        </div>
      </div>
      {!isAuthenticated && <LoginModal showModal={!isAuthenticated} />}
    </>
  );
};

export default HotelBooking;
