import { useCallback, useEffect, useLayoutEffect, useMemo, useState } from "react";
import {
  useLocation,
  useNavigationType,
  useSearchParams,
} from "react-router-dom";
import { Button } from "../components";
import UserBookingsListing, {
  type TripMode,
} from "../components/molecules/UserBookingsListing";
import { extractErrorFromAxiosApiError } from "../utils/apiErrorHanlder";
import toast from "react-hot-toast";
import { useMyBooking } from "../hooks/useUserProfileBooking";
import { useMyHotelBooking } from "../hooks/useMyHotelBooking";
import Loader from "../components/atoms/Loader";
import {
  transformBookingsResponse,
  transformHotelBookingsResponse,
} from "../utils/transformBookingData";
import UserHotelBookingsListing from "../components/molecules/UserHotelBookingsListing";
import {
  MY_BOOKINGS_LAST_QS_SESSION_KEY,
  MY_BOOKINGS_RESTORE_FLAG_SESSION_KEY,
  type MyBookingsStatusParam,
} from "../utils/myBookingsUrl";

const tabs = ["All", "Pending", "Confirmed", "Expired"] as const;
const modeTabs = ["Flights", "Hotels"] as const;

type StatusTab = (typeof tabs)[number];

function parseStatusParam(value: string | null): StatusTab {
  const s = (value ?? "all").toLowerCase();
  if (s === "pending") return "Pending";
  if (s === "confirmed") return "Confirmed";
  if (s === "expired") return "Expired";
  return "All";
}

function statusToParam(t: StatusTab): MyBookingsStatusParam {
  if (t === "All") return "all";
  return t.toLowerCase() as MyBookingsStatusParam;
}

const MyBookingsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const navigationType = useNavigationType();
  const [userMyFlightBooking, setUserMyFlightBookings] = useState<any>([]);
  const [userMyHotelBookings, setUserMyHotelBookings] = useState<any[]>([]);

  const active = useMemo(
    () => parseStatusParam(searchParams.get("status")),
    [searchParams],
  );
  const mode = useMemo<(typeof modeTabs)[number]>(
    () => (searchParams.get("mode") === "hotels" ? "Hotels" : "Flights"),
    [searchParams],
  );

  const setActiveTab = useCallback(
    (t: StatusTab) => {
      setSearchParams(
        (prev) => {
          const p = new URLSearchParams(prev);
          p.set("status", statusToParam(t));
          if (!p.get("mode")) p.set("mode", "flights");
          return p;
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

  const setModeTab = useCallback(
    (m: (typeof modeTabs)[number]) => {
      setSearchParams(
        (prev) => {
          const p = new URLSearchParams(prev);
          p.set("mode", m === "Hotels" ? "hotels" : "flights");
          if (!p.get("status")) p.set("status", "all");
          return p;
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

  const { mutateAsync, isPending } = useMyBooking();
  const { mutateAsync: fetchHotelBookings, isPending: isHotelPending } =
    useMyHotelBooking();

  const init = async () => {
    try {
      const response = await mutateAsync({
        status: active === "Confirmed" ? "completed" : active.toLowerCase(),
      });
      const transformedBookings = transformBookingsResponse(response);
      setUserMyFlightBookings(transformedBookings);
    } catch (error) {
      const err = extractErrorFromAxiosApiError(error);
      toast.error(err);
    }
  };

  const initHotel = async () => {
    try {
      const status =
        active === "Confirmed" ? "confirmed" : active.toLowerCase();
      const response = await fetchHotelBookings({ status });
      const transformed = transformHotelBookingsResponse(response ?? {});
      setUserMyHotelBookings(Array.isArray(transformed) ? transformed : []);
    } catch (error) {
      const err = extractErrorFromAxiosApiError(error);
      toast.error(err || "Unable to load hotel bookings. Please try again.");
      setUserMyHotelBookings([]);
    }
  };

  useEffect(() => {
    if (mode === "Flights") {
      init();
    }
  }, [active, mode]);

  useEffect(() => {
    if (mode === "Hotels") {
      initHotel();
    }
  }, [active, mode]);

  /** Remember last tab/status query so browser Back can re-apply it if the URL is stripped. */
  useEffect(() => {
    const qs = searchParams.toString();
    if (qs) {
      try {
        sessionStorage.setItem(MY_BOOKINGS_LAST_QS_SESSION_KEY, qs);
      } catch {
        /* ignore quota / private mode */
      }
    }
  }, [searchParams]);

  /**
   * When opening hotel detail/cancel from My Bookings we set a short-lived session flag.
   * If browser Back lands on `/my-bookings` with no query (Hotels → Flight bug), restore last ?mode=&status=.
   */
  useLayoutEffect(() => {
    if (navigationType !== "POP") return;
    if (location.search) return;
    let shouldRestore = false;
    let saved: string | null = null;
    try {
      shouldRestore =
        sessionStorage.getItem(MY_BOOKINGS_RESTORE_FLAG_SESSION_KEY) === "1";
      if (shouldRestore) {
        sessionStorage.removeItem(MY_BOOKINGS_RESTORE_FLAG_SESSION_KEY);
      }
      saved = sessionStorage.getItem(MY_BOOKINGS_LAST_QS_SESSION_KEY);
    } catch {
      return;
    }
    if (!shouldRestore || !saved) return;
    setSearchParams(new URLSearchParams(saved), { replace: true });
  }, [navigationType, location.search, setSearchParams]);

  return (
    <div className="py-6">
      <Loader
        show={isPending || isHotelPending}
        label="Please wait while we are fetching your bookings"
      />
      <div className="flex flex-col items-center px-6">
        <div
          role="tablist"
          aria-label="Booking status tabs"
          className="flex items-center justify-center gap-[10px]"
        >
          {tabs.map((t) => {
            const selected = active === t;
            return (
              <Button
                key={t}
                type="button"
                aria-selected={selected}
                onClick={() => setActiveTab(t)}
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

        <div className="mt-4">
          <div className="flex justify-center gap-10 text-[16px]">
            {modeTabs.map((m) => {
              const selected = mode === m;
              return (
                <Button
                  key={m}
                  type="button"
                  onClick={() => setModeTab(m)}
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
          <UserHotelBookingsListing
            filterStatus={active}
            bookings={userMyHotelBookings}
          />
        )}
      </div>
    </div>
  );
};

export default MyBookingsPage;
