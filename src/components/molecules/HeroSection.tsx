import React from "react";
import { Link } from "react-router-dom";
import FlightHeroSectionTab from "./FlightHeroSectionTab";
import HotelHeroSectionTab from "./HotelHeroSectionTab";
import Celebration from "../../assets/svgs/celebration.svg";
import { useLandingHeroStore } from "../../store/useLandingHeroStore";
import { useHotelStore } from "../../store/UseHotelStore";
import HeroTabUnderline from "../atoms/HeroTabUnderline";

const promoCardShell =
  "box-border flex min-h-0 w-full min-w-0 flex-col gap-2 overflow-hidden rounded-[16px] p-4 shadow-[0_3px_16px_rgba(8,19,38,0.07)] ring-1 ring-[#E8EDF5]/90 sm:gap-2.5 sm:p-5 md:h-[156px] md:flex-row md:items-center md:justify-between md:gap-3 md:py-3 md:px-5 lg:px-5";

const PromotionalCards: React.FC = () => (
  <div className="mt-8 w-full sm:mt-10">
    <div className="grid w-full grid-cols-1 gap-3 md:grid-cols-3 md:items-stretch md:gap-3 lg:gap-4">
      <div className={`${promoCardShell} bg-white`}>
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <span
            className="inline-flex w-fit items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold text-white shadow-[0_2px_6px_rgba(8,19,38,0.12)]"
            style={{
              background: "linear-gradient(90.59deg, #5383DA 0%, #2351A3 50%, #081326 100%)",
            }}
          >
            <img src={Celebration} alt="" className="h-3 w-3 shrink-0" />
            Welcome gift
          </span>
          <p className="text-balance text-[14px] font-semibold leading-tight tracking-tight text-[#0A0C0F] sm:text-[15px] md:text-[15px] lg:text-[16px]">
            Get 25% off on your first booking
          </p>
        </div>
        <Link
          to="/auth"
          className="inline-flex h-9 shrink-0 items-center justify-center self-start rounded-[8px] bg-[#2B59A2] px-4 text-[11px] font-semibold text-white transition-colors hover:bg-[#244a8a] active:bg-[#1f3f75] md:self-center"
        >
          Sign in to claim
        </Link>
      </div>

      <div
        className={`${promoCardShell} border-0 text-white ring-white/10`}
        style={{
          background: "linear-gradient(90deg, #5383DA 0%, #2351A3 42%, #081326 100%)",
          boxShadow: "0 10px 28px rgba(8,19,38,0.22)",
        }}
      >
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <p className="text-[10px] font-medium leading-snug text-[#A7C0EC] sm:text-[11px]">
            Did you know?
          </p>
          <p className="text-balance text-[12px] font-semibold leading-snug text-white sm:text-[13px] md:text-[13px]">
            Al-Rais members get better deals and prices on Flights and Hotels.
          </p>
        </div>
        <Link
          to="/auth"
          state={{ mode: "signup" }}
          className="inline-flex h-9 shrink-0 items-center justify-center self-start rounded-[8px] bg-white px-4 text-[11px] font-semibold text-[#081326] transition-colors hover:bg-[#F4F7FB] active:bg-[#E8EDF5] md:self-center"
        >
          Create an account
        </Link>
      </div>

      <div className={`${promoCardShell} bg-white`}>
        <div className="flex min-w-0 flex-1 flex-col justify-center">
          <p className="text-balance text-[14px] font-semibold leading-tight tracking-tight text-[#0A0C0F] sm:text-[15px] md:text-[15px] lg:text-[16px]">
            Your all-in-one travel booking companion!
          </p>
        </div>
        <Link
          to="/search_flight"
          className="inline-flex h-9 shrink-0 items-center justify-center self-start rounded-[8px] bg-[#2351A3] px-4 text-[11px] font-semibold text-white transition-colors hover:bg-[#1b4181] active:bg-[#183875] md:self-center"
        >
          Explore now
        </Link>
      </div>
    </div>
  </div>
);

const HeroSection: React.FC = () => {
  const heroTab = useLandingHeroStore((s) => s.heroTab);
  const setHeroTab = useLandingHeroStore((s) => s.setHeroTab);
  const setLandingHeroSearchTab = useHotelStore((s) => s.setLandingHeroSearchTab);

  const selectTab = (tab: "flights" | "hotels") => {
    setHeroTab(tab);
    setLandingHeroSearchTab(tab);
    const el = document.getElementById("hero-search-form");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  return (
    <div className="mx-auto w-full max-w-[1360px] px-3 sm:px-5">
      <div
        id="hero-search-form"
        className="w-full overflow-x-clip overflow-y-visible rounded-[16px] bg-white shadow-[0_10px_32px_rgba(8,19,38,0.1)] ring-1 ring-[#E4E4E7]/80 sm:rounded-[18px]"
      >
        <div className="flex items-end justify-center gap-10 border-b border-[#E8EDF5] bg-white px-4 py-2 sm:gap-14 sm:py-3">
          <button
            type="button"
            onClick={() => selectTab("flights")}
            className={`relative flex w-max flex-col items-center justify-end pb-3 pt-1 text-center font-sans text-[16px] font-medium leading-none tracking-normal transition-colors ${
              heroTab === "flights"
                ? "text-[#2351A3]"
                : "text-[#3D495C] hover:text-[#2351A3]"
            }`}
          >
            <span className="inline-block whitespace-nowrap">Flights</span>
            {heroTab === "flights" ? <HeroTabUnderline /> : null}
          </button>
          <button
            type="button"
            onClick={() => selectTab("hotels")}
            className={`relative flex w-max flex-col items-center justify-end pb-3 pt-1 text-center font-sans text-[16px] font-medium leading-none tracking-normal transition-colors ${
              heroTab === "hotels"
                ? "text-[#2351A3]"
                : "text-[#3D495C] hover:text-[#2351A3]"
            }`}
          >
            <span className="inline-block whitespace-nowrap">Hotels</span>
            {heroTab === "hotels" ? <HeroTabUnderline /> : null}
          </button>
        </div>
        <div className="px-3 pb-3 pt-2 sm:px-5 sm:pb-4 sm:pt-3">
          {heroTab === "flights" && <FlightHeroSectionTab />}
          {heroTab === "hotels" && <HotelHeroSectionTab />}
        </div>
      </div>
      <PromotionalCards />
    </div>
  );
};

export default HeroSection;
