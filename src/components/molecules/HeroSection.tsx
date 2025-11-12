import React, { useState } from "react";
import FlightHeroSectionTab from "./FlightHeroSectionTab";
import HotelHeroSectionTab from "./HotelHeroSectionTab";
import Celebration from "../../assets/svgs/celebration.svg";

const HeroSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"flights" | "hotels">("flights");

  const handleTabChange = (tab: "flights" | "hotels") => {
    setActiveTab(tab);
  };

  return (
    <div>
      <div className="w-full flex justify-center px-4 mt-10">
        <div className="w-full max-w-[1040px] bg-white rounded-xl border border-[#E7EEF7] shadow-[0_8px_28px_rgba(12,40,86,0.08)]">
          <div className="relative h-[50px] px-6">
            {/* Tab labels */}
            <div className="absolute inset-x-0 top-3 flex justify-center gap-10 text-[16px]">
              <button
                type="button"
                onClick={() => handleTabChange("flights")}
                className={`font-medium transition-colors cursor-pointer ${activeTab === "flights"
                  ? "text-[#2351A3]"
                  : "text-[#3D495C] opacity-70"
                  }`}
              >
                Flights
              </button>
              <button
                type="button"
                onClick={() => handleTabChange("hotels")}
                className={`font-medium transition-colors cursor-pointer ${activeTab === "hotels"
                  ? "text-[#2351A3]"
                  : "text-[#3D495C] opacity-70"
                  }`}
              >
                Hotels
              </button>
            </div>

            <div className="absolute left-0 right-0 bottom-0 h-px bg-[#E4E4E7]" />

            <span
              className="absolute bottom-0 h-[4px] w-[55px] rounded-full bg-[#5383DA] transition-all duration-300 ease-in-out underline-blur"
              style={{
                left: activeTab === "flights"
                  ? "calc(48% - 25px)"
                  : "calc(52% + 25px)",
                transform: "translateX(-50%)",
              }}
            />
          </div>

          {/* Render the appropriate hero section */}
          {activeTab === "flights" && <FlightHeroSectionTab />}
          {activeTab === "hotels" && <HotelHeroSectionTab />}
        </div>
      </div>

      {/* Promotional cards - Common for both */}
      <PromotionalCards />
    </div>
  );
};

// Extract promotional cards to a separate component
const PromotionalCards: React.FC = () => (
  <div className="w-full flex mt-8 px-12">
    <div className="w-full grid md:grid-cols-3 gap-4">
      {/* Card 1 — Welcome gift */}
      <div className="relative rounded-2xl border border-[#E7EEF7] bg-white px-4 py-4 min-h-[160px] shadow-[0_1px_2px_rgba(12,40,86,0.05)] flex items-center justify-between gap-4">
        <span
          className="absolute top-3 left-3 inline-flex items-center gap-1.5 px-2.5 py-[5px] rounded-full text-white text-[12px] font-medium
          bg-[linear-gradient(90.59deg,#5383DA_0%,#2351A3_50%,#081326_100%)] shadow-[0_2px_8px_rgba(12,40,86,0.18)]"
        >
          <img
            src={Celebration}
            alt="celebration"
            className="w-[16px] h-[16px] shrink-0"
          />
          Welcome gift
        </span>
        <div className="pt-2">
          <h3 className="text-[26px] leading-6 text-[rgba(10, 12, 15, 1)]">
            Get 25% off on your first booking
          </h3>
        </div>
        <button className="shrink-0 h-10 px-5 rounded-lg bg-[rgba(35,81,163,1)] text-white text-[14px] font-medium shadow-sm">
          Sign in to claim
        </button>
      </div>

      {/* Card 2 — Did you know */}
      <div
        className="rounded-2xl px-4 py-4 min-h-[160px] text-white shadow-[0_8px_28px_rgba(12,40,86,0.08)]
        bg-[linear-gradient(90.59deg,#5383DA_0%,#2351A3_50%,#081326_100%)] flex items-center justify-between gap-4"
      >
        <div>
          <p className="text-[12px] opacity-80">Did you know?</p>
          <p className="mt-2 text-[14px] leading-6 opacity-95">
            Al-Rais members get better deals and prices on Flights and Hotels.
          </p>
        </div>
        <button className="shrink-0 h-10 px-5 rounded-lg bg-white text-[#153C8E] text-[13px] font-semibold border border-white/70">
          Create an account
        </button>
      </div>

      {/* Card 3 — Companion */}
      <div className="rounded-2xl border border-[#E7EEF7] bg-white px-4 py-4 min-h-[160px] shadow-[0_1px_2px_rgba(12,40,86,0.05)] flex items-center justify-between gap-4">
        <h3 className="text-[26px] leading-6 text-[rgba(10, 12, 15, 1)]">
          Your all-in-one travel booking companion!
        </h3>
        <button className="shrink-0 h-10 px-5 rounded-lg bg-[#2351A3] text-white text-[14px] font-medium shadow-sm">
          Explore now
        </button>
      </div>
    </div>
  </div>
);

export default HeroSection;