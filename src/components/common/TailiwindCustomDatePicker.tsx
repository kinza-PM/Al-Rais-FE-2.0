import React, { useEffect, useMemo, useRef, useState } from "react";
import Calendar from "../../assets/svgs/calendar.svg";

type DatePickerProps = {
    value?: Date | null;
    onChange?: (d: Date) => void;
    placeholder?: string;
    buttonIconSrc?: boolean; // calendar svg
    overridesClass?: boolean;
    showCalendarIconRight?: boolean;
    inputClass?: string;
};

const WEEKDAY_LABELS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

function startOfMonth(d: Date) {
    return new Date(d.getFullYear(), d.getMonth(), 1);
}
// function endOfMonth(d: Date) {
//     return new Date(d.getFullYear(), d.getMonth() + 1, 0);
// }
function addMonths(d: Date, n: number) {
    return new Date(d.getFullYear(), d.getMonth() + n, 1);
}
function isSameDay(a: Date, b: Date) {
    return a.getFullYear() === b.getFullYear() &&
        a.getMonth() === b.getMonth() &&
        a.getDate() === b.getDate();
}
function fmtLong(d?: Date | null) {
    if (!d) return "";
    const parts = new Intl.DateTimeFormat("en-GB", {
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric",
    }).formatToParts(d);

    const weekday = parts.find(p => p.type === "weekday")?.value ?? "";
    const day = parts.find(p => p.type === "day")?.value ?? "";
    const month = parts.find(p => p.type === "month")?.value ?? "";
    const year = parts.find(p => p.type === "year")?.value ?? "";

    return `${weekday}, ${Number(day)} ${month} ${year}`;
}


const TailiwindCustomDatePicker: React.FC<DatePickerProps> = ({
    value = null,
    onChange = () => { },
    placeholder = "Please select",
    buttonIconSrc,
    overridesClass = false,
    showCalendarIconRight = true,
    inputClass = null
}) => {
    const [open, setOpen] = useState(false);
    const [view, setView] = useState<Date>(() => value ?? new Date());
    const rootRef = useRef<HTMLDivElement>(null);

    // Close on outside click
    useEffect(() => {
        const onDocClick = (e: MouseEvent) => {
            if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
        };
        if (open) document.addEventListener("mousedown", onDocClick);
        return () => document.removeEventListener("mousedown", onDocClick);
    }, [open]);

    const monthName = useMemo(
        () => new Intl.DateTimeFormat("en-GB", { month: "long" }).format(view),
        [view]
    );
    const yearNum = useMemo(() => view.getFullYear(), [view]);

    // Build calendar grid (Mon–Sun)
    const days = useMemo(() => {
        const start = startOfMonth(view);
        // const end = endOfMonth(view);

        // JS: 0=Sun … 6=Sat; we want Mon=0 … Sun=6
        const jsDow = start.getDay();          // 0..6
        const monFirstIndex = (jsDow + 6) % 7; // shift so Monday=0
        const firstGridDate = new Date(start);
        firstGridDate.setDate(start.getDate() - monFirstIndex);

        const totalCells = 6 * 7; // 6 rows x 7 cols
        const cells: { date: Date; inMonth: boolean; isToday: boolean; isSelected: boolean }[] = [];
        const today = new Date();

        for (let i = 0; i < totalCells; i++) {
            const d = new Date(firstGridDate);
            d.setDate(firstGridDate.getDate() + i);
            cells.push({
                date: d,
                inMonth: d.getMonth() === view.getMonth(),
                isToday: isSameDay(d, today),
                isSelected: value ? isSameDay(d, value) : false,
            });
        }
        return cells;
    }, [view, value]);

    return (
        <div ref={rootRef} className="relative">
            {/* Display input */}
            <div className="relative">
                <input
                    readOnly
                    value={fmtLong(value) || ""}
                    placeholder={placeholder}
                    onClick={() => setOpen(true)}
                    className={`${overridesClass ? inputClass : "h-11 w-full rounded-xl border border-[#DFE7F3] pl-4 pr-10 text-[14px] text-[#0F172A] outline-none cursor-pointer"}`}
                    // className={`${overridesClass ? inputClass : "h-11 w-full rounded-xl border border-[#DFE7F3] pl-4 pr-10 text-[14px] text-[#0F172A] outline-none focus:ring-2 focus:ring-[#2351A3]/20 cursor-pointer"}`}
                />
                <button
                    type="button"
                    onClick={() => setOpen(o => !o)}
                    aria-label="Open calendar"
                    className={`absolute inset-y-0 ${showCalendarIconRight ? "right-3" : "left-3"} flex items-center`}
                >
                    {buttonIconSrc ? (
                        <img src={Calendar} alt="calendar" className="w-[16px] h-[16px]" />
                    ) : (
                        <svg width="16" height="16" viewBox="0 0 24 24">
                            <path d="M7 2v2M17 2v2M3 10h18M5 6h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z" stroke="#2351A3" fill="none" strokeWidth="1.6" strokeLinecap="round" />
                        </svg>
                    )}
                </button>
            </div>

            {/* Popup calendar */}
            {open && (
                <div
                    className="absolute z-[9999] mt-2 w-[280px] rounded-2xl border border-[#DFE7F3] bg-white shadow-[0_12px_30px_rgba(16,24,40,0.12)]"
                >
                    {/* Month header */}
                    <div className="flex items-center justify-between px-3 pt-3">
                        <button
                            type="button"
                            className="p-2 rounded-lg hover:bg-[#F4F7FC]"
                            onClick={() => setView(v => addMonths(v, -1))}
                            aria-label="Previous month"
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24">
                                <path d="M15 19l-7-7 7-7" stroke="#2351A3" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </button>

                        <div className="flex items-center justify-center gap-2 rounded-md bg-[#2351A3] text-white text-[12px] font-medium">
                            <span className="px-3 py-1">
                                {monthName}  {yearNum}
                            </span>
                        </div>

                        <button
                            type="button"
                            className="p-2 rounded-lg hover:bg-[#F4F7FC]"
                            onClick={() => setView(v => addMonths(v, 1))}
                            aria-label="Next month"
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24">
                                <path d="M9 5l7 7-7 7" stroke="#2351A3" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </button>
                    </div>

                    {/* Weekdays */}
                    <div className="grid grid-cols-7 gap-0 px-4 pt-2 text-center text-[12px]">
                        {WEEKDAY_LABELS.map((w, idx) => (
                            <div key={w} className={`py-1 ${idx >= 5 ? "text-[#E65959]" : "text-[#8A94A6]"}`}>
                                {w}
                            </div>
                        ))}
                    </div>

                    {/* Days grid */}
                    <div className="grid grid-cols-7 gap-1 px-3 pb-3 pt-1">
                        {days.map(({ date, inMonth, isToday, isSelected }) => {
                            const base = "h-9 w-9 mx-auto flex items-center justify-center rounded-md text-[13px] transition";
                            const outMonth = !inMonth ? "text-[#B8C1D1]" : "";
                            const isWeekend = [6, 0].includes(date.getDay());
                            const weekendColor = inMonth && !isSelected ? (isWeekend ? "text-[#E65959]" : "text-[#0F172A]") : "";
                            const selected = isSelected ? "bg-[#2351A3] text-white" : "hover:bg-[#F4F7FC]";
                            const todayRing = isToday && !isSelected ? "ring-1 ring-[#2351A3]" : "";

                            return (
                                <button
                                    key={date.toISOString()}
                                    type="button"
                                    className={`${base} ${outMonth} ${weekendColor} ${selected} ${todayRing}`}
                                    onClick={() => { onChange(date); setOpen(false); }}
                                >
                                    {date.getDate()}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

export default TailiwindCustomDatePicker;
