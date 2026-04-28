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
import Loader from "../components/atoms/Loader";
import {
  mergeSightseeingBookingLists,
  transformBookingsResponse,
  transformHotelBookingsResponse,
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
import TailiwindCustomDatePicker from "../components/common/TailiwindCustomDatePicker";
import { convertDateToString } from "../utils/hotelBookingParams";
import CalendarIcon from "../assets/svgs/calendar.svg";
import "../assets/css/travel.css";

const statusTabs = [
  "All",
  "Pending",
  "Confirmed",
  "Expired",
  "Cancelled",
] as const;

/**
 * My Bookings filter bar — Types/Status triggers match hotel `hotel-date-range-row`:
 * 50px tall, 1px #c2cad6 border, 16px radius (see travel.css).
 */
const FILTER_LABEL_CLASS =
  "mb-[5px] block text-[12px] font-normal leading-none text-[#3D495C]";

/** Shared typography for Types, Status, and date-range field text (size, weight, color). */
const FILTER_FIELD_VALUE_TEXT_CLASS =
  "text-[14px] font-medium leading-normal text-[#0A0C0F] antialiased";

const FILTER_DROPDOWN_TRIGGER_CLASS = `box-border appearance-none h-[50px] w-full rounded-[16px] border border-[#C2CAD6] bg-white pl-[15px] pr-12 outline-none flex min-w-0 items-center cursor-pointer transition-colors focus:border-[#5383DA] focus:ring-2 focus:ring-[#5383DA]/15 disabled:cursor-not-allowed disabled:opacity-60 ${FILTER_FIELD_VALUE_TEXT_CLASS}`;

const FILTER_DROPDOWN_VALUE_CLASS = FILTER_FIELD_VALUE_TEXT_CLASS;

const FILTER_DATE_INPUT_CLASS = `hotel-date-range-input !pl-2 !pr-0.5 ${FILTER_FIELD_VALUE_TEXT_CLASS} !text-[#0A0C0F] placeholder:!font-medium placeholder:!text-[#0A0C0F]`;

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

  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const myBookingsDateFromWrapRef = useRef<HTMLDivElement>(null);
  const myBookingsDateToWrapRef = useRef<HTMLDivElement>(null);

  const openMyBookingsRangeCalendar = useCallback(() => {
    const fromInput = myBookingsDateFromWrapRef.current?.querySelector(
      "input",
    ) as HTMLInputElement | null | undefined;
    const toInput = myBookingsDateToWrapRef.current?.querySelector("input") as
      | HTMLInputElement
      | null
      | undefined;
    if (!dateFrom && fromInput) {
      fromInput.click();
      return;
    }
    toInput?.click();
  }, [dateFrom]);

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

  const showBookingsLoader =
    ((mode === "Flights" || mode === "All") && isPending) ||
    ((mode === "Hotels" || mode === "All") && isHotelPending);

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
    if (mode !== "Sightseeing" && mode !== "All") return;
    const local = getLocalSightseeingBookings();
    const merged = mergeSightseeingBookingLists([], local);
    setUserSightseeingBookings(merged);
  }, [mode, active]);

  const sharedListProps = useMemo(
    () => ({
      dateFrom,
      dateTo,
    }),
    [dateFrom, dateTo],
  );

  return (
    <div className="py-6">
      <Loader
        show={showBookingsLoader}
        label="Please wait while we are fetching your bookings"
      />
      <div className="mx-auto w-full max-w-[1168px] px-6">
        <div className="flex w-full flex-col gap-4 min-[640px]:flex-row min-[640px]:items-end min-[640px]:justify-between">
          {/* LEFT SIDE: Types + Status */}
          <div className="flex w-full flex-col gap-3 min-[640px]:w-auto min-[640px]:flex-row min-[640px]:items-end min-[640px]:gap-4">
            {/* Types */}
            <div className="w-full min-[640px]:w-[120px] min-[640px]:shrink-0">
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
                selectedValueClassName={FILTER_DROPDOWN_VALUE_CLASS}
                placeholderValueClassName={FILTER_DROPDOWN_VALUE_CLASS}
                noInnerOptionsScroll
                hidePanelSearch
                cacheKey="my-bookings-mode"
              />
            </div>

            {/* Status */}
            <div className="w-full min-[640px]:w-[120px] min-[640px]:shrink-0">
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
                selectedValueClassName={FILTER_DROPDOWN_VALUE_CLASS}
                placeholderValueClassName={FILTER_DROPDOWN_VALUE_CLASS}
                noInnerOptionsScroll
                hidePanelSearch
                cacheKey="my-bookings-status"
              />
            </div>
          </div>

          {/* RIGHT SIDE: Filter by Date (UNCHANGED) */}
          <div className="w-full min-w-0 min-[540px]:w-[360px] min-[540px]:shrink-0">
            <span className={FILTER_LABEL_CLASS}>Filter by Date</span>

            <div className="hotel-date-range-row">
              <div
                ref={myBookingsDateFromWrapRef}
                className="min-w-0 flex-1 basis-0"
              >
                <TailiwindCustomDatePicker
                  value={dateFrom ? new Date(dateFrom) : null}
                  onChange={(date) => {
                    const dateStr = convertDateToString(date);
                    setDateFrom(dateStr);
                    if (dateTo && dateStr && dateTo < dateStr) setDateTo("");
                  }}
                  placeholder="From"
                  buttonIconSrc={true}
                  overridesClass={true}
                  showCalendarIconRight={false}
                  hideCalendarButton
                  inputClass={FILTER_DATE_INPUT_CLASS}
                  disablePastDates={false}
                  tooltip="Select from date"
                />
              </div>

              <span
                className={`shrink-0 select-none ${FILTER_FIELD_VALUE_TEXT_CLASS}`}
                aria-hidden
              >
                —
              </span>

              <div
                ref={myBookingsDateToWrapRef}
                className="min-w-0 flex-1 basis-0"
              >
                <TailiwindCustomDatePicker
                  value={dateTo ? new Date(dateTo) : null}
                  onChange={(date) => setDateTo(convertDateToString(date))}
                  placeholder="To"
                  buttonIconSrc={true}
                  overridesClass={true}
                  showCalendarIconRight={false}
                  hideCalendarButton
                  inputClass={FILTER_DATE_INPUT_CLASS}
                  disablePastDates={false}
                  minDate={dateFrom ? new Date(dateFrom) : null}
                  tooltip="Select to date"
                />
              </div>

              <button
                type="button"
                onClick={openMyBookingsRangeCalendar}
                className="flex h-8 w-8 shrink-0 items-center justify-center self-center rounded-md text-[#64748B] transition-colors hover:bg-[#F1F5F9]"
                aria-label="Open calendar"
              >
                <img
                  src={CalendarIcon}
                  alt=""
                  className="pointer-events-none h-4 w-4 opacity-80"
                />
              </button>

              {(dateFrom || dateTo) && (
                <button
                  type="button"
                  onClick={() => {
                    setDateFrom("");
                    setDateTo("");
                  }}
                  className="flex h-8 w-8 shrink-0 items-center justify-center self-center rounded-md text-[#94A3B8] transition-colors hover:bg-[#F1F5F9] hover:text-[#64748B]"
                  aria-label="Clear date filter"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M18 6 6 18M6 6l12 12"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
              )}
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
