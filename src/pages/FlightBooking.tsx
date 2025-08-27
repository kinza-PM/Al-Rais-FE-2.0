import { useState } from "react";
import FlightBookingBookSection from "../components/molecules/FlightBookingBookSection";

const FlightBooking = () => {
    const [currentStep, setCurrentStep] = useState(0);
    const steps = ["Book", "Review", "Pay", "E-ticket"];

    return (
        <div className="p-8">
            <div className="relative mx-auto max-w-[420px] md:max-w-[520px]">
                <div className="absolute top-[9px] left-[10px] right-[15px] h-[2px] bg-[#F2F2F3] z-0" />
                <ol className="relative z-10 flex items-center justify-between">
                    {steps.map((label, i) => {
                        const isActive = i === currentStep;
                        return (
                            <li key={label} className="flex flex-col items-center">
                                <button
                                    type="button"
                                    onClick={() => setCurrentStep(i)}
                                    className={`flex h-5 w-5 items-center justify-center rounded-full border transition ${isActive ? "bg-[#2351A3] border-[#2351A3]" : "bg-[#C2CAD6] border-[#C2CAD6]"} hover:ring-[#2351A3]/25 cursor-pointer`}
                                    aria-current={isActive ? "step" : undefined}
                                    aria-label={label}
                                />

                                {/* label */}
                                <button
                                    type="button"
                                    onClick={() => setCurrentStep(i)}
                                    className={`mt-2 text-sm ${isActive ? "text-[#2351A3] font-medium" : "text-[#3D495C]"} hover:text-[#2351A3] cursor-pointer`}
                                >
                                    {label}
                                </button>
                            </li>
                        );
                    })}
                </ol>
            </div>

            <div className="mt-6">
                {currentStep === 0 && <FlightBookingBookSection />}
                {currentStep === 1 && (
                    <div className="text-center text-sm text-slate-500">Review content…</div>
                )}
                {currentStep === 2 && (
                    <div className="text-center text-sm text-slate-500">Pay content…</div>
                )}
                {currentStep === 3 && (
                    <div className="text-center text-sm text-slate-500">E-ticket content…</div>
                )}
            </div>
        </div>
    );
};

export default FlightBooking;
