import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
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
import { useMyActivityBookingsQuery } from "../hooks/useMyActivityBooking";
import Loader from "../components/atoms/Loader";
import {
  mergeSightseeingBookingLists,
  transformBookingsResponse,
  transformHotelBookingsResponse,
  transformSightseeingBookingsResponse,
  type SightseeingBookingCardItem,
} from "../utils/transformBookingData";
import UserHotelBookingsListing from "../components/molecules/UserHotelBookingsListing";
import UserSightseeingBookingsListing from "../components/molecules/UserSightseeingBookingsListing";
import { getLocalSightseeingBookings } from "../utils/sightseeingLocalBookings";
import {
  MY_BOOKINGS_LAST_QS_SESSION_KEY,
  MY_BOOKINGS_RESTORE_FLAG_SESSION_KEY,
  type MyBookingsStatusParam,
} from "../utils/myBookingsUrl";

const tabs = ["All", "Pending", "Confirmed", "Expired"] as const;
const modeTabs = ["Flights", "Hotels", "Sightseeing"] as const;

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

/** Figma category row — full pill, 108×39, radius 16 */
function categoryTabClass(selected: boolean): string {
  return [
    "box-border flex h-[39px] w-[108px] shrink-0 cursor-pointer items-center justify-center rounded-[16px] border-0 px-[20px] py-[10px] text-[14px] font-medium uppercase leading-none tracking-normal transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[#2351A3] focus-visible:ring-offset-2",
    selected
      ? "bg-[#2351A3] text-white"
      : "bg-[#E4E4E7] text-[#0A0C0F]",
  ].join(" ");
}

/** Figma status row — rounded top only */
function statusTabClass(selected: boolean): string {
  return [
    "box-border flex h-[39px] w-[108px] shrink-0 cursor-pointer items-center justify-center rounded-tl-[16px] rounded-tr-[16px] rounded-bl-none rounded-br-none border-0 px-[20px] py-[10px] text-[14px] font-medium uppercase leading-none tracking-normal transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[#2351A3] focus-visible:ring-offset-2",
    selected
      ? "bg-[#2351A3] text-white"
      : "bg-[#E4E4E7] text-[#0A0C0F]",
  ].join(" ");
}

const MyBookingsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const navigationType = useNavigationType();
  const [userMyFlightBooking, setUserMyFlightBookings] = useState<any>([]);
  const [userMyHotelBookings, setUserMyHotelBookings] = useState<any[]>([]);
  const [userSightseeingBookings, setUserSightseeingBookings] = useState<
    SightseeingBookingCardItem[]
  >([]);
  const sightseeingErrorToastKey = useRef<string | null>(null);

  const active = useMemo(
    () => parseStatusParam(searchParams.get("status")),
    [searchParams],
  );
  const mode = useMemo<(typeof modeTabs)[number]>(() => {
    const m = searchParams.get("mode");
    if (m === "hotels") return "Hotels";
    if (m === "sightseeing") return "Sightseeing";
    return "Flights";
  }, [searchParams]);

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
          const modeVal =
            m === "Hotels"
              ? "hotels"
              : m === "Sightseeing"
                ? "sightseeing"
                : "flights";
          p.set("mode", modeVal);
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
  const sightFilters =
    mode === "Sightseeing"
      ? {
          status:
            active === "Confirmed" ? "confirmed" : active.toLowerCase(),
        }
      : null;
  const {
    data: activityBookingsData,
    isLoading: isSightLoading,
    isError: isSightError,
    error: sightQueryError,
  } = useMyActivityBookingsQuery(sightFilters);

  const showBookingsLoader =
    (mode === "Flights" && isPending) ||
    (mode === "Hotels" && isHotelPending) ||
    (mode === "Sightseeing" && isSightLoading && !isSightError);

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

  useEffect(() => {
    if (!isSightError) sightseeingErrorToastKey.current = null;
  }, [isSightError]);

  useEffect(() => {
    if (mode !== "Sightseeing") return;
    const local = getLocalSightseeingBookings();
    const transformed = transformSightseeingBookingsResponse(
      activityBookingsData ?? {},
    );
    const merged = mergeSightseeingBookingLists(
      Array.isArray(transformed) ? transformed : [],
      local,
    );
    setUserSightseeingBookings(merged);
  }, [mode, activityBookingsData, active]);

  useEffect(() => {
    if (!isSightError || mode !== "Sightseeing") {
      if (mode !== "Sightseeing") sightseeingErrorToastKey.current = null;
      return;
    }
    const local = getLocalSightseeingBookings();
    setUserSightseeingBookings(mergeSightseeingBookingLists([], local));
    const err = extractErrorFromAxiosApiError(sightQueryError);
    if (local.length === 0) {
      const dedupe = `${sightFilters?.status ?? ""}:${err}`;
      if (sightseeingErrorToastKey.current !== dedupe) {
        sightseeingErrorToastKey.current = dedupe;
        toast.error(
          err ||
            "Unable to load sightseeing bookings from the server. Confirm the /myActivityBooking route exists.",
        );
      }
    }
  }, [isSightError, mode, sightQueryError, sightFilters?.status]);

  return (
    <div className="py-6">
      <Loader
        show={showBookingsLoader}
        label="Please wait while we are fetching your bookings"
      />
      <div className="mx-auto flex w-full max-w-[1168px] flex-col items-stretch px-6">
        <div
          role="tablist"
          aria-label="Booking type"
          className="flex flex-wrap items-center justify-center gap-[10px]"
        >
          {modeTabs.map((m) => {
            const selected = mode === m;
            return (
              <button
                key={m}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => setModeTab(m)}
                className={categoryTabClass(selected)}
              >
                {m}
              </button>
            );
          })}
        </div>

        <div className="mt-6 flex w-full justify-center">
          <div
            role="tablist"
            aria-label="Booking status"
            className="flex flex-wrap items-center justify-center gap-[10px]"
          >
            {tabs.map((t) => {
              const selected = active === t;
              return (
                <button
                  key={t}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  onClick={() => setActiveTab(t)}
                  className={statusTabClass(selected)}
                >
                  {t}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-0 flex w-full justify-center">
          <div
            aria-hidden="true"
            className="rounded-tl-[16px] rounded-tr-[16px]"
            style={{
              width: "100%",
              maxWidth: 1168,
              height: 10,
              background: "linear-gradient(180deg, #C4CFE1 0%, #DEF7FE 100%)",
              backdropFilter: "blur(10px)",
            }}
          />
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
        ) : mode === "Hotels" ? (
          <UserHotelBookingsListing
            filterStatus={active}
            bookings={userMyHotelBookings}
          />
        ) : (
          <UserSightseeingBookingsListing
            filterStatus={active}
            bookings={userSightseeingBookings}
          />
        )}
      </div>
    </div>
  );
};

export default MyBookingsPage;
