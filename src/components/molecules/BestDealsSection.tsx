import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Modal, message } from "antd";
import { useAuth } from "../../features/auth/hooks/useAuth";
import { Splide, SplideSlide } from "@splidejs/react-splide";
import "@splidejs/react-splide/css";

import CardImage1 from "../../assets/images/card-images (1).jpg";
import CardImage2 from "../../assets/images/card-images (2).jpg";
import CardImage3 from "../../assets/images/card-images (3).jpg";
import CardImage4 from "../../assets/images/card-images (4).jpg";

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
];

const FILTER_TABS = ["Below $199", "Below $399", "Below $699", "Below $999"] as const;

const MAIN_MAX_WIDTH = 1464;
const DEAL_CARD_WIDTH = 350;
const DEAL_CARD_HEIGHT = 600;
const DEAL_IMAGE_HEIGHT = 460;
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
      className="flex flex-col"
      style={{ width: DEAL_CARD_WIDTH, height: DEAL_CARD_HEIGHT }}
    >
      {/* Image block (350x460, 16 radius) */}
      <div
        className="relative overflow-hidden"
        style={{
          width: DEAL_CARD_WIDTH,
          height: DEAL_IMAGE_HEIGHT,
          borderRadius: 16,
        }}
      >
        <img
          src={d.image}
          alt="Deal"
          className="h-full w-full object-cover"
          style={{
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            borderBottomLeftRadius: 16,
            borderBottomRightRadius: 16,
          }}
        />

        {/* subtle readability fade */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />

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
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#E6EEF9]">
              <img src={FlightIcon} alt="Flights" className="h-3 w-3" />
            </span>
            <span>Round-trip flights</span>
          </div>
          <div className="flex items-center gap-2 text-[12px] text-[#3D495C]">
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#E6EEF9]">
              <img src={HotelIcon} alt="Hotels" className="h-3 w-3" />
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

      {/* Book now — Figma: 119×41, 8px radius, 7px 21px padding, right-aligned */}
      <div className="mt-auto pt-4 flex justify-end">
        <button
          type="button"
          onClick={handleBookNow}
          className="text-white bg-[#2351A3] hover:bg-[#1E4690] active:bg-[#1A3C7E] transition-colors shadow-sm ring-1 ring-black/5 font-medium text-[13px]"
          style={{
            width: 119,
            height: 41,
            borderRadius: 8,
            padding: "7px 21px",
          }}
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

  const [splide, setSplide] = useState<{ go: (dir: string) => void } | null>(
    null
  );
  const goPrev = useCallback(() => splide?.go("<"), [splide]);
  const goNext = useCallback(() => splide?.go(">"), [splide]);

  const deals = useMemo(() => DEALS, []);
  const [visibleCount, setVisibleCount] = useState(4);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const compute = () => {
      const w = window.innerWidth;
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

  return (
    <div
      className="mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-14 md:pt-16 pb-12"
      style={{ maxWidth: MAIN_MAX_WIDTH }}
    >
      {/* Heading aligned with cards — margin-left: 67px */}
      <div className="ml-[67px] sm:ml-[67px]">
        <p className="text-sm text-[#3D495C]">Best deals</p>
        <h2 className="mt-2 text-3xl sm:text-5xl font-medium text-[#0A0C0F]">
          No one can beat these prices
        </h2>
      </div>

      {/* Single line: price buttons + dropdown — same left as cards (67px) */}
      <div className="mt-4 ml-[67px] sm:ml-[67px]">
        <div className="flex flex-row flex-nowrap items-center justify-between gap-3 sm:gap-4 best-deals-filters-row overflow-x-auto overflow-y-hidden">
        {/* Price list container: 428×50, 16px radius, Figma colors — no vertical scrollbar */}
        <div
          className="flex shrink-0 items-center justify-center p-[5px] overflow-x-auto overflow-y-hidden"
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
                className="text-[12px] font-medium whitespace-nowrap transition-colors rounded-[12px]"
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

        {/* Umrah packages dropdown — right-aligned, 178×50, single chevron */}
        <div
          className="relative shrink-0 mr-6 sm:mr-8"
          style={{ width: 178, height: 50 }}
        >
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full h-full appearance-none rounded-[16px] border bg-white pl-4 pr-10 text-[13px] font-medium text-[#3D495C] outline-none cursor-pointer hover:bg-[#FAFAFA] transition-colors"
            style={{ border: "1.5px solid var(--black-200, #3D495C)" }}
          >
            <option>Umrah packages</option>
            <option>Hajj packages</option>
            <option>Flight deals</option>
            <option>Hotel deals</option>
          </select>
          {/* Single chevron icon */}
          <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-[#3D495C]">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M7 10l5 5 5-5" />
            </svg>
          </div>
        </div>
      </div>
      </div>

      {/* Slider (opacity + peek) */}
      <div className="mt-6 flex items-center gap-4">
        {/* Left arrow */}
        <button
          type="button"
          aria-label="Previous deals"
          onClick={goPrev}
          className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-transparent text-[#A1A1AA] hover:text-[#71717A] transition-colors flex items-center justify-center"
        >
          <span className="text-3xl leading-none">‹</span>
        </button>

        <div
          className={[
            "flex-1 min-w-0 relative",
            "[&_.splide__track]:overflow-visible",
          ].join(" ")}
        >
          {/* Figma: right-edge fade — linear-gradient(90deg, transparent 0%, white 67.71%) */}
          <div
            className="pointer-events-none absolute inset-y-0 right-0 z-10 w-48 sm:w-56"
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
              padding: { right: "120px" },
              trimSpace: false,
              breakpoints: {
                1280: {
                  fixedWidth: `${DEAL_CARD_WIDTH}px`,
                  padding: { right: "100px" },
                },
                1024: {
                  fixedWidth: `${DEAL_CARD_WIDTH}px`,
                  padding: { right: "80px" },
                },
                768: {
                  fixedWidth: "320px",
                  padding: { right: "60px" },
                },
                480: {
                  fixedWidth: "280px",
                  padding: { right: "48px" },
                  gap: "16px",
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
              const opacity = isFullyVisible ? 1 : 0.25;
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

        {/* Right arrow (blue in design) */}
        <button
          type="button"
          aria-label="Next deals"
          onClick={goNext}
          className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-transparent text-[#2351A3] hover:text-[#1E4690] transition-colors flex items-center justify-center"
        >
          <span className="text-3xl leading-none">›</span>
        </button>
      </div>
    </div>
  );
};

export default BestDealsSection;
