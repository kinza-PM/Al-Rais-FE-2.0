import React from "react";
import { useOutletContext } from "react-router-dom";
import { MainLayout } from "../components";
import HeroSection from "../components/molecules/HeroSection";
import PartnersSection from "../components/molecules/PartnersSection";
import WhyChooseUs from "../components/molecules/WhyChooseUsSection";
import ReadyToFlySection from "../components/molecules/ReadyToFlySection";
// import React, { useRef } from 'react';
// import { useOutletContext } from 'react-router-dom';
// import { MainLayout } from '../components';
// import HeroSection from '../components/molecules/HeroSection';
import PopularDestinations from "../components/molecules/PopularDestinations";
import BestDealsSection from "../components/molecules/BestDealsSection";

interface LandingPageContext {
  onLoginClick: () => void;
  onSignupClick: () => void;
}

const LandingPage: React.FC = () => {
  const { onLoginClick, onSignupClick } =
    useOutletContext<LandingPageContext>();

  return (
    <MainLayout
      onLoginClick={onLoginClick}
      onSignupClick={onSignupClick}
      addPadding={false}
    >
      <div className="relative justify-center flex flex-col max-w-full p-4">
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-semibold text-black leading-tight mt-10 text-center">
          Experience the true <span className="text-[#EA0029]">richness</span>{" "}
          of travel.
        </h1>

        <HeroSection />
        {/* <PopularDestination />
        <BestDeals /> */}
      </div>

      <div className="bg-white">
        <PopularDestinations />

        <BestDealsSection />
        <PartnersSection />
        <WhyChooseUs />
        <ReadyToFlySection />
      </div>
    </MainLayout>
  );
};

export default LandingPage;
