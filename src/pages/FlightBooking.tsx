import { useState } from "react";
import FlightBookingBookSection from "../components/molecules/FlightBookingBookSection";
import FlightBookingReviewSection from "../components/molecules/FlightBookingReviewSection";
import FlightBookingPaymentSection from "../components/molecules/FlightBookingPaymentSection";
import FlightBookingETicketSection from "../components/molecules/FlightBookingETicketSection";
import { Button } from "../components";
import BookingBannerAlert from "../components/common/BookingBannerAlert";
import { useLocation } from "react-router-dom";

const FlightBooking = () => {
    const [currentStep, setCurrentStep] = useState(0);
    const location = useLocation();

    const steps = ["Book", "Review", "Pay", "E-ticket"];

    const progressPct =
        steps.length > 1 ? (currentStep / (steps.length - 1)) * 100 : 0;

    const offerData =
        (location.state && (location.state as any)) ||
        (window.history.state && (window.history.state as any)) ||
        null;

    console.log('offerId-----', offerData.offerId);
    console.log('flight Detail-----', offerData.flightDetail);

    const showTimerBanner = [1, 2].includes(currentStep);

    return (
        <>
            {showTimerBanner && (
                <BookingBannerAlert message="Please complete your booking" time="00:35:49" />
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
                            // const isCurrent = i === currentStep;
                            // const isCompleted = i < currentStep;
                            const isReached = i <= currentStep;

                            return (
                                <li key={label} className="flex flex-col items-center">
                                    <Button
                                        type="button"
                                        onClick={() => setCurrentStep(i)}
                                        className={[
                                            "flex h-5 w-5 items-center justify-center rounded-full border transition p-0", // keep circle shape
                                            "hover:ring-4 hover:ring-[#2351A3]/20 focus:outline-none",
                                            isReached
                                                ? "bg-[#2351A3] border-[#2351A3]"
                                                : "bg-[#C2CAD6] border-[#C2CAD6]",
                                        ].join(" ")}
                                        overrideClasses
                                    >
                                        {""}
                                    </Button>

                                    <Button
                                        type="button"
                                        onClick={() => setCurrentStep(i)}
                                        className={[
                                            "mt-2 text-sm transition-colors bg-transparent border-none hover:text-[#2351A3]",
                                            isReached ? "text-[#2351A3] font-medium" : "text-[#3D495C]",
                                        ].join(" ")}
                                        overrideClasses
                                    >
                                        {label}
                                    </Button>
                                </li>
                            );
                        })}
                    </ol>
                </div>

                <div className="mt-6">
                    {currentStep === 0 && <FlightBookingBookSection trip={offerData.flightDetail} />}
                    {currentStep === 1 && (
                        <FlightBookingReviewSection trip={offerData.flightDetail} />
                    )}
                    {currentStep === 2 && (
                        <FlightBookingPaymentSection trip={offerData.flightDetail} />
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
