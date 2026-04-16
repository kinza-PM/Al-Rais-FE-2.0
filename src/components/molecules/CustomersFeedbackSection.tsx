import React, { useState, useCallback, useEffect, useRef } from "react";
import { Splide, SplideSlide } from "@splidejs/react-splide";
import "@splidejs/react-splide/css";
import GroupImg from "../../assets/images/Group.png";
import LastSection1 from "../../assets/images/last-sectionimage (1).png";
import LastSection2 from "../../assets/images/last-sectionimage (2).png";
import LastSection3 from "../../assets/images/last-sectionimage (3).png";
import LastSection4 from "../../assets/images/last-sectionimage (4).png";
import ArrowLeftIcon from "../../assets/images/arrow-left-s-line 1.png";
import ArrowRightIcon from "../../assets/images/arrow-right-s-line 2.png";

type SplideInstance = { go: (dir: string) => void } | null;

type Testimonial = {
  id: string;
  name: string;
  role: string;
  avatar: string;
  text: string;
};

const TESTIMONIALS: Testimonial[] = [
  {
    id: "1",
    name: "Michael Brown",
    role: "Frequent Traveler",
    avatar: LastSection1,
    text: "The loyalty program is fantastic. I've booked multiple trips and the rewards keep getting better. Al Rais makes every journey feel valued.",
  },
  {
    id: "2",
    name: "Martin Williams",
    role: "Doctor",
    avatar: LastSection2,
    text: "Outstanding customer support. When I had a last-minute change, the team handled it quickly and professionally. Highly recommend.",
  },
  {
    id: "3",
    name: "John Smith",
    role: "Travel Blogger",
    avatar: LastSection3,
    text: "The personalized itineraries and seamless booking experience are top-notch. Al Rais understands what travelers need.",
  },
  {
    id: "4",
    name: "Sarah Davis",
    role: "Healthcare Professional",
    avatar: LastSection4,
    text: "Peace of mind matters when I travel. Al Rais's safety protocols and clear communication give me confidence every time.",
  },
  {
    id: "5",
    name: "Sarah Davis",
    role: "Healthcare Professional",
    avatar: LastSection4,
    text: "Peace of mind matters when I travel. Al Rais's safety protocols and clear communication give me confidence every time.",
  },
];

const CARD_GAP = 24;

function FeedbackCard({
  testimonial,
  index,
}: {
  testimonial: Testimonial;
  index: number;
}) {
  const isGradientCard = index % 2 === 1;

  return (
    <div
      className={[
        "group relative flex h-[320px] flex-col rounded-[8px] p-5 sm:p-6",
        "transition-all duration-300 ease-out",
        "hover:-translate-y-2 hover:shadow-[0_12px_32px_rgba(35,81,163,0.14)] hover:border-[#2351A3]",
      ].join(" ")}
      style={{
        background: isGradientCard
          ? "linear-gradient(360deg, #D2F4FE 0%, #FFFFFF 100%)"
          : "#FFFFFF",
        border: "1.5px solid #E4E4E7",
      }}
    >
      {/* Quote icon — scales up on card hover */}
      <div className="absolute left-4 top-4 sm:left-5 sm:top-5 transition-transform duration-300 ease-out group-hover:scale-110 origin-top-left">
        <img
          src={GroupImg}
          alt=""
          className="h-10 w-10 object-contain sm:h-12 sm:w-12"
          aria-hidden
        />
      </div>

      {/* Testimonial text */}
      <p className="mt-12 flex-1 text-left text-sm font-normal leading-relaxed text-[#0A0C0F] sm:mt-14 sm:text-base">
        {testimonial.text}
      </p>

      {/* Customer info: avatar + name + role */}
      <div className="mt-4 flex items-center gap-3">
        {/* Avatar zooms slightly on card hover */}
        <img
          src={testimonial.avatar}
          alt=""
          className="h-10 w-10 flex-shrink-0 rounded-full object-cover sm:h-12 sm:w-12 transition-transform duration-300 ease-out group-hover:scale-110"
          aria-hidden
        />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-[#0A0C0F] sm:text-base transition-colors duration-200 group-hover:text-[#2351A3]">
            {testimonial.name}
          </p>
          <p className="truncate text-xs font-medium text-[#3D495C] sm:text-sm">
            {testimonial.role}
          </p>
        </div>
      </div>
    </div>
  );
}

const CustomersFeedbackSection: React.FC = () => {
  const [splide, setSplide] = useState<SplideInstance>(null);
  const goPrev = useCallback(() => splide?.go("<"), [splide]);
  const goNext = useCallback(() => splide?.go(">"), [splide]);

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

  const arrowBase = [
    "flex flex-shrink-0 items-center justify-center rounded-full",
    "transition-all duration-200 ease-out",
    "hover:bg-[#EEF3FF] hover:scale-110 active:scale-95",
  ].join(" ");

  return (
    <section ref={sectionRef} className="w-full bg-white py-12 sm:py-16 md:py-20">
      <div className="mx-auto max-w-[1464px] px-4 sm:px-6 lg:px-8">

        {/* Header — fade + slide down */}
        <div
          className={[
            "w-full text-center",
            "transition-all duration-500 ease-out",
            visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4",
          ].join(" ")}
        >
          <p className="text-sm font-medium text-[#3D495C]">Customers feedback</p>
          <h2 className="mt-2 text-2xl font-extrabold text-[#0A0C0F] sm:text-3xl lg:text-4xl">
            See what travelers think about us
          </h2>
        </div>

        {/* Slider row — fade + slide up after header */}
        <div
          className={[
            "mt-4 flex w-full items-center gap-3 sm:gap-4 lg:gap-6",
            "transition-all duration-500 ease-out",
            visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6",
          ].join(" ")}
          style={{ transitionDelay: visible ? "130ms" : "0ms" }}
        >
          <button
            type="button"
            aria-label="Previous testimonials"
            onClick={goPrev}
            className={`h-12 w-12 sm:h-14 sm:w-14 ${arrowBase}`}
          >
            <img src={ArrowLeftIcon} alt="prev" className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>

          <div className="min-w-0 flex-1 rounded-lg px-1 py-3">
            <Splide
              aria-label="Customer testimonials"
              options={{
                type: "loop",
                perPage: 5,
                perMove: 1,
                gap: `${CARD_GAP}px`,
                pagination: false,
                arrows: false,
                breakpoints: {
                  1280: { perPage: 4, gap: `${CARD_GAP}px` },
                  1024: { perPage: 3, gap: `${CARD_GAP}px` },
                  768:  { perPage: 2, gap: "16px" },
                  640:  { perPage: 1, gap: "16px" },
                },
              }}
              onMounted={(instance: SplideInstance) => setSplide(instance)}
            >
              {TESTIMONIALS.map((t, index) => (
                <SplideSlide key={t.id}>
                  <FeedbackCard testimonial={t} index={index} />
                </SplideSlide>
              ))}
            </Splide>
          </div>

          <button
            type="button"
            aria-label="Next testimonials"
            onClick={goNext}
            className={`h-12 w-12 sm:h-14 sm:w-14 ${arrowBase}`}
          >
            <img src={ArrowRightIcon} alt="next" className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default CustomersFeedbackSection;