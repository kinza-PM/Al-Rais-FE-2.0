import React, {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";

const POPUP_WIDTH = 300;
const POPUP_HEIGHT = 300;
const GAP = 8;
const VIEWPORT_PADDING = 16;

const HOUR_OPTIONS = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
const MINUTE_OPTIONS = Array.from({ length: 60 }, (_, i) => i);

export type TimePickerProps = {
  /** 24h `HH:mm` (e.g. `04:38`), empty when unset */
  value?: string;
  onChange?: (hhmm: string) => void;
  placeholder?: string;
  overridesClass?: boolean;
  inputClass?: string | null;
  error?: string | null;
};

function parseHHMM24(s: string | undefined): { h24: number; m: number } | null {
  const t = s?.trim();
  if (!t || !/^\d{1,2}:\d{2}$/.test(t)) return null;
  const [a, b] = t.split(":");
  const h24 = parseInt(a, 10);
  const m = parseInt(b, 10);
  if (
    Number.isNaN(h24) ||
    Number.isNaN(m) ||
    h24 < 0 ||
    h24 > 23 ||
    m < 0 ||
    m > 59
  ) {
    return null;
  }
  return { h24, m };
}

function from24h(h24: number): { h12: number; pm: boolean } {
  const pm = h24 >= 12;
  let h12 = h24 % 12;
  if (h12 === 0) h12 = 12;
  return { h12, pm };
}

function toHHMM24(h12: number, minute: number, pm: boolean): string {
  let h24: number;
  if (!pm) {
    h24 = h12 === 12 ? 0 : h12;
  } else {
    h24 = h12 === 12 ? 12 : h12 + 12;
  }
  return `${String(h24).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

function format12hDisplay(h12: number, minute: number, pm: boolean): string {
  const period = pm ? "PM" : "AM";
  return `${h12}:${String(minute).padStart(2, "0")} ${period}`;
}

const TailiwindCustomTimePicker: React.FC<TimePickerProps> = ({
  value = "",
  onChange = () => {},
  placeholder = "Please select",
  overridesClass = false,
  inputClass = null,
  error = null,
}) => {
  const [open, setOpen] = useState(false);
  const [h12, setH12] = useState(9);
  const [minute, setMinute] = useState(0);
  const [pm, setPm] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [popupPosition, setPopupPosition] = useState({
    top: 0,
    left: 0,
    openAbove: false,
  });

  useLayoutEffect(() => {
    if (!open) return;
    const parsed = parseHHMM24(value);
    if (parsed) {
      const c = from24h(parsed.h24);
      setH12(c.h12);
      setMinute(parsed.m);
      setPm(c.pm);
    } else {
      setH12(9);
      setMinute(0);
      setPm(false);
    }
  }, [open, value]);

  const pushChange = (nextH: number, nextM: number, nextPm: boolean) => {
    onChange(toHHMM24(nextH, nextM, nextPm));
  };

  useLayoutEffect(() => {
    if (!open || !rootRef.current) return;
    const rect = rootRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    const openAbove =
      spaceBelow < POPUP_HEIGHT + GAP && spaceAbove >= POPUP_HEIGHT + GAP;
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

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        !rootRef.current?.contains(target) &&
        !panelRef.current?.contains(target)
      ) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) setOpen(false);
    };
    if (open) document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  const parsedValue = parseHHMM24(value);
  const display =
    parsedValue !== null
      ? (() => {
          const { h12: dh, pm: dp } = from24h(parsedValue.h24);
          return format12hDisplay(dh, parsedValue.m, dp);
        })()
      : "";

  return (
    <div ref={rootRef} className="relative">
      <div className="group relative">
        <input
          readOnly
          value={display}
          placeholder={placeholder}
          onClick={() => setOpen(true)}
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
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => setOpen((o) => !o)}
          aria-label="Open time picker"
          className="absolute inset-y-0 right-3 flex items-center"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden>
            <circle
              cx="12"
              cy="12"
              r="9"
              stroke="#2351A3"
              fill="none"
              strokeWidth="1.6"
            />
            <path
              d="M12 7v6l4 2"
              stroke="#2351A3"
              fill="none"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>
      {error && (
        <p className="absolute top-full left-2 mt-1 text-[12px] text-[#E65959] whitespace-nowrap">
          {error}
        </p>
      )}

      {open && (
        createPortal(
          <div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label="Time"
            onMouseDown={(e) => e.stopPropagation()}
            style={{
              position: "fixed",
              top: popupPosition.top,
              left: popupPosition.left,
              width: POPUP_WIDTH,
              zIndex: 99999,
            }}
            className="rounded-2xl border border-[#DFE7F3] bg-white shadow-[0_12px_30px_rgba(16,24,40,0.12)]"
          >
            <p className="border-b border-[#F4F7FC] px-3 py-2 text-center text-[12px] font-medium text-[#64748B]">
              Pick-up time
            </p>
            <div className="flex gap-2 px-3 pt-3">
              <div className="min-w-0 flex-1">
                <p className="mb-1 text-[11px] font-medium text-[#8A94A6]">
                  Hour
                </p>
                <div className="grid max-h-[200px] grid-cols-3 gap-1 overflow-y-auto pr-0.5">
                  {HOUR_OPTIONS.map((h) => (
                    <button
                      key={h}
                      type="button"
                      onClick={() => {
                        setH12(h);
                        pushChange(h, minute, pm);
                      }}
                      className={`h-9 rounded-md text-[13px] font-medium transition ${
                        h12 === h
                          ? "bg-[#2351A3] text-white"
                          : "text-[#0F172A] hover:bg-[#F4F7FC]"
                      }`}
                    >
                      {h}
                    </button>
                  ))}
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <p className="mb-1 text-[11px] font-medium text-[#8A94A6]">
                  Minute
                </p>
                <div className="flex max-h-[200px] flex-col gap-0.5 overflow-y-auto pr-1">
                  {MINUTE_OPTIONS.map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => {
                        setMinute(m);
                        pushChange(h12, m, pm);
                      }}
                      className={`min-h-8 shrink-0 rounded-md px-2 text-left text-[13px] font-medium transition ${
                        minute === m
                          ? "bg-[#2351A3] text-white"
                          : "text-[#0F172A] hover:bg-[#F4F7FC]"
                      }`}
                    >
                      {String(m).padStart(2, "0")}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-2 px-3 pb-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setPm(false);
                  pushChange(h12, minute, false);
                }}
                className={`h-10 flex-1 rounded-lg text-[13px] font-semibold transition ${
                  !pm
                    ? "bg-[#2351A3] text-white"
                    : "border border-[#DFE7F3] bg-white text-[#0F172A] hover:bg-[#F4F7FC]"
                }`}
              >
                AM
              </button>
              <button
                type="button"
                onClick={() => {
                  setPm(true);
                  pushChange(h12, minute, true);
                }}
                className={`h-10 flex-1 rounded-lg text-[13px] font-semibold transition ${
                  pm
                    ? "bg-[#2351A3] text-white"
                    : "border border-[#DFE7F3] bg-white text-[#0F172A] hover:bg-[#F4F7FC]"
                }`}
              >
                PM
              </button>
            </div>
          </div>,
          document.body,
        )
      )}
    </div>
  );
};

export default TailiwindCustomTimePicker;
