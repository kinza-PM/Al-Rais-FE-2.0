import Button from "../atoms/Button";
import TailwindCustomInput from "../common/TailwindCustomInput";

export default function TravellersPaymentSection() {

    return (
        <div className="p-5">

            <div className="grid gap-4 md:grid-cols-2">
                <TailwindCustomInput
                    type="text"
                    placeholder="1234 5678 9101 1213"
                    className="h-9 w-full rounded-md border border-[#E4EBF3] px-3 text-[13px] placeholder:text-[#B2BFCC] outline-none focus:border-[#0563C1]"
                    label="Card Number"
                    labelClass="mb-1 block text-[12px] font-bold text-[#3D3D3D]"
                />
                <TailwindCustomInput
                    type="text"
                    placeholder="MM/YY"
                    className="h-9 w-full rounded-md border border-[#E4EBF3] px-3 text-[13px] placeholder:text-[#B2BFCC] outline-none focus:border-[#0563C1]"
                    label="Expiration"
                    labelClass="mb-1 block text-[12px] font-bold text-[#3D3D3D]"
                />
                <TailwindCustomInput
                    type="text"
                    placeholder="3 or 4 digits"
                    className="h-9 w-full rounded-md border border-[#E4EBF3] px-3 text-[13px] placeholder:text-[#B2BFCC] outline-none focus:border-[#0563C1]"
                    label="CVC"
                    labelClass="mb-1 block text-[12px] font-bold text-[#3D3D3D]"
                />
                <TailwindCustomInput
                    type="text"
                    placeholder="Name"
                    className="h-9 w-full rounded-md border border-[#E4EBF3] px-3 text-[13px] placeholder:text-[#B2BFCC] outline-none focus:border-[#0563C1]"
                    label="Name on Card"
                    labelClass="mb-1 block text-[12px] font-bold text-[#3D3D3D]"
                />

            </div>

            <div className="mt-6">
                <Button
                    type="button"
                    className="w-full rounded-md bg-[#E8F0FF] py-2 text-center text-[14px] font-semibold text-[#0563C1]"
                    overrideClasses
                >
                    Confirm and pay
                </Button>
            </div>
        </div>
    );
}
