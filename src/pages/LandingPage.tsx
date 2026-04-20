import React, { 
  useState, 
  useEffect, 
  // useLayoutEffect
 } from "react";
import { useOutletContext } from "react-router-dom";
import { MainLayout } from "../components";
import HeroSection from "../components/molecules/HeroSection";
// import HeroCarousel from "../components/molecules/HeroCarousel";
// import PartnersSection from "../components/molecules/PartnersSection";
import WhyChooseUs from "../components/molecules/WhyChooseUsSection";
import ReadyToFlySection from "../components/molecules/ReadyToFlySection";
// import { useHotelStore } from "../store/UseHotelStore";
import SliderMainPic from "../assets/images/Slider-main-Pic.jpg";
import SliderTopRight from "../assets/images/Slider-top-right.png";
import PolygonShape from "../assets/images/Polygon 1.png";
import ArrowLeft from "../assets/images/arrow-left-s-line 1.png";
import ArrowRight from "../assets/images/arrow-right-s-line 2.png";
import PopularDestinationSection from "../components/molecules/PopularDestinationSection";
import RecentSearchesSection from "../components/molecules/RecentSearchesSection";
import { useLandingHeroStore } from "../store/useLandingHeroStore";
import BestDealsSection from "../components/molecules/BestDealsSection";
import CustomersFeedbackSection from "../components/molecules/CustomersFeedbackSection";
import { getCountryFromBrowserLocation } from "../utils/geolocationHelper";
import { setListingUserCountryFromLocation } from "../utils/listingUserCountry";

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
  const heroSearchTab = useLandingHeroStore((s) => s.heroTab);
  const setHeroSearchTab = useLandingHeroStore((s) => s.setHeroTab);

  const handleHeroTopTabClick = (tab: "flights" | "hotels" | "sightseeing") => {
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

  useEffect(() => {
    void getCountryFromBrowserLocation().then((result) => {
      if (result) {
        setListingUserCountryFromLocation(result.country);
        console.log(
          "[LandingPage] User country from location:",
          result.country,
          `(${result.countryCode})`,
        );
      } else {
        console.log(
          "[LandingPage] User country from location: unavailable (permission, timeout, unsupported, or geocode failed)",
        );
      }
    });
  }, []);

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
      <div className="relative flex flex-col max-w-full px-2 pt-4 pb-4 sm:px-4 sm:pt-6">
        {/* Hero slider container */}
        <div className="w-full flex justify-center">
          <div className="relative w-full max-w-[1250px] pb-12 sm:pb-14 xl:pb-0">
            {/* Main slider content */}
            <div className="relative w-full overflow-hidden rounded-[25px] xl:overflow-visible">
              {/* Background image — fluid on small screens; fixed Figma dimensions from xl up */}
              <img
                src={currentSlide.bgImage}
                alt="Background image"
                className="block w-full max-w-full rounded-[25px] object-cover opacity-100 ml-0 h-[220px] min-[400px]:h-[240px] sm:h-[280px] md:h-[320px] xl:w-[1177px] xl:h-[390px] xl:ml-[68px] xl:max-w-none"
              />

              {/* Red polygon image with text */}
              <div
                className="absolute inset-y-0 left-0 flex items-center overflow-hidden pl-2 min-[400px]:pl-4 sm:pl-7 xl:px-10 w-[60%] min-[400px]:w-[56%] xl:w-[52%]"
              >
                <div className="relative h-full w-full min-h-0">
                  {/* Polygon background image - fixed to top and bottom with rounded left corners */}
                  <img
                    src={PolygonShape}
                    alt="Polygon background"
                    className="w-full h-full absolute inset-0 rounded-l-[20px] -ml-4 min-[400px]:-ml-5 xl:-ml-[40px] object-cover object-left"
                  />

                  {/* Text overlay on polygon */}
                  <div className="relative flex items-center xl:items-end h-full z-10 xl:pb-20">
                    <p
                      className="text-white leading-[108%] font-normal whitespace-pre-line text-[17px] min-[400px]:text-[21px] sm:text-[28px] md:text-[34px] xl:text-[42px]"
                      style={{ fontFamily: "Inter, sans-serif", letterSpacing: "0%" }}
                    >
                      {currentSlide.text}
                    </p>
                  </div>
                </div>
              </div>

              {/* Top-right badge */}
              <div className="absolute top-2 right-2 sm:top-4 sm:right-4 xl:top-6 xl:right-6">
                <div
                  className="bg-white shadow-[0_10px_30px_rgba(0,0,0,0.15)] flex items-center justify-center scale-[0.85] origin-top-right sm:scale-90 xl:scale-100 mt-0 mr-0 xl:mt-[-24px] xl:mr-[25px]"
                  style={{
                    width: 131,
                    height: 45,
                    borderBottomRightRadius: 30,
                    borderBottomLeftRadius: 30,
                    opacity: 1,
                  }}
                >
                  <img
                    src={currentSlide.badgeImage}
                    alt={currentSlide.badgeAlt}
                    className="h-6 sm:h-7 md:h-8 w-auto"
                  />
                </div>
              </div>

              {/* Navigation arrows — inside image bounds so centering ignores outer pb for tabs */}
              <div className="absolute inset-0 flex items-center justify-between pointer-events-none px-1 sm:px-2 xl:px-2">
                <button
                  type="button"
                  className="pointer-events-auto flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-transparent transition-colors duration-150 translate-x-0 xl:-translate-x-8"
                  onClick={prevSlide}
                  aria-label="Previous slide"
                  style={{ background: "transparent" }}
                >
                  <img src={ArrowLeft} alt="Previous" className="custom-arrow" />
                </button>

                <button
                  type="button"
                  className="pointer-events-auto flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-transparent transition-colors duration-150 translate-x-0 xl:translate-x-7"
                  onClick={nextSlide}
                  aria-label="Next slide"
                  style={{ background: "transparent" }}
                >
                  <img src={ArrowRight} alt="Next" className="custom-arrow" />
                </button>
              </div>
            </div>

            {/* Bottom tabs: Flights / Hotels / Sightseeing / Packages */}
            <div className="absolute inset-x-0 z-10 bottom-0 flex justify-center px-2 sm:px-3 xl:px-0" style={{ bottom: "-0.01rem" }}>
              <div className="flex w-full max-w-[95vw] flex-wrap justify-center gap-1.5 sm:gap-2 xl:w-auto xl:max-w-none xl:flex-nowrap xl:gap-[10px]">
                {(
                  [
                    { key: "flights",     label: "FLIGHTS"     },
                    { key: "hotels",      label: "HOTELS"      },
                    { key: "sightseeing", label: "SIGHTSEEING" },
                    { key: "packages",    label: "PACKAGES"    },
                  ] as const
                ).map(({ key, label }) => {
                  const isActive = heroSearchTab === key;
                  const isClickable = key !== "packages";
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={isClickable ? () => handleHeroTopTabClick(key as "flights" | "hotels" | "sightseeing") : undefined}
                      className={[
                        // base layout
                        "flex items-center justify-center whitespace-nowrap",
                        "w-[calc(50%-0.2rem)] max-w-[170px] min-w-[126px] sm:w-auto shrink-0 xl:min-w-[96px]",
                        "px-3 xl:px-[14px] h-[39px] pb-0",
                        "text-[11px] min-[400px]:text-[12px] sm:text-[13px] xl:text-[16px]",
                        "font-medium leading-[1] rounded-tl-2xl rounded-tr-2xl rounded-bl-none rounded-br-none",
                        // smooth transitions: background, color, shadow, transform
                        "transition-all duration-200 ease-out",
                        // active lift — tab rises 2px to "pop forward"
                        isActive ? "-translate-y-[2px]" : "translate-y-0",
                        // active vs idle colours + shadow
                        isActive
                          ? "text-white bg-[#2351A3] shadow-[0_6px_18px_rgba(2,6,23,0.35)]"
                          : "text-[#081326] bg-[#E5E7EB] hover:bg-[#D1D9E6] hover:text-[#2351A3]",
                        // press-down feedback
                        isClickable ? "active:scale-95 cursor-pointer" : "cursor-default",
                        // focus ring for accessibility
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2351A3] focus-visible:ring-offset-1",
                      ].join(" ")}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Keep hero/search tighter on desktop so banner stays visible above the fold */}
        <div className="mt-8 sm:mt-10 lg:mt-7 xl:mt-6 mb-16 lg:mb-20">
          <HeroSection activeTab={heroSearchTab} />
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
