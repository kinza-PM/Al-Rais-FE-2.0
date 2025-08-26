import React from "react";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <label className="block">
            <span className="mb-1 block text-[12px] font-bold text-[#3D3D3D]">{label}</span>
            {children}
        </label>
    );
}

export default function TravellersPaymentSection() {

    return (
        <div className="p-5">

            <div className="grid gap-4 md:grid-cols-2">
                <Field label="Card Number">
                    <input className="h-9 w-full rounded-md border border-[#E4EBF3] px-3 text-[13px] placeholder:text-[#B2BFCC] outline-none focus:border-[#0563C1]" placeholder="1234 5678 9101 1213" />
                </Field>
                <Field label="Expiration">
                    <input className="h-9 w-full rounded-md border border-[#E4EBF3] px-3 text-[13px] placeholder:text-[#B2BFCC] outline-none focus:border-[#0563C1]" placeholder="MM/YY" />
                </Field>

                <Field label="CVC">
                    <input
                        className="h-9 w-full rounded-md border border-[#E4EBF3] px-3 text-[13px] placeholder:text-[#B2BFCC] outline-none focus:border-[#0563C1]"
                        placeholder="3 or 4 digits"
                    />
                </Field>

                <Field label="Name on Card">
                    <input
                        className="h-9 w-full rounded-md border border-[#E4EBF3] px-3 text-[13px] placeholder:text-[#B2BFCC] outline-none focus:border-[#0563C1]"
                        placeholder="Name"
                    />
                </Field>

            </div>

            <div className="mt-6">
                <button className="w-full rounded-md bg-[#E8F0FF] py-2 text-center text-[14px] font-semibold text-[#0563C1]" type="button">
                    Confirm and pay
                </button>
            </div>
        </div>
    );
}
