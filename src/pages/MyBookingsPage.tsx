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
import SearchableDropdown, {
  type DropdownOption,
} from "../components/common/SearchableDropdown";

const statusTabs = [
  "All",
  "Pending",
  "Confirmed",
  "Expired",
  "Cancelled",
] as const;

/**
 * My Bookings filter bar — matches Figma (node 5099:16949 area):
 * light grey fill, 8px radius, 50px height, 10px gaps, compact dropdowns.
 */
const FILTER_LABEL_CLASS =
  "mb-1.5 block text-[12px] font-normal leading-tight text-[#6B7280]";

const FILTER_FIELD_SHELL =
  "h-[50px] rounded-lg border border-[#E5E7EB] bg-[#F8F9FA] transition-colors focus-within:border-[#5383DA] focus-within:ring-2 focus-within:ring-[#5383DA]/15";

const FILTER_SEARCH_INPUT_CLASS =
  "h-[50px] w-full rounded-lg border border-[#E5E7EB] bg-[#F8F9FA] py-0 pl-[42px] pr-[15px] text-[14px] font-medium leading-none text-[#0A0C0F] placeholder:text-[#9CA3AF] outline-none focus:border-[#5383DA] focus:ring-2 focus:ring-[#5383DA]/15";

const FILTER_DROPDOWN_TRIGGER_CLASS =
  "appearance-none h-[50px] w-full rounded-lg border border-[#E5E7EB] bg-[#F8F9FA] pl-[15px] pr-10 text-[14px] font-medium leading-none text-[#0A0C0F] outline-none flex min-w-0 items-center cursor-pointer transition-colors focus:border-[#5383DA] focus:ring-2 focus:ring-[#5383DA]/15 disabled:cursor-not-allowed disabled:opacity-60";

type StatusTab = (typeof statusTabs)[number];
type BookingsMode = "All" | "Flights" | "Hotels" | "Sightseeing";

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
  const s = (value ?? "all").toLowerCase();
  if (s === "hotels") return "Hotels";
  if (s === "sightseeing") return "Sightseeing";
  if (s === "flights") return "Flights";
  return "All";
}

function modeToParam(m: BookingsMode): string {
  if (m === "Hotels") return "hotels";
  if (m === "Sightseeing") return "sightseeing";
  if (m === "Flights") return "flights";
  return "all";
}

const MODE_OPTIONS: DropdownOption[] = [
  { id: "all", value: "all", label: "All" },
  { id: "flights", value: "flights", label: "Flights" },
  { id: "hotels", value: "hotels", label: "Hotels" },
  { id: "sightseeing", value: "sightseeing", label: "Sightseeing" },
];

const STATUS_OPTIONS: DropdownOption[] = statusTabs.map((t) => ({
  id: statusToParam(t),
  value: statusToParam(t),
  label: t,
}));

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

  const [searchQuery, setSearchQuery] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const active = useMemo(
    () => parseStatusParam(searchParams.get("status")),
    [searchParams],
  );
  const mode = useMemo(
    () => parseModeParam(searchParams.get("mode")),
    [searchParams],
  );

  const modeSelectValue = modeToParam(mode);
  const statusSelectValue = statusToParam(active);

  const setStatusFilter = useCallback(
    (t: StatusTab) => {
      setSearchParams(
        (prev) => {
          const p = new URLSearchParams(prev);
          p.set("status", statusToParam(t));
          if (!p.get("mode")) p.set("mode", "all");
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
    if (
      m === "Sightseeing" ||
      m === "Hotels" ||
      m === "Flights" ||
      m === "All"
    ) {
      setModeFilter(m);
    }
  }, [location.state, setModeFilter]);

  const { mutateAsync, isPending } = useMyBooking();
  const { mutateAsync: fetchHotelBookings, isPending: isHotelPending } =
    useMyHotelBooking();

  const sightFilters =
    mode === "Sightseeing" || mode === "All"
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
    ((mode === "Flights" || mode === "All") && isPending) ||
    ((mode === "Hotels" || mode === "All") && isHotelPending) ||
    ((mode === "Sightseeing" || mode === "All") &&
      isSightLoading &&
      !isSightError);

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
    if (mode === "Flights" || mode === "All") {
      void init();
    }
  }, [active, mode]);

  useEffect(() => {
    if (mode === "Hotels" || mode === "All") {
      void initHotel();
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
    if (mode !== "Sightseeing" && mode !== "All") return;
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
    if (!isSightError || (mode !== "Sightseeing" && mode !== "All")) {
      if (mode !== "Sightseeing" && mode !== "All")
        sightseeingErrorToastKey.current = null;
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

  const sharedListProps = useMemo(
    () => ({
      searchQuery,
      dateFrom,
      dateTo,
    }),
    [searchQuery, dateFrom, dateTo],
  );

  return (
    <div className="py-6">
      <Loader
        show={showBookingsLoader}
        label="Please wait while we are fetching your bookings"
      />
      <div className="mx-auto w-full max-w-[1168px] px-6">
        <div className="flex w-full flex-col gap-4 min-[720px]:flex-row min-[720px]:flex-nowrap min-[720px]:items-end min-[720px]:gap-[10px]">
          <div className="w-full shrink-0 min-[720px]:w-[396px] min-[720px]:max-w-[396px]">
            <label className={FILTER_LABEL_CLASS} htmlFor="my-bookings-search">
              Search
            </label>
            <div className="relative">
              <span
                className="pointer-events-none absolute left-[15px] top-1/2 z-[1] -translate-y-1/2 text-[#9CA3AF]"
                aria-hidden
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                  <path
                    d="M16.5 16.5 21 21"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
              <input
                id="my-bookings-search"
                type="text"
                placeholder="Search for bookings"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoComplete="off"
                className={FILTER_SEARCH_INPUT_CLASS}
              />
            </div>
          </div>

          <div className="w-full shrink-0 min-[720px]:w-[120px]">
            <SearchableDropdown
              label="Types"
              labelClass={FILTER_LABEL_CLASS}
              options={MODE_OPTIONS}
              value={modeSelectValue}
              onChange={(v) => {
                const next =
                  v === "hotels"
                    ? "Hotels"
                    : v === "sightseeing"
                      ? "Sightseeing"
                      : v === "flights"
                        ? "Flights"
                        : "All";
                setModeFilter(next);
              }}
              placeholder="All"
              widthClass="w-full"
              className={FILTER_DROPDOWN_TRIGGER_CLASS}
              searchPlaceholder="Search"
              noInnerOptionsScroll
              hidePanelSearch
              cacheKey="my-bookings-mode"
            />
          </div>

          <div className="w-full shrink-0 min-[720px]:w-[120px]">
            <SearchableDropdown
              label="Status"
              labelClass={FILTER_LABEL_CLASS}
              options={STATUS_OPTIONS}
              value={statusSelectValue}
              onChange={(v) => {
                const next = parseStatusParam(v);
                setStatusFilter(next);
              }}
              placeholder="All"
              widthClass="w-full"
              className={FILTER_DROPDOWN_TRIGGER_CLASS}
              searchPlaceholder="Search"
              noInnerOptionsScroll
              hidePanelSearch
              cacheKey="my-bookings-status"
            />
          </div>

          <div className="w-full shrink-0 min-[720px]:w-[216px]">
            <span className={FILTER_LABEL_CLASS}>Filter by Date</span>
            <div
              className={`flex h-[50px] min-w-0 items-center gap-1.5 px-3 ${FILTER_FIELD_SHELL} [color-scheme:light]`}
            >
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="min-h-0 min-w-0 flex-1 cursor-pointer border-0 bg-transparent p-0 text-[14px] font-medium leading-none text-[#0A0C0F] outline-none"
                aria-label="From date"
              />
              <span
                className="shrink-0 select-none text-[14px] font-medium leading-none text-[#9CA3AF]"
                aria-hidden
              >
                –
              </span>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="min-h-0 min-w-0 flex-1 cursor-pointer border-0 bg-transparent p-0 text-[14px] font-medium leading-none text-[#0A0C0F] outline-none"
                aria-label="To date"
              />
              <span className="ml-0.5 shrink-0 text-[#9CA3AF]" aria-hidden>
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M4 11h16M7 11v8a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-8"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-8 w-full max-w-[1168px] px-6">
        {mode === "Flights" ? (
          <UserBookingsListing
            bookings={userMyFlightBooking}
            filterStatus={active}
            mode={"Flights" as TripMode}
            {...sharedListProps}
          />
        ) : mode === "Hotels" ? (
          <UserHotelBookingsListing
            filterStatus={active}
            bookings={userMyHotelBookings}
            {...sharedListProps}
          />
        ) : mode === "Sightseeing" ? (
          <UserSightseeingBookingsListing
            filterStatus={active}
            bookings={userSightseeingBookings}
            {...sharedListProps}
          />
        ) : (
          <div className="space-y-10">
            <UserBookingsListing
              bookings={userMyFlightBooking}
              filterStatus={active}
              mode={"Flights" as TripMode}
              {...sharedListProps}
            />
            <UserHotelBookingsListing
              filterStatus={active}
              bookings={userMyHotelBookings}
              {...sharedListProps}
            />
            <UserSightseeingBookingsListing
              filterStatus={active}
              bookings={userSightseeingBookings}
              {...sharedListProps}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBookingsPage;
