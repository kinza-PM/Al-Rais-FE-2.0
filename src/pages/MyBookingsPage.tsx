import { useEffect, useState } from "react";
import { Button } from "../components";
import UserBookingsListing, {
  type TripMode,
} from "../components/molecules/UserBookingsListing";
import { extractErrorFromAxiosApiError } from "../utils/apiErrorHanlder";
import toast from "react-hot-toast";
import { useMyBooking } from "../hooks/useUserProfileBooking";
import Loader from "../components/atoms/Loader";
import { transformBookingsResponse } from "../utils/transformBookingData";
import UserHotelBookingsListing from "../components/molecules/UserHotelBookingsListing";
const tabs = ["All", "Pending", "Confirmed", "Expired"] as const;
const modeTabs = ["Flights", "Hotels"] as const;

const MyBookingsPage = () => {
  const [active, setActive] = useState<(typeof tabs)[number]>("All");
  const [mode, setMode] = useState<(typeof modeTabs)[number]>("Flights");
  const [userMyFlightBooking, setUserMyFlightBookings] = useState<any>([]);

  const { mutateAsync, isPending } = useMyBooking();

  const init = async () => {
    try {
      const response = await mutateAsync({ status: active === "Confirmed" ? "completed" : active.toLowerCase() });
      // Transform API response to booking format
      const transformedBookings = transformBookingsResponse(response);
      setUserMyFlightBookings(transformedBookings);
    } catch (error) {
      const err = extractErrorFromAxiosApiError(error);
      toast.error(err);
    }
  };

  useEffect(() => {
    init();
  }, [active]);

  return (
    <div className="py-6">
      <Loader
        show={isPending}
        label="Please wait while we are fetching your bookings"
      />
      <div className="flex flex-col items-center px-6">
        <div role="tablist" aria-label="Booking status tabs" className="flex items-center justify-center gap-[10px]">
          {tabs.map((t) => {
            const selected = active === t;
            return (
              <Button
                key={t}
                type="button"
                aria-selected={selected}
                onClick={() => setActive(t)}
                className={[
                  "flex items-center justify-center w-[108px] h-[39px] rounded-tl-[16px] rounded-tr-[16px] px-[20px] py-[10px] text-[14px] font-medium transition-colors",
                  selected
                    ? "bg-[#2351A3] text-white shadow-sm"
                    : "bg-[#E4E4E7] text-[#3D495C]",
                ].join(" ")}
                overrideClasses
              >
                {t}
              </Button>
            );
          })}
        </div>

        {/* Decorative bottom gradient bar matching Figma */}
        <div className="mt-3 flex justify-center w-full">
          <div
            aria-hidden="true"
            className="rounded-tl-[16px] rounded-tr-[16px]"
            style={{
              width: 1168,
              maxWidth: "100%",
              height: 10,
              background: "linear-gradient(180deg, #C4CFE1 0%, #DEF7FE 100%)",
              backdropFilter: "blur(10px)",
            }}
          />
        </div>

        {/* Mode tabs (Flights/Hotels) - kept centered under main tabs */}
        <div className="mt-4">
          <div className="flex justify-center gap-10 text-[16px]">
            {modeTabs.map((m) => {
              const selected = mode === m;
              return (
                <Button
                  key={m}
                  type="button"
                  onClick={() => setMode(m)}
                  className={[
                    "relative font-medium",
                    selected ? "text-[#2351A3]" : "text-[#3D495C]",
                  ].join(" ")}
                  overrideClasses
                >
                  {m}
                </Button>
              );
            })}
          </div>
        </div>
      </div>

      <div aria-hidden="true" className="mt-3 h-px bg-[#E4E4E7]" />

      <div className="px-10">
  {mode === "Flights" ? (
    <UserBookingsListing
      bookings={userMyFlightBooking}
      filterStatus={active}
      mode={mode as TripMode}
    />
  ) : (
    <UserHotelBookingsListing filterStatus={active} />
  )}
</div>
    </div>
  );
};

export default MyBookingsPage;
