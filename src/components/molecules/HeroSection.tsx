import React from "react";
import FlightHeroSectionTab from "./FlightHeroSectionTab";
import HotelHeroSectionTab from "./HotelHeroSectionTab";
import Celebration from "../../assets/svgs/celebration.svg";
import CardBg25 from "../../assets/images/3rd-section-image1.png";
import CardBgExplore from "../../assets/images/3rd-section-image 2.jpg";

type Props = {
  activeTab?: "flights" | "hotels";
  onTabChange?: (tab: "flights" | "hotels") => void;
};

const HeroSection: React.FC<Props> = ({ activeTab }) => {
  const selectedTab = activeTab ?? "flights";

  return (
    <div>
      {/* Outer container — gray border pill matching Figma */}
      <div className="w-full flex justify-center px-4" style={{ marginTop: -10 }}>
        <div
          className="w-full max-w-[1268px] bg-[#CFD5E0] border-[2px] border-[#A4A9AD] rounded-[45px] flex justify-center relative z-10 overflow-visible"
        >
          {/* Inner white panel — 15px inset on all sides, NO forced bottom padding */}
          <div
            id="hero-search-form"
            className="w-full mx-[15px] my-[15px] rounded-[35px] bg-white shadow-[0_8px_28px_rgba(12,40,86,0.08)] overflow-visible"
          >
            {selectedTab === "flights" && <FlightHeroSectionTab />}
            {selectedTab === "hotels" && <HotelHeroSectionTab />}
          </div>
        </div>
      </div>

      {/* Promotional cards */}
      <PromotionalCards />
    </div>
  );
};

const PromotionalCards: React.FC = () => (
  <div className="w-full flex justify-center mt-8 px-4">
    <div className="w-full max-w-[1268px] grid md:grid-cols-3 gap-4 lg:gap-6 justify-items-center">
      {/* Card 1 — Welcome gift */}
      <div
        className="relative flex w-full max-w-[401px] items-center justify-between gap-4 px-4 py-4 shadow-[0_1px_4px_rgba(12,40,86,0.12)] bg-cover bg-right bg-no-repeat rounded-[16px]"
        style={{
          height: 113,
          backgroundImage: `url(${CardBg25})`,
          backgroundColor: "#FFFFFF",
        }}
      >
        <span
          className="absolute top-3 left-3 inline-flex items-center gap-1.5 px-2.5 py-[5px] rounded-full text-white text-[12px] font-medium shadow-[0_2px_8px_rgba(12,40,86,0.18)]"
          style={{
            background: "linear-gradient(90.59deg, #5383DA 0%, #2351A3 50%, #081326 100%)",
          }}
        >
          <img src={Celebration} alt="celebration" className="w-[16px] h-[16px] shrink-0" />
          Welcome gift
        </span>
        <div className="pt-6">
          <p
            className="text-[18px] leading-[1] font-normal text-[#0A0C0F] max-w-[209px]"
            style={{ fontSize: "13px" }}
          >
            Get 25% off on your first
            <br />
            booking
          </p>
        </div>
      </div>

      {/* Card 2 — Did you know */}
      <div
        className="flex w-full max-w-[401px] items-center justify-between gap-4 px-6 py-4 text-white shadow-[0_8px_28px_rgba(12,40,86,0.18)] rounded-[16px]"
        style={{
          height: 113,
          background: "linear-gradient(90.59deg, #5383DA 0%, #2351A3 50%, #081326 100%)",
        }}
      >
        <div>
          <p className="text-[12px] opacity-90 mb-2">Did you know?</p>
          <p
            className="text-[14px] leading-[1] font-normal opacity-95 max-w-[260px]"
            style={{ fontSize: "9px" }}
          >
            Al-Rais members get better deals
            <br />
            and prices on Flights and Hotels.
          </p>
        </div>
        <button className="shrink-0 h-10 px-6 rounded-[999px] bg-white text-[#153C8E] text-[13px] font-semibold border border-white/70">
          Create an account
        </button>
      </div>

      {/* Card 3 — Companion */}
      <div
        className="flex w-full max-w-[401px] items-center justify-between gap-4 px-6 py-4 border border-[#E7EEF7] bg-cover bg-right bg-no-repeat shadow-[0_1px_4px_rgba(12,40,86,0.12)] rounded-[16px]"
        style={{
          height: 113,
          backgroundImage: `url(${CardBgExplore})`,
          backgroundColor: "#FFFFFF",
        }}
      >
        <p className="text-[14px] leading-[1] font-normal text-[#0A0C0F] max-w-[260px]">
          Your all-in-one travel booking
          <br />
          companion!
        </p>
        <button className="shrink-0 h-10 px-6 rounded-[999px] bg-[#2351A3] text-white text-[14px] font-medium shadow-sm">
          Explore now
        </button>
      </div>
    </div>
  </div>
);

export default HeroSection;
