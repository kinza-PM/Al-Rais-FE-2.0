import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Calendar from "../../assets/svgs/calendar.svg";

const POPUP_WIDTH = 300;
const POPUP_HEIGHT = 360;
const GAP = 8;
const VIEWPORT_PADDING = 16;

type DatePickerProps = {
  value?: Date | null;
  onChange?: (d: Date) => void;
  placeholder?: string;
  buttonIconSrc?: boolean; // calendar svg
  overridesClass?: boolean;
  showCalendarIconRight?: boolean;
  inputClass?: string;
  error?: string | null;
  disablePastDates?: boolean;
  /** When set, dates before this (at start-of-day) are disabled. Use e.g. for return date >= departure. */
  minDate?: Date | null;
  /** When set, dates after this calendar day are disabled (e.g. birth date or booking window end). */
  maxDate?: Date | null;
  tooltip?: string | null;
};

const WEEKDAY_LABELS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

type ViewMode = "calendar" | "month" | "year";

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}
// function endOfMonth(d: Date) {
//     return new Date(d.getFullYear(), d.getMonth() + 1, 0);
// }
function addMonths(d: Date, n: number) {
  return new Date(d.getFullYear(), d.getMonth() + n, 1);
}
function addYears(d: Date, n: number) {
  return new Date(d.getFullYear() + n, d.getMonth(), 1);
}
function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}
function fmtLong(d?: Date | null) {
  if (!d) return "";
  const parts = new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).formatToParts(d);

  const weekday = parts.find((p) => p.type === "weekday")?.value ?? "";
  const day = parts.find((p) => p.type === "day")?.value ?? "";
  const month = parts.find((p) => p.type === "month")?.value ?? "";
  const year = parts.find((p) => p.type === "year")?.value ?? "";

  return `${weekday}, ${Number(day)} ${month} ${year}`;
}

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

const TailiwindCustomDatePicker: React.FC<DatePickerProps> = ({
  value = null,
  onChange = () => {},
  placeholder = "Please select",
  buttonIconSrc,
  overridesClass = false,
  showCalendarIconRight = true,
  inputClass = null,
  error = null,
  disablePastDates = false,
  minDate = null,
  maxDate = null,
  tooltip = null,
}) => {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<Date>(() => value ?? new Date());
  const [viewMode, setViewMode] = useState<ViewMode>("calendar");
  const [yearViewStart, setYearViewStart] = useState(() => {
    const currentYear = (value ?? new Date()).getFullYear();
    return Math.floor(currentYear / 12) * 12; // Start from a multiple of 12
  });
  const rootRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [popupPosition, setPopupPosition] = useState({ top: 0, left: 0, openAbove: false });

  // Compute popup position (viewport-aware) when open
  useLayoutEffect(() => {
    if (!open || !rootRef.current) return;
    const rect = rootRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    const openAbove = spaceBelow < POPUP_HEIGHT + GAP && spaceAbove >= POPUP_HEIGHT + GAP;

    let top: number;
    if (openAbove) {
      top = rect.top - POPUP_HEIGHT - GAP;
    } else {
      top = rect.bottom + GAP;
    }

    let left = rect.left;
    if (left + POPUP_WIDTH > window.innerWidth - VIEWPORT_PADDING) {
      left = window.innerWidth - POPUP_WIDTH - VIEWPORT_PADDING;
    } else if (left < VIEWPORT_PADDING) {
      left = VIEWPORT_PADDING;
    }

    setPopupPosition({ top, left, openAbove });
  }, [open]);

  // Close on outside click (including when popup is in portal)
  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        !rootRef.current?.contains(target) &&
        !panelRef.current?.contains(target)
      ) {
        setOpen(false);
        setViewMode("calendar");
      }
    };
    if (open) document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);

  // Reset view mode when calendar closes
  useEffect(() => {
    if (!open) {
      setViewMode("calendar");
    }
  }, [open]);

  // Close on ESC key
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  const monthName = useMemo(
    () => new Intl.DateTimeFormat("en-GB", { month: "long" }).format(view),
    [view],
  );
  const yearNum = useMemo(() => view.getFullYear(), [view]);

  // Generate years for year picker (12 years per view)
  const yearRange = useMemo(() => {
    const years: number[] = [];
    for (let i = 0; i < 12; i++) {
      years.push(yearViewStart + i);
    }
    return years;
  }, [yearViewStart]);

  // Handle month selection
  const handleMonthSelect = (monthIndex: number) => {
    setView(new Date(view.getFullYear(), monthIndex, 1));
    setViewMode("calendar");
  };

  // Handle year selection
  const handleYearSelect = (year: number) => {
    setView(new Date(year, view.getMonth(), 1));
    setViewMode("month");
  };

  // Build calendar grid (Mon–Sun)
  const days = useMemo(() => {
    const start = startOfMonth(view);
    // const end = endOfMonth(view);

    // JS: 0=Sun … 6=Sat; we want Mon=0 … Sun=6
    const jsDow = start.getDay(); // 0..6
    const monFirstIndex = (jsDow + 6) % 7; // shift so Monday=0
    const firstGridDate = new Date(start);
    firstGridDate.setDate(start.getDate() - monFirstIndex);

    const totalCells = 6 * 7; // 6 rows x 7 cols
    const cells: {
      date: Date;
      inMonth: boolean;
      isToday: boolean;
      isSelected: boolean;
      isPast: boolean;
      isBeforeMin: boolean;
      isAfterMax: boolean;
    }[] = [];
    const today = new Date();
    const minDateStart = minDate ? startOfDay(minDate) : null;
    const maxDateStart = maxDate ? startOfDay(maxDate) : null;

    for (let i = 0; i < totalCells; i++) {
      const d = new Date(firstGridDate);
      d.setDate(firstGridDate.getDate() + i);
      const inMonth = d.getMonth() === view.getMonth();
      const isToday = isSameDay(d, today);
      const isSelected = value ? isSameDay(d, value) : false;
      const isPast = d.getTime() < today.getTime() && !isToday;
      const isBeforeMin =
        minDateStart !== null ? startOfDay(d) < minDateStart : false;
      const isAfterMax =
        maxDateStart !== null ? startOfDay(d) > maxDateStart : false;
      cells.push({
        date: d,
        inMonth,
        isToday,
        isSelected,
        isPast,
        isBeforeMin,
        isAfterMax,
      });
    }
    return cells;
  }, [view, value, disablePastDates, minDate, maxDate]);

  return (
    <div ref={rootRef} className="relative">
      {/* Display input */}
      <div className="group relative">
        <input
          readOnly
          value={fmtLong(value) || ""}
          placeholder={placeholder}
          onClick={() => setOpen(true)}
          //   className={`${
          //     overridesClass
          //       ? inputClass
          //       : `h-11 w-full rounded-xl border ${
          //           error ? "border-[#E65959]" : "border-[#DFE7F3]"
          //         } pl-4 pr-10 text-[14px] text-[#0F172A] outline-none cursor-pointer`
          //   }`}
          className={`${
            overridesClass
              ? inputClass
              : `h-[50px] w-full rounded-[16px] border pl-4 pr-10 text-[14px] text-[#0F172A] outline-none cursor-pointer ${
                  error ? "border-[#E65959]" : "border-[#C2CAD6]"
                }`
          }`}
        />
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-label="Open calendar"
          className={`absolute inset-y-0 ${
            showCalendarIconRight ? "right-3" : "left-3"
          } flex items-center`}
        >
          {buttonIconSrc ? (
            <img src={Calendar} alt="calendar" className="w-[16px] h-[16px]" />
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24">
              <path
                d="M7 2v2M17 2v2M3 10h18M5 6h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z"
                stroke="#2351A3"
                fill="none"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
          )}
        </button>
        {tooltip && (
          <div
            className={`
            pointer-events-none absolute bottom-full left-full -translate-x-1/3 mb-3
            hidden group-hover:block z-50
            px-3 py-2 text-xs leading-5 text-white
            bg-[#1E293B] rounded-lg shadow-lg
            whitespace-nowrap
            transition-all duration-150 opacity-0 group-hover:opacity-100
            before:content-[''] before:absolute before:top-full before:left-1/2
            before:-translate-x-1/2 before:border-6 before:border-transparent
            before:border-t-[#1E293B]
          `}
          >
            <div className="text-center">
              {value ? fmtLong(value) : tooltip}
            </div>
          </div>
        )}
      </div>
      {error && (
        <p className="absolute top-full left-2 mt-1 text-[12px] text-[#E65959] whitespace-nowrap">
          {error}
        </p>
      )}

      {/* Popup calendar - rendered via portal for viewport-aware positioning */}
      {open && (createPortal(
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-label="Calendar"
          style={{
            position: "fixed",
            top: popupPosition.top,
            left: popupPosition.left,
            width: POPUP_WIDTH,
            zIndex: 99999,
          }}
          className="rounded-2xl border border-[#DFE7F3] bg-white shadow-[0_12px_30px_rgba(16,24,40,0.12)]"
        >
          {/* Month header */}
          <div className="flex items-center justify-between px-3 pt-3">
            <button
              type="button"
              className="p-2 rounded-lg hover:bg-[#F4F7FC] transition-colors"
              onClick={() => {
                if (viewMode === "calendar") {
                  setView((v) => addMonths(v, -1));
                } else if (viewMode === "month") {
                  setView((v) => addYears(v, -1));
                } else if (viewMode === "year") {
                  setYearViewStart((y) => y - 12);
                }
              }}
              aria-label={
                viewMode === "calendar"
                  ? "Previous month"
                  : viewMode === "month"
                    ? "Previous year"
                    : "Previous years"
              }
            >
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path
                  d="M15 19l-7-7 7-7"
                  stroke="#2351A3"
                  strokeWidth="1.8"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            <button
              type="button"
              onClick={() => {
                if (viewMode === "calendar") {
                  setViewMode("month");
                } else if (viewMode === "month") {
                  setYearViewStart(Math.floor(view.getFullYear() / 12) * 12);
                  setViewMode("year");
                }
              }}
              className="flex items-center justify-center gap-2 rounded-md bg-[#2351A3] text-white text-[12px] font-medium hover:bg-[#1a3d7a] transition-colors cursor-pointer"
            >
              <span className="px-3 py-1">
                {viewMode === "calendar" && `${monthName} ${yearNum}`}
                {viewMode === "month" && yearNum}
                {viewMode === "year" &&
                  `${yearViewStart} - ${yearViewStart + 11}`}
              </span>
            </button>

            <button
              type="button"
              className="p-2 rounded-lg hover:bg-[#F4F7FC] transition-colors"
              onClick={() => {
                if (viewMode === "calendar") {
                  setView((v) => addMonths(v, 1));
                } else if (viewMode === "month") {
                  setView((v) => addYears(v, 1));
                } else if (viewMode === "year") {
                  setYearViewStart((y) => y + 12);
                }
              }}
              aria-label={
                viewMode === "calendar"
                  ? "Next month"
                  : viewMode === "month"
                    ? "Next year"
                    : "Next years"
              }
            >
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path
                  d="M9 5l7 7-7 7"
                  stroke="#2351A3"
                  strokeWidth="1.8"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>

          {/* Calendar View */}
          {viewMode === "calendar" && (
            <>
              {/* Weekdays */}
              <div className="grid grid-cols-7 gap-0 px-4 pt-2 text-center text-[12px]">
                {WEEKDAY_LABELS.map((w, idx) => (
                  <div
                    key={w}
                    className={`py-1 ${
                      idx >= 5 ? "text-[#E65959]" : "text-[#8A94A6]"
                    }`}
                  >
                    {w}
                  </div>
                ))}
              </div>

              {/* Days grid */}
              <div className="grid grid-cols-7 gap-1 px-3 pb-3 pt-1">
                {days.map(
                  ({
                    date,
                    inMonth,
                    isToday,
                    isSelected,
                    isPast,
                    isBeforeMin,
                    isAfterMax,
                  }) => {
                    const base =
                      "h-9 w-9 mx-auto flex items-center justify-center rounded-md text-[13px] transition";
                    const outMonth = !inMonth ? "text-[#B8C1D1]" : "";
                    const isWeekend = [6, 0].includes(date.getDay());
                    const weekendColor =
                      inMonth && !isSelected
                        ? isWeekend
                          ? "text-[#E65959]"
                          : "text-[#0F172A]"
                        : "";
                    const selected = isSelected
                      ? "bg-[#2351A3] text-white"
                      : "hover:bg-[#F4F7FC]";
                    const todayRing =
                      isToday && !isSelected ? "ring-1 ring-[#2351A3]" : "";

                    const isDisabled =
                      (disablePastDates && isPast) ||
                      isBeforeMin ||
                      isAfterMax;
                    const disabledVisual = isDisabled
                      ? "opacity-50 cursor-not-allowed hover:bg-transparent"
                      : "";

                    return (
                      <button
                        key={date.toISOString()}
                        type="button"
                        className={`${base} ${outMonth} ${weekendColor} ${selected} ${todayRing} ${disabledVisual}`}
                        onClick={() => {
                          onChange(date);
                          setOpen(false);
                        }}
                        disabled={isDisabled}
                        aria-disabled={isDisabled}
                      >
                        {date.getDate()}
                      </button>
                    );
                  },
                )}
              </div>
            </>
          )}

          {/* Month Picker View */}
          {viewMode === "month" && (
            <div className="grid grid-cols-3 gap-2 px-3 pb-3 pt-2">
              {MONTH_NAMES.map((month, index) => {
                const isCurrentMonth = index === view.getMonth();
                const isSelected =
                  isCurrentMonth && yearNum === view.getFullYear();
                const monthDate = new Date(view.getFullYear(), index, 1);
                const today = new Date();
                const isPast =
                  disablePastDates &&
                  monthDate.getTime() <
                    new Date(today.getFullYear(), today.getMonth(), 1).getTime();
                const isBeforeMin =
                  minDate &&
                  monthDate.getTime() <
                    new Date(
                      minDate.getFullYear(),
                      minDate.getMonth(),
                      1,
                    ).getTime();
                const isAfterMax =
                  maxDate &&
                  (monthDate.getFullYear() > maxDate.getFullYear() ||
                    (monthDate.getFullYear() === maxDate.getFullYear() &&
                      monthDate.getMonth() > maxDate.getMonth()));
                const isDisabled = !!isPast || !!isBeforeMin || !!isAfterMax;

                return (
                  <button
                    key={month}
                    type="button"
                    onClick={() => !isDisabled && handleMonthSelect(index)}
                    disabled={isDisabled}
                    className={`
                      h-10 rounded-lg text-[13px] font-medium transition-colors
                      ${
                        isSelected
                          ? "bg-[#2351A3] text-white"
                          : isDisabled
                            ? "text-[#B8C1D1] cursor-not-allowed opacity-50"
                            : "text-[#0F172A] hover:bg-[#F4F7FC]"
                      }
                    `}
                  >
                    {month.slice(0, 3)}
                  </button>
                );
              })}
            </div>
          )}

          {/* Year Picker View */}
          {viewMode === "year" && (
            <div className="grid grid-cols-3 gap-2 px-3 pb-3 pt-2">
              {yearRange.map((year) => {
                const isCurrentYear = year === view.getFullYear();
                const today = new Date();
                const isPast =
                  disablePastDates && year < today.getFullYear();
                const isBeforeMin = minDate && year < minDate.getFullYear();
                const isAfterMax = maxDate && year > maxDate.getFullYear();
                const isDisabled = !!isPast || !!isBeforeMin || !!isAfterMax;

                return (
                  <button
                    key={year}
                    type="button"
                    onClick={() => !isDisabled && handleYearSelect(year)}
                    disabled={isDisabled}
                    className={`
                      h-10 rounded-lg text-[13px] font-medium transition-colors
                      ${
                        isCurrentYear
                          ? "bg-[#2351A3] text-white"
                          : isDisabled
                            ? "text-[#B8C1D1] cursor-not-allowed opacity-50"
                            : "text-[#0F172A] hover:bg-[#F4F7FC]"
                      }
                    `}
                  >
                    {year}
                  </button>
                );
              })}
            </div>
          )}
        </div>,
        document.body
      ))}
    </div>
  );
};

export default TailiwindCustomDatePicker;
