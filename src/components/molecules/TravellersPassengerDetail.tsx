import React, { useRef, useState } from "react";

const CalendarIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg width="18" height="20" viewBox="0 0 18 20" fill="none" {...props}>
        <path d="M16.5 2H14.25V1.25C14.25 1.05109 14.171 0.860322 14.0303 0.71967C13.8897 0.579018 13.6989 0.5 13.5 0.5C13.3011 0.5 13.1103 0.579018 12.9697 0.71967C12.829 0.860322 12.75 1.05109 12.75 1.25V2H5.25V1.25C5.25 1.05109 5.17098 0.860322 5.03033 0.71967C4.88968 0.579018 4.69891 0.5 4.5 0.5C4.30109 0.5 4.11032 0.579018 3.96967 0.71967C3.82902 0.860322 3.75 1.05109 3.75 1.25V2H1.5C1.10218 2 0.720644 2.15804 0.43934 2.43934C0.158035 2.72064 0 3.10218 0 3.5V18.5C0 18.8978 0.158035 19.2794 0.43934 19.5607C0.720644 19.842 1.10218 20 1.5 20H16.5C16.8978 20 17.2794 19.842 17.5607 19.5607C17.842 19.2794 18 18.8978 18 18.5V3.5C18 3.10218 17.842 2.72064 17.5607 2.43934C17.2794 2.15804 16.8978 2 16.5 2ZM4.875 16.25C4.6525 16.25 4.43499 16.184 4.24998 16.0604C4.06498 15.9368 3.92078 15.7611 3.83564 15.5555C3.75049 15.35 3.72821 15.1238 3.77162 14.9055C3.81502 14.6873 3.92217 14.4868 4.0795 14.3295C4.23684 14.1722 4.43729 14.065 4.65552 14.0216C4.87375 13.9782 5.09995 14.0005 5.30552 14.0856C5.51109 14.1708 5.68679 14.315 5.8104 14.5C5.93402 14.685 6 14.9025 6 15.125C6 15.4234 5.88147 15.7095 5.6705 15.9205C5.45952 16.1315 5.17337 16.25 4.875 16.25ZM9 16.25C8.7775 16.25 8.55999 16.184 8.37498 16.0604C8.18998 15.9368 8.04578 15.7611 7.96064 15.5555C7.87549 15.35 7.85321 15.1238 7.89662 14.9055C7.94002 14.6873 8.04717 14.4868 8.2045 14.3295C8.36184 14.1722 8.56229 14.065 8.78052 14.0216C8.99875 13.9782 9.22495 14.0005 9.43052 14.0856C9.63608 14.1708 9.81179 14.315 9.9354 14.5C10.059 14.685 10.125 14.9025 10.125 15.125C10.125 15.4234 10.0065 15.7095 9.79549 15.9205C9.58452 16.1315 9.29837 16.25 9 16.25ZM9 12.5C8.7775 12.5 8.55999 12.434 8.37498 12.3104C8.18998 12.1868 8.04578 12.0111 7.96064 11.8055C7.87549 11.6 7.85321 11.3738 7.89662 11.1555C7.94002 10.9373 8.04717 10.7368 8.2045 10.5795C8.36184 10.4222 8.56229 10.315 8.78052 10.2716C8.99875 10.2282 9.22495 10.2505 9.43052 10.3356C9.63608 10.4208 9.81179 10.565 9.9354 10.75C10.059 10.935 10.125 11.1525 10.125 11.375C10.125 11.6734 10.0065 11.9595 9.79549 12.1705C9.58452 12.3815 9.29837 12.5 9 12.5ZM13.125 16.25C12.9025 16.25 12.685 16.184 12.5 16.0604C12.315 15.9368 12.1708 15.7611 12.0856 15.5555C12.0005 15.35 11.9782 15.1238 12.0216 14.9055C12.065 14.6873 12.1722 14.4868 12.3295 14.3295C12.4868 14.1722 12.6873 14.065 12.9055 14.0216C13.1238 13.9782 13.35 14.0005 13.5555 14.0856C13.7611 14.1708 13.9368 14.315 14.0604 14.5C14.184 14.685 14.25 14.9025 14.25 15.125C14.25 15.4234 14.1315 15.7095 13.9205 15.9205C13.7095 16.1315 13.4234 16.25 13.125 16.25ZM13.125 12.5C12.9025 12.5 12.685 12.434 12.5 12.3104C12.315 12.1868 12.1708 12.0111 12.0856 11.8055C12.0005 11.6 11.9782 11.3738 12.0216 11.1555C12.065 10.9373 12.1722 10.7368 12.3295 10.5795C12.4868 10.4222 12.6873 10.315 12.9055 10.2716C13.1238 10.2282 13.35 10.2505 13.5555 10.3356C13.7611 10.4208 13.9368 10.565 14.0604 10.75C14.184 10.935 14.25 11.1525 14.25 11.375C14.25 11.6734 14.1315 11.9595 13.9205 12.1705C13.7095 12.3815 13.4234 12.5 13.125 12.5ZM16.5 6.5H1.5V3.5H3.75V4.25C3.75 4.44891 3.82902 4.63968 3.96967 4.78033C4.11032 4.92098 4.30109 5 4.5 5C4.69891 5 4.88968 4.92098 5.03033 4.78033C5.17098 4.63968 5.25 4.44891 5.25 4.25V3.5H12.75V4.25C12.75 4.44891 12.829 4.63968 12.9697 4.78033C13.1103 4.92098 13.3011 5 13.5 5C13.6989 5 13.8897 4.92098 14.0303 4.78033C14.171 4.63968 14.25 4.44891 14.25 4.25V3.5H16.5V6.5Z" fill="#0563C1" />
    </svg>
);

const ChevronDown = (props: React.SVGProps<SVGSVGElement>) => (
    <svg width="14" height="9" viewBox="0 0 14 9" fill="none" {...props}>
        <path
            fillRule="evenodd" clipRule="evenodd"
            d="M7.70734 7.96697C7.51981 8.15505 7.26551 8.26071 7.00034 8.26071C6.73518 8.26071 6.48087 8.15505 6.29334 7.96697L0.636343 2.29163C0.540833 2.19909 0.464651 2.08839 0.412242 1.96599C0.359833 1.84359 0.332246 1.71194 0.331092 1.57873C0.329939 1.44552 0.355241 1.31342 0.405521 1.19012C0.455802 1.06683 0.530055 0.954812 0.623948 0.860615C0.717841 0.766418 0.829492 0.691924 0.952389 0.64148C1.07529 0.591036 1.20696 0.565653 1.33974 0.56681C1.47252 0.567968 1.60374 0.595644 1.72575 0.648222C1.84775 0.700801 1.9581 0.77723 2.05034 0.87305L7.00034 5.8391L11.9503 0.87305C12.1389 0.690301 12.3915 0.58918 12.6537 0.591466C12.9159 0.593752 13.1668 0.699262 13.3522 0.885271C13.5376 1.07128 13.6427 1.32291 13.645 1.58595C13.6473 1.849 13.5465 2.10242 13.3643 2.29163L7.70734 7.96697Z"
            fill="#969696"
        />
    </svg>
);

function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <label className="block">
            <span className="mb-1 block text-[12px] font-bold text-[#3D3D3D]">{label}</span>
            {children}
        </label>
    );
}

function DateInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
    const ref = useRef<HTMLInputElement>(null);
    return (
        <div className="relative">
            <input
                ref={ref}
                type="date"
                className="date-input h-9 w-full rounded-md border border-[#E4EBF3] px-3 pr-10 text-[13px] outline-none focus:border-[#0563C1]"
                {...props}
            />
            <button
                type="button"
                onClick={() => ref.current?.showPicker?.()}
                className="absolute right-2 top-1/4"
            >
                <CalendarIcon width={16} height={16} />
            </button>
        </div>
    );
}


export default function TravellersPassengerDetail() {
    const [title, setTitle] = useState<"Mr" | "Mrs" | "Ms">("Mr");

    return (
        <div className="p-5">
            <style>{`
                /* Chrome, Edge, Safari */
                .date-input::-webkit-calendar-picker-indicator { display: none; }
                .date-input::-webkit-clear-button,
                .date-input::-webkit-inner-spin-button { display: none; }

                /* Firefox (hides dropmarker) */
                .date-input { -moz-appearance: textfield; }
            `}</style>
            {/* Title pills */}
            <div className="mb-3">
                <p className="mb-2 text-[12px] font-bold text-[#3D3D3D]">Select Title</p>
                <div className="flex gap-2">
                    {(["Mr", "Mrs", "Ms"] as const).map((t) => {
                        const active = title === t;
                        return (
                            <button
                                key={t}
                                onClick={() => setTitle(t)}
                                className={`h-8 rounded-md px-6 text-[12px] font-medium ${active ? "bg-[#0563C1] text-white" : "bg-[#E8F0FF] text-[#3D3D3D]"
                                    }`}
                            >
                                {t}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Grid form */}
            <div className="grid gap-4 md:grid-cols-2">
                <Field label="First Name">
                    <input className="h-9 w-full rounded-md border border-[#E4EBF3] px-3 text-[13px] placeholder:text-[#B2BFCC] outline-none focus:border-[#0563C1]" placeholder="First Name" />
                </Field>
                <Field label="Last Name">
                    <input className="h-9 w-full rounded-md border border-[#E4EBF3] px-3 text-[13px] placeholder:text-[#B2BFCC] outline-none focus:border-[#0563C1]" placeholder="Last Name" />
                </Field>

                <Field label="Date of Birth">
                    <DateInput />
                </Field>

                <Field label="Passport Number">
                    <input
                        className="h-9 w-full rounded-md border border-[#E4EBF3] px-3 text-[13px] placeholder:text-[#B2BFCC] outline-none focus:border-[#0563C1]"
                        placeholder="Passport Number"
                    />
                </Field>

                <Field label="Passport Issue Date">
                    <DateInput />
                </Field>

                <Field label="Passport Expiry Date">
                    <DateInput />
                </Field>

                {/* Issue At */}
                <Field label="Issue At">
                    <div className="relative">
                        <select
                            className="h-9 w-full appearance-none rounded-md border border-[#E4EBF3] bg-white px-3 pr-8 text-[13px] outline-none focus:border-[#0563C1]"
                            defaultValue=""
                        >
                            <option value="" disabled>Select Country</option>
                            <option>United Arab Emirates</option>
                            <option>United States</option>
                            <option>Pakistan</option>
                            <option>India</option>
                        </select>
                        <ChevronDown className="absolute right-2 top-1/3 h-3 w-3" />
                    </div>
                </Field>

                {/* Nationality */}
                <Field label="Nationality">
                    <div className="relative">
                        <select className="h-9 w-full appearance-none rounded-md border border-[#E4EBF3] bg-white px-3 pr-8 text-[13px] outline-none focus:border-[#0563C1]" defaultValue="">
                            <option value="" disabled>Select Country</option>
                            <option>United Arab Emirates</option>
                            <option>United States</option>
                            <option>Pakistan</option>
                            <option>India</option>
                        </select>
                        <ChevronDown className="absolute right-2 top-1/3 h-3 w-3" />
                    </div>
                </Field>

                <Field label="Contact">
                    <div className="flex">
                        <div className="flex h-9 items-center gap-2 rounded-l-md border border-r-0 border-[#E4EBF3] bg-[#F7FAFF] px-3">
                            {/* simple UAE flag + code */}
                            <span className="inline-block h-3 w-5 overflow-hidden rounded-[2px]" aria-hidden>
                                <span className="block h-1 w-full bg-[#00732F]" />
                                <span className="block h-1 w-full bg-white" />
                                <span className="block h-1 w-full bg-[#000000]" />
                                <span className="absolute ml-[-5px] mt-[-6px] block h-4 w-2 bg-[#EA1F28]" />
                            </span>
                            <span className="text-[13px] text-[#3D495C]">+971</span>
                        </div>
                        <input className="h-9 w-full rounded-r-md border border-[#E4EBF3] px-3 text-[13px] placeholder:text-[#B2BFCC] outline-none focus:border-[#0563C1]" placeholder="Phone number" />
                    </div>
                </Field>
                <Field label="Email">
                    <input className="h-9 w-full rounded-md border border-[#E4EBF3] px-3 text-[13px] placeholder:text-[#B2BFCC] outline-none focus:border-[#0563C1]" placeholder="Email" type="email" />
                </Field>
            </div>

            <div className="mt-6">
                <button className="w-full rounded-md bg-[#E8F0FF] py-2 text-center text-[14px] font-semibold text-[#0563C1]" type="button">
                    Next
                </button>
            </div>
        </div>
    );
}
