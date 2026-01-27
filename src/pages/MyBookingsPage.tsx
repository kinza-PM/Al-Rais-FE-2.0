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

const tabs = ["All", "Pending", "Confirmed", "Expired"] as const;
const modeTabs = ["Flights"] as const;
// const modeTabs = ["Flights", "Hotels"] as const;

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
      <div className="grid grid-cols-[auto_1fr_.7fr] items-center px-10 gap-10 max-[768px]:grid-cols-1 max-[768px]:px-4 max-[768px]:gap-4">
        <div
          role="tablist"
          aria-label="Profile sections"
          className="flex items-center rounded-2xl ring-1 ring-[#C2CAD6] bg-white p-1 shadow-sm max-[768px]:gap-2 max-[768px]:py-1"
        >
          {tabs.map((t) => {
            const selected = active === t;
            return (
              <Button
                key={t}
                type="button"
                aria-selected={selected}
                onClick={() => setActive(t)}
                className={[
                  "flex-1 rounded-xl px-8 py-2 text-[14px] font-medium transition-colors max-[625px]:px-3 max-[625px]:py-2 max-[625px]:text-[13px]",
                  selected
                    ? "bg-[#2351A3] text-white shadow-sm"
                    : "text-[#3D495C]",
                ].join(" ")}
                overrideClasses
              >
                {t}
              </Button>
            );
          })}
        </div>

        <div className="justify-self-center">
          <div className="flex justify-center gap-10 text-[16px]">
            {modeTabs.map((m) => {
              const selected = mode === m;
              return (
                <Button
                  key={m}
                  type="button"
                  onClick={() => setMode(m)}
                  className={[
                    "relative font-medium", // relative so underline can position under this
                    selected ? "text-[#2351A3]" : "text-[#3D495C]",
                  ].join(" ")}
                  overrideClasses
                >
                  {m}
                  {selected && (
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute top-full mt-5 h-[4px] w-[50px] -translate-x-1/2 rounded-full bg-[#5383DA] underline-blur max-[768px]:top-[30px]"
                    />
                  )}
                </Button>
              );
            })}
          </div>
        </div>

        <div />
      </div>

      <div aria-hidden="true" className="mt-3 h-px bg-[#E4E4E7]" />

      <div className="px-10">
        <UserBookingsListing
          bookings={userMyFlightBooking}
          filterStatus={active}
          mode={mode as TripMode}
        />
      </div>
    </div>
  );
};

export default MyBookingsPage;
