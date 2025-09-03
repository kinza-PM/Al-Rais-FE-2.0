import { useState } from "react";
import FlightBookingBookSection from "../components/molecules/FlightBookingBookSection";
import FlightBookingReviewSection from "../components/molecules/FlightBookingReviewSection";
import FlightBookingPaymentSection from "../components/molecules/FlightBookingPaymentSection";
import FlightBookingETicketSection from "../components/molecules/FlightBookingETicketSection";

const FlightBooking = () => {
    const [currentStep, setCurrentStep] = useState(0);
    const steps = ["Book", "Review", "Pay", "E-ticket"];

    const progressPct =
        steps.length > 1 ? (currentStep / (steps.length - 1)) * 100 : 0;

    const showTimerBanner = [1, 2].includes(currentStep);

    return (
        <>
            {showTimerBanner && (
                <div className="inset-x-0 z-50 bg-[#EA0029]">
                    <div className="mx-auto max-w-screen-2xl px-4 py-2 text-center text-white">
                        <span className="text-[15px] font-medium">Please complete your booking in</span>
                        <span className="ml-2 inline-flex items-center gap-1 align-middle">
                            <span className="rounded-md bg-[#B80020] px-1 py-1 text-[13px] font-semibold leading-none">00</span>
                            <span className="text-[13px] leading-none">:</span>
                            <span className="rounded-md bg-[#B80020] px-1 py-1 text-[13px] font-semibold leading-none">35</span>
                            <span className="text-[13px] leading-none">:</span>
                            <span className="rounded-md bg-[#B80020] px-1 py-1 text-[13px] font-semibold leading-none">49</span>
                        </span>
                    </div>
                </div>
            )}
            <div className={`p-8 ${showTimerBanner ? "pt-8" : ""}`}>
                <div className="relative mx-auto max-w-[420px] md:max-w-[520px]">
                    <div className="absolute left-[10px] right-[15px] top-3 -translate-y-1/2 z-0">
                        <div className="relative h-[2px]">
                            <div className="absolute inset-0 bg-[#F2F2F3]" />
                            <div
                                className="absolute inset-y-0 left-0 bg-[#2351A3] transition-all duration-300"
                                style={{ width: `${progressPct}%` }}
                            />
                        </div>
                    </div>

                    <ol className="relative z-10 flex items-center justify-between">
                        {steps.map((label, i) => {
                            const isCurrent = i === currentStep;
                            // const isCompleted = i < currentStep;
                            const isReached = i <= currentStep;

                            return (
                                <li key={label} className="flex flex-col items-center">
                                    <button
                                        type="button"
                                        onClick={() => setCurrentStep(i)}
                                        aria-current={isCurrent ? "step" : undefined}
                                        aria-label={label}
                                        className={[
                                            "flex h-5 w-5 items-center justify-center rounded-full border transition",
                                            "hover:ring-4 hover:ring-[#2351A3]/20 focus:outline-none",
                                            isReached
                                                ? "bg-[#2351A3] border-[#2351A3]"
                                                : "bg-[#C2CAD6] border-[#C2CAD6]",
                                        ].join(" ")}
                                    />

                                    <button
                                        type="button"
                                        onClick={() => setCurrentStep(i)}
                                        className={[
                                            "mt-2 text-sm transition-colors",
                                            isReached ? "text-[#2351A3] font-medium" : "text-[#3D495C]",
                                            "hover:text-[#2351A3]",
                                        ].join(" ")}
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
                        <FlightBookingReviewSection />
                    )}
                    {currentStep === 2 && (
                        <FlightBookingPaymentSection />
                    )}
                    {currentStep === 3 && (
                        <FlightBookingETicketSection />
                    )}
                </div>
            </div>
        </>

    );
};

export default FlightBooking;
