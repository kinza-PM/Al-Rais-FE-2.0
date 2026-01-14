import React, { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { MainLayout } from "../components";
import HeroSection from "../components/molecules/HeroSection";
// import HeroCarousel from "../components/molecules/HeroCarousel";
import PartnersSection from "../components/molecules/PartnersSection";
import WhyChooseUs from "../components/molecules/WhyChooseUsSection";
import ReadyToFlySection from "../components/molecules/ReadyToFlySection";
// import React, { useRef } from 'react';
// import { useOutletContext } from 'react-router-dom';
// import { MainLayout } from '../components';
// import HeroSection from '../components/molecules/HeroSection';
import PopularDestinationSection from "../components/molecules/PopularDestinationSection";
import BestDealsSection from "../components/molecules/BestDealsSection";

interface LandingPageContext {
  onLoginClick: () => void;
  onSignupClick: () => void;
}

const LandingPage: React.FC = () => {
  const { onLoginClick, onSignupClick } =
    useOutletContext<LandingPageContext>();
  const [product, setProduct] = useState<"flights" | "hotels" | "cars" | "packages">("flights");

  return (
    <MainLayout
      onLoginClick={onLoginClick}
      onSignupClick={onSignupClick}
      addPadding={false}
    >
      <div className="relative justify-center flex flex-col max-w-full p-4">
        {/* <HeroCarousel product={product} onProductChange={setProduct} /> */}

        <HeroSection
          activeTab={product === "hotels" ? "hotels" : "flights"}
          onTabChange={(tab) => setProduct(tab)}
        />
        {/* <PopularDestination />
        <BestDeals /> */}
      </div>

      <div className="bg-white">
        <PopularDestinationSection />

        <BestDealsSection />
        <PartnersSection />
        <WhyChooseUs />
        <ReadyToFlySection />
      </div>
    </MainLayout>
  );
};

export default LandingPage;
