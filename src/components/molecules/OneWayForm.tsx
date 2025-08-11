import React, { useRef } from 'react';
import DoubledArrow from '../../assets/svgs/doubled-arrow.svg';
import Calendar from '../../assets/svgs/calendar.svg';


const OneWayForm: React.FC = () => {
    const depRef = useRef<HTMLInputElement>(null);

    return (
        <div className="flex items-end gap-4">
            {/* From */}
            <div className="w-[190px]">
                <label className="block text-[12px] text-[#3D495C] mb-1">From</label>
                <input
                    readOnly
                    defaultValue="Dubai (DXB)"
                    className="h-11 w-full rounded-xl border border-[#DFE7F3] px-4 text-[14px] text-[#0F172A] outline-none focus:ring-2 focus:ring-[#2351A3]/20"
                />
            </div>

            {/* Swap */}
            <button
                type="button"
                className="-mx-2.5 flex h-10 w-10 items-center justify-center rounded-full bg-[#2351A3] text-white shadow-md border border-white"
                aria-label="Swap"
            >
                <img src={DoubledArrow} alt='doybled-arrow' />
            </button>


            {/* To */}
            <div className="w-[190px]">
                <label className="block text-[12px] text-[#3D495C] mb-1">To</label>
                <input
                    readOnly
                    defaultValue="Mumbai (BOM)"
                    className="h-11 w-full rounded-xl border border-[#DFE7F3] px-4 text-[14px] text-[#0F172A] outline-none focus:ring-2 focus:ring-[#2351A3]/20"
                />
            </div>


            {/* Departure date */}
            <div className="w-[230px]">
                <label className="block text-[12px] text-[#3D495C] mb-1">Departure date</label>
                <div className="relative">
                    <input
                        ref={depRef}
                        type="date"
                        defaultValue="2025-06-16"
                        className="h-11 w-full rounded-xl border border-[#DFE7F3] pl-4 pr-10 text-[14px] text-[#0F172A] outline-none focus:ring-2 focus:ring-[#2351A3]/20 hide-date-icon"
                    />
                    <button
                        type="button"
                        onClick={() => depRef.current?.showPicker?.()}
                        className="absolute inset-y-0 right-3 flex items-center"
                        aria-label="Open calendar"
                    >
                        <img src={Calendar} alt="calendar-icon" className="w-[16px] h-[16px]" />
                    </button>
                </div>
            </div>


            {/* Passengers */}
            <div className="w-[150px]">
                <label className="block text-[12px] text-[#3D495C] mb-1">Passengers</label>
                <div className="relative">
                    <select
                        defaultValue="1"
                        className="appearance-none h-11 w-full rounded-xl border border-[#DFE7F3] px-4 pr-8 text-[14px] text-[#0F172A] outline-none focus:ring-2 focus:ring-[#2351A3]/20"
                    >
                        {Array.from({ length: 9 }, (_, i) => (
                            <option key={i + 1} value={i + 1}>
                                {String(i + 1).padStart(2, '0')} Adult(s)
                            </option>
                        ))}
                    </select>
                    <svg className="pointer-events-none absolute right-3 top-1/3" width="16" height="16" viewBox="0 0 20 20" fill="none">
                        <path d="M5 7.5l5 5 5-5" stroke="#2351A3" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </div>
            </div>

            {/* Cabin class */}
            <div className="w-[150px]">
                <label className="block text-[12px] text-[#3D495C] mb-1">Cabin class</label>
                <div className="relative">
                    <select
                        defaultValue="economy"
                        className="appearance-none h-11 w-full rounded-xl border border-[#DFE7F3] px-4 pr-8 text-[14px] text-[#0F172A] outline-none focus:ring-2 focus:ring-[#2351A3]/20"
                    >
                        <option value="economy">Economy</option>
                        <option value="premium">Premium Economy</option>
                        <option value="business">Business</option>
                        <option value="first">First</option>
                    </select>
                    <svg className="pointer-events-none absolute right-3 top-1/3 " width="16" height="16" viewBox="0 0 20 20" fill="none">
                        <path d="M5 7.5l5 5 5-5" stroke="#2351A3" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </div>
            </div>
        </div>
    );
};

export default OneWayForm; 