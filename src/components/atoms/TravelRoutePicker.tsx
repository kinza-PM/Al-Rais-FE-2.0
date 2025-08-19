// components/common/TravelRoutePicker.tsx
import React from "react";
import DoubledArrow from "../../assets/svgs/doubled-arrow.svg";
import type { CountryOption } from "../../features/flights/types";

type Value = { fromCode: string; toCode: string };

type Props = {
    options: CountryOption[];
    loading?: boolean;
    value: Value;
    onChange: (v: Value) => void;
    showSwap?: boolean;
    labels?: { from?: string; to?: string };
    placeholders?: { from?: string; to?: string };
    disableSameSelection?: boolean;
    widthClass?: string;
};

const TravelRoutePicker: React.FC<Props> = ({
    options,
    loading,
    value,
    onChange,
    showSwap = true,
    labels = { from: "From", to: "To" },
    placeholders = { from: "Please select", to: "Please select" },
    disableSameSelection = true,
    widthClass = "w-[190px]",
}) => {
    const { fromCode, toCode } = value;

    const handleFrom = (code: string) => onChange({ fromCode: code, toCode });
    const handleTo = (code: string) => onChange({ fromCode, toCode: code });

    const swap = () => {
        if (!fromCode && !toCode) return; // no-op if both empty
        onChange({ fromCode: toCode, toCode: fromCode });
    };

    return (
        <>
            {/* From */}
            <div className={widthClass}>
                <label className="block text-[12px] text-[#3D495C] mb-1">{labels.from}</label>
                <div className="relative">
                    <select
                        disabled={!!loading}
                        value={fromCode}
                        onChange={(e) => handleFrom(e.target.value)}
                        className="appearance-none h-11 w-full rounded-xl border border-[#DFE7F3] pl-4 pr-8 text-[14px] text-[#0F172A] outline-none focus:ring-2 focus:ring-[#2351A3]/20"
                    >
                        <option value="" disabled>
                            {loading ? "Loading..." : placeholders.from}
                        </option>
                        {options.map((o) => (
                            <option
                                key={o.id}
                                value={o.code}
                                disabled={disableSameSelection && o.code === toCode}
                            >
                                {o.label}
                            </option>
                        ))}
                    </select>

                    <svg className="pointer-events-none absolute right-3 top-1/3" width="16" height="16" viewBox="0 0 20 20" fill="none">
                        <path d="M5 7.5l5 5 5-5" stroke="#2351A3" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </div>
            </div>

            {/* Swap */}
            {showSwap && (
                <button
                    type="button"
                    onClick={swap}
                    className="-mx-2.5 flex h-10 w-10 items-center justify-center rounded-full bg-[#2351A3] text-white shadow-md border border-white"
                    aria-label="Swap"
                >
                    <img src={DoubledArrow} alt="swap-routes" />
                </button>
            )}

            {/* To */}
            <div className={widthClass}>
                <label className="block text-[12px] text-[#3D495C] mb-1">{labels.to}</label>
                <div className="relative">
                    <select
                        disabled={!!loading}
                        value={toCode}
                        onChange={(e) => handleTo(e.target.value)}
                        className="appearance-none h-11 w-full rounded-xl border border-[#DFE7F3] pl-4 pr-8 text-[14px] text-[#0F172A] outline-none focus:ring-2 focus:ring-[#2351A3]/20"
                    >
                        <option value="" disabled>
                            {loading ? "Loading..." : placeholders.to}
                        </option>
                        {options.map((o) => (
                            <option
                                key={o.id}
                                value={o.code}
                                disabled={disableSameSelection && o.code === fromCode}
                            >
                                {o.label}
                            </option>
                        ))}
                    </select>

                    <svg className="pointer-events-none absolute right-3 top-1/3" width="16" height="16" viewBox="0 0 20 20" fill="none">
                        <path d="M5 7.5l5 5 5-5" stroke="#2351A3" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </div>
            </div>
        </>
    );
};

export default TravelRoutePicker;
