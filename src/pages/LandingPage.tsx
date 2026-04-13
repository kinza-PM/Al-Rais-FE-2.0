import React, { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { MainLayout } from "../components";
import HeroSection from "../components/molecules/HeroSection";
// import HeroCarousel from "../components/molecules/HeroCarousel";
// import PartnersSection from "../components/molecules/PartnersSection";
import WhyChooseUs from "../components/molecules/WhyChooseUsSection";
import ReadyToFlySection from "../components/molecules/ReadyToFlySection";
import SliderMainPic from "../assets/images/Slider-main-Pic.jpg";
import SliderTopRight from "../assets/images/Slider-top-right.png";
import PolygonShape from "../assets/images/Polygon 1.png";
import ArrowLeft from "../assets/images/arrow-left-s-line 1.png";
import ArrowRight from "../assets/images/arrow-right-s-line 2.png";
import PopularDestinationSection from "../components/molecules/PopularDestinationSection";
import RecentSearchesSection from "../components/molecules/RecentSearchesSection";
import BestDealsSection from "../components/molecules/BestDealsSection";
import CustomersFeedbackSection from "../components/molecules/CustomersFeedbackSection";

interface LandingPageContext {
  onLoginClick: () => void;
  onSignupClick: () => void;
}

interface Slide {
  bgImage: string;
  text: string;
  badgeImage: string;
  badgeAlt: string;
}

const LandingPage: React.FC = () => {
  const { onLoginClick, onSignupClick } =
    useOutletContext<LandingPageContext>();

  const [currentIndex, setCurrentIndex] = useState(0);
  // Lifted hero tab state so top buttons can control Flights/Hotels search tab
  const [heroSearchTab, setHeroSearchTab] = useState<"flights" | "hotels">(
    "flights",
  );

  const handleHeroTopTabClick = (tab: "flights" | "hotels") => {
    setHeroSearchTab(tab);
    // scroll the hero search form into view
    const el = document.getElementById("hero-search-form");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  const slides: Slide[] = [
    {
      bgImage: SliderMainPic,
      text: "Experience\nthe true richness\nof travel.",
      badgeImage: SliderTopRight,
      badgeAlt: "Japan Endless Discovery",
    },
    {
      bgImage: SliderMainPic, // Replace with real second image when available
      text: "Discover\namazing destinations\naround the world.",
      badgeImage: SliderTopRight,
      badgeAlt: "Another Destination",
    },
    {
      bgImage: SliderMainPic, // Replace with real third image when available
      text: "Create\nunforgettable\nmemories\ntoday.",
      badgeImage: SliderTopRight,
      badgeAlt: "More Adventures",
    },
    // You can add more slides here
  ];

  // Auto-slide functionality
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, [slides.length]);

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  };

  const currentSlide = slides[currentIndex];

  return (
    <MainLayout
      onLoginClick={onLoginClick}
      onSignupClick={onSignupClick}
      addPadding={false}
    >
      <div className="relative flex flex-col max-w-full px-4 pt-6 pb-4">
        {/* Hero slider container */}
        <div className="w-full flex justify-center">
          <div className="relative w-full max-w-[1250px]">
            {/* Main slider content */}
            <div className="relative">
              {/* Background image */}
              <img
                src={currentSlide.bgImage}
                alt="Background image"
                className="rounded-[25px] object-cover"
                style={{
                  width: 1177,
                  height: 390,
                  borderRadius: 25,
                  opacity: 1,
                  marginLeft: 68,
                }}
              />

              {/* Red polygon image with text */}
              <div
                className="absolute inset-y-0 left-0 flex items-center px-8 sm:px-10 overflow-hidden"
                style={{
                  width: "52%",
                }}
              >
                <div className="relative h-full w-full">
                  {/* Polygon background image - fixed to top and bottom with rounded left corners */}
                  <img
                    src={PolygonShape}
                    alt="Polygon background"
                    className="w-full h-full absolute inset-0 rounded-l-[20px]"
                    style={{
                      marginLeft: "-40px",
                    }}
                  />

                  {/* Text overlay on polygon */}
                  <div className="relative flex items-end h-full z-10 pb-20">
                    <p className="text-white text-[42px] leading-[110%] font-normal whitespace-pre-line" style={{ fontFamily: "Inter, sans-serif", letterSpacing: "0%" }}>
                      {currentSlide.text}
                    </p>
                  </div>
                </div>
              </div>

              {/* Top-right badge */}
              <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
                <div
                  className="bg-white shadow-[0_10px_30px_rgba(0,0,0,0.15)] flex items-center justify-center"
                  style={{
                    width: 131,
                    height: 45,
                    borderBottomRightRadius: 30,
                    borderBottomLeftRadius: 30,
                    opacity: 1,
                    marginTop: -24,
                    marginRight: 25,
                  }}
                >
                  <img
                    src={currentSlide.badgeImage}
                    alt={currentSlide.badgeAlt}
                    className="h-6 sm:h-7 md:h-8 w-auto"
                  />
                </div>
              </div>
            </div>

            {/* Navigation arrows - simple transparent buttons matching Figma */}
            <div className="absolute inset-0 flex items-center justify-between pointer-events-none px-2">
              <button
                type="button"
                className="pointer-events-auto -translate-x-8 flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-transparent transition-colors duration-150"
                onClick={prevSlide}
                aria-label="Previous slide"
                style={{ background: "transparent" }}
              >
                <img src={ArrowLeft} alt="Previous" className="custom-arrow" />
              </button>

              <button
                type="button"
                className="pointer-events-auto translate-x-7 flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-transparent transition-colors duration-150"
                onClick={nextSlide}
                aria-label="Next slide"
                style={{ background: "transparent" }}
              >
                <img src={ArrowRight} alt="Next" className="custom-arrow" />
              </button>
            </div>

            {/* Bottom tabs: Flights / Hotels / Packages (now control hero search tab) */}
            <div
              className="absolute left-1/2 flex gap-[10px] z-10"
              style={{ transform: "translateX(-50%)", bottom: "-0.01rem" }}
            >
              {/* Active tab – Flights */}
              <button
                type="button"
                onClick={() => handleHeroTopTabClick("flights")}
                className={`flex items-center justify-center text-[16px] font-medium leading-[1] ${heroSearchTab === "flights" ? "text-white bg-[#2351A3] shadow-[0_6px_18px_rgba(2,6,23,0.35)]" : "text-[#081326] bg-[#E5E7EB]"}`}
                style={{
                  width: 108,
                  height: 39,
                  padding: "10px 20px",
                  borderTopLeftRadius: 16,
                  borderTopRightRadius: 16,
                }}
              >
                FLIGHTS
              </button>

              {/* Inactive tab – Hotels */}
              <button
                type="button"
                onClick={() => handleHeroTopTabClick("hotels")}
                className={`flex items-center justify-center text-[16px] font-medium leading-[1] ${heroSearchTab === "hotels" ? "text-white bg-[#2351A3] shadow-[0_6px_18px_rgba(2,6,23,0.35)]" : "text-[#081326] bg-[#E5E7EB]"}`}
                style={{
                  width: 108,
                  height: 39,
                  padding: "10px 20px",
                  borderTopLeftRadius: 16,
                  borderTopRightRadius: 16,
                }}
              >
                HOTELS
              </button>

              {/* Inactive tab – Packages */}
              <button
                type="button"
                // Packages remains independent for now
                className="flex items-center justify-center text-[16px] font-medium leading-[1] text-[#081326] bg-[#E5E7EB]"
                style={{
                  width: 108,
                  height: 39,
                  padding: "10px 20px",
                  borderTopLeftRadius: 16,
                  borderTopRightRadius: 16,
                }}
              >
                PACKAGES
              </button>
            </div>
          </div>
        </div>

        {/* Spacing below hero form so calendar can fully show */}
        <div className="mt-8 sm:mt-12 mb-24">
          <HeroSection
            activeTab={heroSearchTab}
            onTabChange={setHeroSearchTab}
          />
        </div>
      </div>

      <div className="bg-white">
        <RecentSearchesSection />
        <PopularDestinationSection />
        <BestDealsSection />
        {/* <PartnersSection /> */}
        <WhyChooseUs />
        <CustomersFeedbackSection />
        <ReadyToFlySection />
      </div>
    </MainLayout>
  );
};

export default LandingPage;
