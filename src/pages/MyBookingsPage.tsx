import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from "react";
import {
  useLocation,
  useNavigationType,
  useSearchParams,
} from "react-router-dom";
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
const statusTabs = [
  "All",
  "Pending",
  "Confirmed",
  "Expired",
  "Cancelled",
] as const;

const FILTER_LABEL_CLASS =
  "mb-[5px] block text-[12px] font-normal leading-none text-[#3D495C]";

type StatusTab = (typeof statusTabs)[number];
type BookingsMode = "Flights" | "Hotels";

function parseStatusParam(value: string | null): StatusTab {
  const s = (value ?? "all").toLowerCase();
  if (s === "pending") return "Pending";
  if (s === "confirmed") return "Confirmed";
  if (s === "expired") return "Expired";
  if (s === "cancelled" || s === "canceled") return "Cancelled";
  return "All";
}

function statusToParam(t: StatusTab): MyBookingsStatusParam {
  if (t === "All") return "all";
  return t.toLowerCase() as MyBookingsStatusParam;
}

function parseModeParam(value: string | null): BookingsMode {
  if ((value ?? "").toLowerCase() === "hotels") return "Hotels";
  return "Flights";
}

function modeToParam(m: BookingsMode): string {
  return m === "Hotels" ? "hotels" : "flights";
}

const CATEGORY_TABS: { mode: BookingsMode; label: string }[] = [
  { mode: "Flights", label: "Flights" },
  { mode: "Hotels", label: "Hotels" },
];

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
  const mode = useMemo(
    () => parseModeParam(searchParams.get("mode")),
    [searchParams],
  );

  const setStatusFilter = useCallback(
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

  const setModeFilter = useCallback(
    (m: BookingsMode) => {
      setSearchParams(
        (prev) => {
          const p = new URLSearchParams(prev);
          p.set("mode", modeToParam(m));
          if (!p.get("status")) p.set("status", "all");
          return p;
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

  useEffect(() => {
    const m = (location.state as { mode?: string } | null)?.mode;
    if (m === "Hotels") setModeFilter("Hotels");
    else if (m === "Flights") setModeFilter("Flights");
    else if (m === "All" || m === "Sightseeing") setModeFilter("Flights");
  }, [location.state, setModeFilter]);

  const { mutateAsync, isPending } = useMyBooking();
  const { mutateAsync: fetchHotelBookings, isPending: isHotelPending } =
    useMyHotelBooking();

  const showBookingsLoader =
    (mode === "Flights" && isPending) || (mode === "Hotels" && isHotelPending);

  const init = async () => {
    try {
      const response = await mutateAsync({
        status: active === "Confirmed" ? "completed" : active.toLowerCase(),
      });
      const transformedBookings = transformBookingsResponse(response ?? {});
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
    void init();
    void initHotel();
  }, [active]);

  useEffect(() => {
    const qs = searchParams.toString();
    if (qs) {
      try {
        sessionStorage.setItem(MY_BOOKINGS_LAST_QS_SESSION_KEY, qs);
      } catch {
        /* ignore */
      }
    }
  }, [searchParams]);

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

  useLayoutEffect(() => {
    const s = (searchParams.get("mode") ?? "").toLowerCase();
    if (s === "flights" || s === "hotels") return;
    setSearchParams(
      (prev) => {
        const p = new URLSearchParams(prev);
        p.set("mode", "flights");
        if (!p.get("status")) p.set("status", "all");
        return p;
      },
      { replace: true },
    );
  }, [searchParams, setSearchParams]);

  return (
    <div className="py-6">
      <Loader
        show={showBookingsLoader}
        label="Please wait while we are fetching your bookings"
      />
      <div className="mx-auto w-full max-w-[1168px] border-t border-[#E5E7EB] px-6 pt-5">
        {/* Status left; Flights/Hotels centered in the remaining row — no negative margins (they break hit-testing). */}
        <div className="relative isolate flex w-full min-w-0 flex-col gap-5 min-[900px]:flex-row min-[900px]:items-end min-[900px]:justify-between min-[900px]:gap-8">
          <div className="relative z-0 min-w-0 shrink-0 self-start min-[900px]:max-w-[min(100%,50%)]">
            <span className={FILTER_LABEL_CLASS}>Status</span>
            <div
              className="mt-1.5 inline-flex h-[50px] w-max min-w-[417px] max-w-full flex-nowrap items-stretch gap-1 overflow-x-auto rounded-[16px] border border-[#C2CAD6] bg-[#F9FAFB] p-[5px] [scrollbar-width:thin]"
              role="tablist"
              aria-label="Booking status"
            >
              {statusTabs.map((tab) => {
                const selected = active === tab;
                return (
                  <button
                    key={tab}
                    type="button"
                    role="tab"
                    aria-selected={selected}
                    onClick={() => setStatusFilter(tab)}
                    className={[
                      "min-h-0 shrink-0 cursor-pointer select-none rounded-[12px] px-3 text-[13px] font-medium leading-none transition-colors sm:px-3.5",
                      selected
                        ? "bg-[#2351A3] text-white shadow-sm"
                        : "text-[#374151] hover:bg-white/90 hover:text-[#111827]",
                    ].join(" ")}
                  >
                    <span className="flex h-full items-center justify-center whitespace-nowrap py-2 text-center">
                      {tab}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="relative z-10 flex min-w-0 flex-1 justify-center min-[900px]:mr-[20rem] min-[900px]:items-end">
            <nav className="min-w-0" aria-label="Booking type">
              <div
                className="flex select-none items-stretch justify-center gap-3 border-b border-[#E5E7EB] sm:gap-4"
                role="tablist"
              >
                {CATEGORY_TABS.map((item) => {
                  const selected = mode === item.mode;
                  return (
                    <button
                      key={item.mode}
                      type="button"
                      role="tab"
                      aria-selected={selected}
                      onClick={() => setModeFilter(item.mode)}
                      className={[
                        "relative -mb-px min-w-[72px] cursor-pointer px-3 pb-3 pt-1 text-[15px] font-medium transition-colors sm:min-w-[80px] sm:px-4",
                        selected
                          ? "text-[#2351A3]"
                          : "text-[#6B7280] hover:text-[#374151]",
                      ].join(" ")}
                    >
                      {item.label}
                      {selected ? (
                        <span
                          className="absolute bottom-0 left-2 right-2 h-[3px] rounded-t bg-[#2351A3] sm:left-3 sm:right-3"
                          aria-hidden
                        />
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </nav>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-8 w-full max-w-[1168px] px-6">
        {mode === "Flights" ? (
          <UserBookingsListing
            bookings={userMyFlightBooking}
            filterStatus={active}
            mode={"Flights" as TripMode}
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
