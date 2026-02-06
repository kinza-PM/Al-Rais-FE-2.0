import React, { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { MainLayout } from "../components";
import HeroSection from "../components/molecules/HeroSection";
// import HeroCarousel from "../components/molecules/HeroCarousel";
import PartnersSection from "../components/molecules/PartnersSection";
import WhyChooseUs from "../components/molecules/WhyChooseUsSection";
import ReadyToFlySection from "../components/molecules/ReadyToFlySection";
import SliderMainPic from "../assets/images/Slider-main-Pic.jpg";
import SliderTopRight from "../assets/images/Slider-top-right.png";
import PolygonShape from "../assets/images/Polygon 1.png";
import PopularDestinationSection from "../components/molecules/PopularDestinationSection";
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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [product, setProduct] = useState<"flights" | "hotels" | "cars" | "packages">("flights");

  const [currentIndex, setCurrentIndex] = useState(0);

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
          <div className="relative w-full max-w-[1120px]">
            {/* Main slider content */}
            <div className="relative">
              {/* Background image */}
              <img
                src={currentSlide.bgImage}
                alt="Background image"
                className="w-full h-[374px] sm:h-[320px] md:h-[360px] lg:h-[400px] xl:h-[430px] rounded-[24px] object-cover"
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
                      marginLeft: '-40px',
                    }}
                  />
                  
                  {/* Text overlay on polygon */}
                  <div className="relative flex items-center h-full px-6 sm:px-8 z-10">
                    <p className="text-white font-semibold text-xl sm:text-2xl md:text-[28px] lg:text-[32px] leading-snug sm:leading-snug md:leading-9 lg:leading-[40px] max-w-xs sm:max-w-sm whitespace-pre-line">
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
                    height: 57,
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

            {/* Navigation arrows - styled buttons with more gap from card */}
            <div className="absolute inset-0 flex items-center justify-between pointer-events-none px-4">
              <button
                type="button"
                className="pointer-events-auto -translate-x-16 sm:-translate-x-20 md:-translate-x-24 lg:-translate-x-28 flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
                onClick={prevSlide}
                aria-label="Previous slide"
              >
                <svg
                  className="w-6 h-6 sm:w-7 sm:h-7 text-[#2351A3]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              <button
                type="button"
                className="pointer-events-auto translate-x-16 sm:translate-x-20 md:translate-x-24 lg:translate-x-28 flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
                onClick={nextSlide}
                aria-label="Next slide"
              >
                <svg
                  className="w-6 h-6 sm:w-7 sm:h-7 text-[#2351A3]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {/* Bottom tabs: Flights / Hotels / Packages */}
            <div
              className="absolute left-1/2 flex gap-[10px] z-10"
              style={{ transform: "translateX(-50%)", bottom: "-0.01rem" }}
            >
              {/* Active tab – Flights */}
              <button
                type="button"
                className="flex items-center justify-center text-[16px] font-medium leading-[1] text-white bg-[#2351A3] shadow-[0_6px_18px_rgba(2,6,23,0.35)]"
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
                className="flex items-center justify-center text-[16px] font-medium leading-[1] text-[#081326] bg-[#E5E7EB]"
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
        <div className="mt-12 sm:mt-16 mb-24">
          <HeroSection />
        </div>
      </div>

      <div className="bg-white">
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