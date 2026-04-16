import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Modal, message } from "antd";
import { useAuth } from "../../features/auth/hooks/useAuth";
import { Splide, SplideSlide } from "@splidejs/react-splide";
import "@splidejs/react-splide/css";

import ArrowLeftIcon from "../../assets/images/arrow-left-s-line 1.png";
import ArrowRightIcon from "../../assets/images/arrow-right-s-line 2.png";

import CardImage1 from "../../assets/images/card-images (1).jpg";
import CardImage2 from "../../assets/images/card-images (2).jpg";
import CardImage3 from "../../assets/images/card-images (3).jpg";
import CardImage4 from "../../assets/images/card-images (4).jpg";
import CardImage5 from "../../assets/images/card-images (1).jpg";

import FlightIcon from "./Flight-icon-for-card.png";
import HotelIcon from "./Hotel-icon-for -card.png";

type Deal = {
  id: string;
  title: string; // overlay title on image
  image: string;
  price: number;
};

const DEALS: Deal[] = [
  {
    id: "1",
    title: "MAKKAH\n& MEDINA",
    image: CardImage1,
    price: 157,
  },
  {
    id: "2",
    title: "MAKKAH\n& MEDINA",
    image: CardImage2,
    price: 157,
  },
  {
    id: "3",
    title: "MAKKAH\n& MEDINA",
    image: CardImage3,
    price: 157,
  },
  {
    id: "4",
    title: "MAKKAH\n& MEDINA",
    image: CardImage4,
    price: 157,
  },
  {
    id: "5",
    title: "MAKKAH\n& MEDINA",
    image: CardImage5,
    price: 157,
  },
];

const FILTER_TABS = ["Below $199", "Below $399", "Below $699", "Below $999"] as const;

const CATEGORY_OPTIONS = [
  "Umrah packages",
  "Hajj packages",
  "Flight deals",
  "Hotel deals",
];

const MAIN_MAX_WIDTH = 1464;
// Reduced card width so five cards can fit within the main max width with gaps
const DEAL_CARD_WIDTH = 280;
const DEAL_CARD_HEIGHT = 520;
const DEAL_IMAGE_HEIGHT = 370;
const DEAL_GAP = 20;

const DealCard: React.FC<{ d: Deal }> = ({ d }) => {
  const { isAuthenticated } = useAuth();

  const [successVisible, setSuccessVisible] = useState(false);
  const [loginVisible, setLoginVisible] = useState(false);

  const handleBookNow = () => {
    if (isAuthenticated) {
      setSuccessVisible(true);
    } else {
      setLoginVisible(true);
    }
  };

  const handleLoginRedirect = () => {
    message.info("Redirecting to login...");
    window.location.href = "/auth";
  };

  return (
    <div
      className="group flex flex-col"
      style={{ width: DEAL_CARD_WIDTH, height: DEAL_CARD_HEIGHT }}
    >
      {/* Image block */}
      <div
        className="relative overflow-hidden"
        style={{ width: DEAL_CARD_WIDTH, height: DEAL_IMAGE_HEIGHT, borderRadius: 16 }}
      >
        {/* Image zooms + fades slightly on hover */}
        <img
          src={d.image}
          alt="Deal"
          className="h-full w-full object-cover transition-all duration-500 ease-out group-hover:scale-110 group-hover:opacity-85"
          style={{ borderRadius: 16 }}
        />

        {/* Readability fade */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/55 via-black/10 to-transparent rounded-b-[16px]" />

        {/* Overlay title */}
        <div className="absolute bottom-6 left-6">
          <p className="whitespace-pre-line text-[34px] leading-[38px] font-bold tracking-wide text-white drop-shadow-md">
            {d.title}
          </p>
        </div>
      </div>

      {/* Bottom content */}
      <div className="mt-3 flex items-start justify-between gap-3">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-[12px] text-[#3D495C]">
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full">
              <img src={FlightIcon} alt="Flights" className="h-5 w-8" />
            </span>
            <span>Round-trip flights</span>
          </div>
          <div className="flex items-center gap-2 text-[12px] text-[#3D495C]">
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full">
              <img src={HotelIcon} alt="Hotels" className="h-5 w-8" />
            </span>
            <span>4 nights hotels</span>
          </div>
        </div>

        <div className="text-right">
          <p className="text-[12px] text-[#3D495C] leading-tight">Starting from</p>
          <p className="text-[22px] font-semibold text-[#2351A3] leading-tight">
            ${d.price}
          </p>
        </div>
      </div>

      {/* Book now button */}
      <div className="mt-auto pt-4 flex justify-end">
        <button
          type="button"
          onClick={handleBookNow}
          className="text-white bg-[#2351A3] hover:bg-[#1E4690] active:bg-[#1A3C7E] transition-colors font-medium text-[13px]"
          style={{ width: 119, height: 41, borderRadius: 8, padding: "7px 21px" }}
        >
          Book now
        </button>
      </div>

      {/* Existing behavior kept (login/success) */}
      <Modal
        open={successVisible}
        onOk={() => setSuccessVisible(false)}
        onCancel={() => setSuccessVisible(false)}
        okText="Great!"
        title="Booking Successful"
      >
        <p>
          Your trip has been booked successfully!
        </p>
      </Modal>

      <Modal
        open={loginVisible}
        onOk={handleLoginRedirect}
        onCancel={() => setLoginVisible(false)}
        okText="Login"
        cancelText="Cancel"
        title="Login Required"
      >
        <p>Please login to book your trip.</p>
      </Modal>
    </div>
  );
};

const BestDealsSection: React.FC = () => {
  const [active, setActive] = useState(0); // UI-only
  const [category, setCategory] = useState("Umrah packages");
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);

  const [splide, setSplide] = useState<{ go: (dir: string) => void } | null>(null);
  const goPrev = useCallback(() => splide?.go("<"), [splide]);
  const goNext = useCallback(() => splide?.go(">"), [splide]);

  const deals = useMemo(() => DEALS, []);
  const [visibleCount, setVisibleCount] = useState(4);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isMobileView, setIsMobileView] = useState(false);

  // Scroll-triggered entrance
  const sectionRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { threshold: 0.08 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const compute = () => {
      const w = window.innerWidth;
      // show 4 fully visible cards on wide screens so the 5th appears dimmed/peeked
      if (w >= 1280) return 4;
      if (w >= 1024) return 3;
      if (w >= 768) return 2;
      return 1;
    };
    const update = () => setVisibleCount(compute());
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  useEffect(() => {
    const update = () => setIsMobileView(window.innerWidth < 768);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const arrowBase = [
    "flex items-center justify-center rounded-full bg-transparent",
    "transition-all duration-200 ease-out",
    "hover:bg-[#EEF3FF] hover:scale-110 active:scale-95",
  ].join(" ");

  return (
    <div
      ref={sectionRef}
      className="mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-14 md:pt-16 pb-12"
      style={{ maxWidth: MAIN_MAX_WIDTH }}
    >
      {/* Heading — fade + slide down on scroll-in */}
      <div
        className={[
          "text-center lg:text-left lg:ml-[67px]",
          "transition-all duration-500 ease-out",
          visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4",
        ].join(" ")}
      >
        <p className="text-sm text-[#3D495C]">Best deals</p>
        <h2 className="mt-2 text-3xl sm:text-5xl font-medium text-[#0A0C0F]">
          No one can beat these prices
        </h2>
      </div>

      {/* Filter row — fade in after heading */}
      <div
        className={[
          "relative z-50 mt-4 lg:ml-[67px]",
          "transition-all duration-500 ease-out",
          visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
        ].join(" ")}
        style={{ transitionDelay: visible ? "120ms" : "0ms" }}
      >
        <div className="flex flex-col sm:flex-row sm:flex-nowrap items-center justify-center sm:justify-between gap-3 sm:gap-4">
          {/* Price tabs */}
          <div
            className="flex w-full sm:w-auto shrink-0 items-center justify-center p-[5px] overflow-x-auto overflow-y-hidden"
            style={{
              width: "min(428px, 100%)",
              height: 50,
              borderRadius: 16,
              background: "var(--white-100, #F2F2F3)",
              border: "1.5px solid var(--black-200, #3D495C)",
            }}
          >
            <div className="flex items-center gap-1 flex-nowrap">
              {FILTER_TABS.map((label, i) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => setActive(i)}
                  className={[
                    "text-[12px] font-medium whitespace-nowrap rounded-[12px]",
                    "transition-all duration-200 ease-out",
                    "active:scale-95",
                    active === i
                      ? "-translate-y-[1px] shadow-[0_2px_8px_rgba(35,81,163,0.30)]"
                      : "hover:bg-white/60",
                  ].join(" ")}
                  style={{
                    width: 97,
                    height: 40,
                    background: active === i ? "var(--primary-300, #2351A3)" : "transparent",
                    color: active === i ? "#FFFFFF" : "#3D495C",
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Category dropdown */}
          <div
            className="relative shrink-0 w-full sm:w-auto sm:mr-8"
            style={{ width: "min(178px, 100%)", height: 50 }}
          >
            <button
              onClick={() => setIsCategoryOpen(!isCategoryOpen)}
              className="w-full h-full bg-white rounded-[16px] flex items-center justify-between pl-4 pr-3 text-[13px] font-medium text-[#3D495C] outline-none cursor-pointer hover:bg-[#FAFAFA] transition-colors"
              style={{ border: "1.5px solid var(--black-200, #3D495C)" }}
            >
              <span>{category}</span>
              <svg
                className={`w-4 h-4 transition-transform flex-shrink-0 ${isCategoryOpen ? "rotate-180" : ""}`}
                fill="none"
                stroke="currentColor"
                strokeWidth="2.3"
                strokeLinecap="round"
                strokeLinejoin="round"
                viewBox="0 0 24 24"
              >
                <path d="M7 10l5 5 5-5" />
              </svg>
            </button>

            {isCategoryOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-[#F2F2F3] rounded-2xl border border-[#F2F2F3] shadow-lg z-10 overflow-hidden">
                {CATEGORY_OPTIONS.map((option, index) => (
                  <div
                    key={option}
                    onClick={() => { setCategory(option); setIsCategoryOpen(false); }}
                    className={`px-4 py-2.5 cursor-pointer flex items-center justify-between transition-colors hover:bg-white/70 ${index !== CATEGORY_OPTIONS.length - 1 ? "border-b border-[#E4E4E7]" : ""}`}
                  >
                    <span style={{ color: "#0A0C0F", fontSize: 13, fontWeight: 400 }}>{option}</span>
                    {category === option && (
                      <svg width="16" height="12" viewBox="0 0 16 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M15.4425 1.06754L5.44254 11.0675C5.38449 11.1256 5.31556 11.1717 5.23969 11.2032C5.16381 11.2347 5.08248 11.2508 5.00035 11.2508C4.91821 11.2508 4.83688 11.2347 4.76101 11.2032C4.68514 11.1717 4.61621 11.1256 4.55816 11.0675L0.18316 6.69254C0.0658846 6.57526 0 6.4162 0 6.25035C0 6.0845 0.0658846 5.92544 0.18316 5.80816C0.300435 5.69088 0.459495 5.625 0.625347 5.625C0.7912 5.625 0.95026 5.69088 1.06753 5.80816L5.00035 9.74175L14.5582 0.18316C14.6754 0.0658843 14.8345 -1.2357e-09 15.0003 0C15.1662 1.2357e-09 15.3253 0.0658843 15.4425 0.18316C15.5598 0.300435 15.6257 0.459495 15.6257 0.625347C15.6257 0.7912 15.5598 0.95026 15.4425 1.06754Z" fill="#2351A3" />
                      </svg>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Slider row — fade in last */}
      <div
        className={[
          "mt-6 flex items-center gap-4",
          "transition-all duration-600 ease-out",
          visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6",
        ].join(" ")}
        style={{ transitionDelay: visible ? "220ms" : "0ms" }}
      >
        {/* Left arrow */}
        <button
          type="button"
          aria-label="Previous deals"
          onClick={goPrev}
          className={`hidden sm:flex flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 ${arrowBase}`}
        >
          <img src={ArrowLeftIcon} alt="Prev" className="custom-arrow" />
        </button>

        <div
          className={[
            "flex-1 min-w-0 relative",
            isMobileView ? "[&_.splide__track]:overflow-hidden" : "[&_.splide__track]:overflow-visible",
          ].join(" ")}
        >
          {/* Figma: right-edge fade — linear-gradient(90deg, transparent 0%, white 67.71%) */}
          <div
            className="pointer-events-none absolute inset-y-0 right-0 z-10 w-48 sm:w-56 hidden md:block"
            style={{
              background: "linear-gradient(90deg, rgba(255, 255, 255, 0) 0%, #FFFFFF 67.71%)",
            }}
          />
          <Splide
            aria-label="Best deals"
            options={{
              type: "loop",
              arrows: false,
              pagination: false,
              perMove: 1,
              gap: `${DEAL_GAP}px`,
              fixedWidth: `${DEAL_CARD_WIDTH}px`,
              focus: 0,
              padding: { right: `${DEAL_CARD_WIDTH / 2}px` },
              trimSpace: false,
              breakpoints: {
                1440: {
                  fixedWidth: `${DEAL_CARD_WIDTH}px`,
                  padding: { right: `${DEAL_CARD_WIDTH / 2}px` },
                },
                1280: {
                  fixedWidth: `${DEAL_CARD_WIDTH}px`,
                  padding: { right: "100px" },
                },
                1024: {
                  fixedWidth: `${DEAL_CARD_WIDTH}px`,
                  padding: { right: "100px" },
                },
                768: {
                  fixedWidth: "320px",
                  padding: { right: "60px" },
                },
                640: {
                  fixedWidth: `${DEAL_CARD_WIDTH}px`,
                  padding: { right: "0px", left: "0px" },
                  gap: "12px",
                  trimSpace: true,
                },
                480: {
                  fixedWidth: `${DEAL_CARD_WIDTH}px`,
                  padding: { right: "0px", left: "0px" },
                  gap: "12px",
                  trimSpace: true,
                },
              },
            }}
            onMounted={(instance: { go: (dir: string) => void; index?: number }) => {
              setSplide(instance);
              setActiveIndex(typeof instance.index === "number" ? instance.index : 0);
            }}
            onMoved={(_splide: unknown, newIndex: number) => setActiveIndex(newIndex)}
          >
            {deals.map((d, idx) => {
              const isFullyVisible =
                idx >= activeIndex && idx < activeIndex + visibleCount;
              const opacity = isMobileView ? 1 : isFullyVisible ? 1 : 0.25;
              return (
                <SplideSlide key={d.id}>
                  <div style={{ opacity, transition: "opacity 220ms ease" }}>
                    <DealCard d={d} />
                  </div>
                </SplideSlide>
              );
            })}
          </Splide>
        </div>

        {/* Right arrow */}
        <button
          type="button"
          aria-label="Next deals"
          onClick={goNext}
          className={`hidden sm:flex flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 ${arrowBase}`}
        >
          <img src={ArrowRightIcon} alt="Next" className="custom-arrow" />
        </button>
      </div>

      {/* Mobile arrows */}
      <div className="mt-3 flex items-center justify-center gap-6 sm:hidden">
        <button type="button" aria-label="Previous deals" onClick={goPrev} className={`w-10 h-10 ${arrowBase}`}>
          <img src={ArrowLeftIcon} alt="Prev" className="custom-arrow" />
        </button>
        <button type="button" aria-label="Next deals" onClick={goNext} className={`w-10 h-10 ${arrowBase}`}>
          <img src={ArrowRightIcon} alt="Next" className="custom-arrow" />
        </button>
      </div>
    </div>
  );
};

export default BestDealsSection;
