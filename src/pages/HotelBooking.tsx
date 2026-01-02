import { useState } from "react";
import { Button } from "../components";
import HotelBookingBookSection from "../components/molecules/HotelBookingBookSection";
import HotelBookingReviewSection from "../components/molecules/HotelBookingReviewSection";
import HotelBookingPaymentSection from "../components/molecules/HotelBookingPaymentSection";
import HotelBookingETicketSetion from "../components/molecules/HotelBookingETicketSetion";

const HotelBooking = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, _] = useState<string[]>(["Book", "Review", "Pay", "Receipt"]);
  const progressPct =
    steps.length > 1 ? (currentStep / (steps.length - 1)) * 100 : 0;

  return (
    <>
      <div className={`p-8`}>
        {/* <div className={`p-8 ${showTimerBanner ? "pt-8" : ""}`}> */}
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
              const isReached = i <= currentStep;

              return (
                <li key={label} className="flex flex-col items-center">
                  <Button
                    type="button"
                    // onClick={() => setCurrentStep(i)}
                    className={[
                      "flex h-5 w-5 items-center justify-center rounded-full border transition p-0", // keep circle shape
                      "focus:outline-none",
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
                    // onClick={() => setCurrentStep(i)}
                    className={[
                      "mt-2 text-sm transition-colors bg-transparent border-none hover:text-[#2351A3]",
                      isReached
                        ? "text-[#2351A3] font-medium"
                        : "text-[#3D495C]",
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
          {currentStep === 0 && (
            <HotelBookingBookSection
              onNext={() => {
                setCurrentStep(1);
              }}
            />
          )}
          {currentStep === 1 && (
            <HotelBookingReviewSection
              onNext={() => {
                setCurrentStep(2);
              }}
            />
          )}
          {currentStep === 2 && (
            <HotelBookingPaymentSection
              onNext={() => {
                setCurrentStep(3);
              }}
            />
          )}
          {currentStep === 3 && <HotelBookingETicketSetion />}
        </div>
      </div>
    </>
  );
};

export default HotelBooking;
