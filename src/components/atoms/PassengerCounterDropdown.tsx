import React, { useEffect, useMemo, useRef, useState } from "react";
import type { PassengerSchema, PaxKey } from "../../features/flights/types";

type Pax = { adults: number; kids: number; infants: number; seniors?: number };  // seniors optional now
type Props = {
    value?: Pax;
    onChange?: (p: Pax) => void;
    maxTotal?: number;
    schema?: PassengerSchema;    // <-- NEW (from API). If not provided, fallback to default A/K/I order.
};

const DEFAULT_SCHEMA: PassengerSchema = [
    { key: "adults", title: "Adults" },
    { key: "kids", title: "Children" },
    { key: "infants", title: "Infants" },
];

const pad2 = (n: number) => String(n).padStart(2, "0");

const IconBtn: React.FC<{
    disabled?: boolean;
    onClick: () => void;
    label: string;
    children: React.ReactNode;
}> = ({ disabled, onClick, label, children }) => (
    <button
        type="button"
        aria-label={label}
        onClick={onClick}
        disabled={disabled}
        className={`h-7 w-7 rounded-full flex items-center justify-center text-white text-[14px]
      ${disabled ? "bg-[#E6EEFF] text-[#9BB3E8] cursor-not-allowed" : "bg-[#2351A3]"}`}
    >
        {children}
    </button>
);

const Row: React.FC<{
    title: string;
    count: number;
    dec: () => void;
    inc: () => void;
    disableDec?: boolean;
    disableInc?: boolean;
}> = ({ title, count, dec, inc, disableDec, disableInc }) => (
    <div className="flex items-center justify-between py-2">
        <div>
            <div className="text-[13px] leading-5 text-[#0F172A]">
                {title}
                {/* {subtitle && ( // only show if exists
                    <span className="text-[11px] leading-4 text-[#3D495C] opacity-80">
                        {subtitle}
                    </span>
                )} */}
            </div>
        </div>
        <div className="flex items-center gap-3">
            <IconBtn label="decrease" onClick={dec} disabled={disableDec}>–</IconBtn>
            <span className="w-6 text-center text-[13px] text-[#0F172A]">{pad2(count)}</span>
            <IconBtn label="increase" onClick={inc} disabled={disableInc}>+</IconBtn>
        </div>
    </div>
);

const PassengerCounterDropdown: React.FC<Props> = ({ value, onChange, maxTotal = 9, schema }) => {
    // DEFAULTS: Adults=1, Kids=0, Infants=0
    const rows = schema && schema.length ? schema : DEFAULT_SCHEMA;
    const [pax, setPax] = useState<Pax>(
        value ?? {
            adults: 1,
            kids: 0,
            infants: 0,
            seniors: rows.find(r => r.key === "seniors") ? 0 : undefined
        }
    );
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);


    const total = useMemo(
        () => (pax.adults || 0) + (pax.kids || 0) + (pax.infants || 0) + (pax.seniors || 0),
        [pax]
    );

    // close on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    useEffect(() => void onChange?.(pax), [pax, onChange]);

    const canInc = (k: PaxKey) => {
        if (total >= maxTotal) return false;
        return true;
    };

    const inc = (k: PaxKey) =>
        canInc(k) && setPax(p => ({ ...p, [k]: ((p as any)[k] || 0) + 1 }));

    const dec = (k: PaxKey) =>
        setPax(p => {
            if (k === "adults") {
                const nextA = Math.max(0, (p.adults || 0) - 1);  // allow 0
                return { ...p, adults: nextA };                   // don't auto-trim infants
            }
            const cur = (p as any)[k] || 0;
            return { ...p, [k]: Math.max(0, cur - 1) };
        });

    return (
        <div className="relative" ref={ref}>
            {/* Trigger input look — chevron perfectly centered */}
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                className="h-11 w-full rounded-xl border border-[#DFE7F3] px-4 text-[14px] text-[#0F172A]
             focus:ring-2 focus:ring-[#2351A3]/20
             flex items-center justify-between leading-none"  // <= center fix
                aria-haspopup="dialog"
                aria-expanded={open}
            >
                <span className="tabular-nums">{pad2(total)} Passengers</span>   {/* <= SIRF NUMBER */}
                <svg
                    className="shrink-0"
                    width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden="true"
                >
                    <path d="M5 7.5l5 5 5-5" stroke="#2351A3" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </button>

            {open && (
                <div className="absolute z-30 mt-2 w-[300px] rounded-2xl bg-white border border-[#E7EEF7] shadow-[0_8px_22px_rgba(12,40,86,0.08)] p-3">
                    {rows.map((r, idx) => (
                        <React.Fragment key={r.key}>
                            <Row
                                title={r.title}
                                count={(pax as any)[r.key] || 0}
                                dec={() => dec(r.key)}
                                inc={() => inc(r.key)}
                                disableDec={((pax as any)[r.key] || 0) <= 0}
                                disableInc={!canInc(r.key)}
                            />
                            {idx < rows.length - 1 && <div className="h-px bg-[#EDEFF6]" />}
                        </React.Fragment>
                    ))}
                </div>
            )}
        </div>
    );
};

export default PassengerCounterDropdown;
