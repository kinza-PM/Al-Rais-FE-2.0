import React, { useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { MainLayout } from "../components";
import HeroSection from "../components/molecules/HeroSection";
import WhyChooseUs from "../components/molecules/WhyChooseUsSection";
import ReadyToFlySection from "../components/molecules/ReadyToFlySection";
import PopularDestinationSection from "../components/molecules/PopularDestinationSection";
import RecentSearchesSection from "../components/molecules/RecentSearchesSection";
import BestDealsSection from "../components/molecules/BestDealsSection";
import CustomersFeedbackSection from "../components/molecules/CustomersFeedbackSection";
import PartnersSection from "../components/molecules/PartnersSection";
import { getCountryFromBrowserLocation } from "../utils/geolocationHelper";
import { setListingUserCountryFromLocation } from "../utils/listingUserCountry";

interface LandingPageContext {
  onLoginClick: () => void;
  onSignupClick: () => void;
}

const LandingPage: React.FC = () => {
  const { onLoginClick, onSignupClick } =
    useOutletContext<LandingPageContext>();

  useEffect(() => {
    void getCountryFromBrowserLocation().then((result) => {
      if (result) {
        setListingUserCountryFromLocation(result.country);
      }
    });
  }, []);

  return (
    <MainLayout
      onLoginClick={onLoginClick}
      onSignupClick={onSignupClick}
      addPadding={false}
    >
      <section
        className="relative mx-auto w-full max-w-[1920px] overflow-hidden pb-10 pt-8 sm:pb-14 sm:pt-12"
        style={{
          background: "linear-gradient(107.56deg, #FFFFFF 0%, #A7C0EC 100%)",
          minHeight: "min(100dvh, 1080px)",
        }}
      >
        <div className="relative z-[1] mx-auto max-w-[1360px] px-4 text-center sm:px-6">
          <h1 className="text-balance text-3xl font-medium leading-[1.12] tracking-tight text-[#081326] sm:text-[32px] md:text-[38px] lg:text-[42px]">
            Experience the true{" "}
            <span className="font-semibold text-[#EA0029]">richness</span> of
            travel.
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-xs leading-relaxed text-[#3D495C] sm:mt-4 sm:text-sm">
            Book flights and hotels with a calm, modern experience designed for
            clarity and speed.
          </p>
        </div>

        <div className="relative z-[1] mx-auto mt-8 w-full max-w-[1360px] px-3 sm:mt-10 sm:px-5">
          <HeroSection />
        </div>
      </section>

      <div className="bg-white">
        <RecentSearchesSection />
        <PopularDestinationSection />
        <BestDealsSection />
        <PartnersSection />
        <WhyChooseUs />
        <CustomersFeedbackSection />
        <ReadyToFlySection />
      </div>
    </MainLayout>
  );
};

export default LandingPage;
