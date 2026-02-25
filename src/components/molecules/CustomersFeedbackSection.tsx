import React, { useState, useCallback } from "react";
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
      className="relative flex h-[320px] flex-col rounded-[8px] p-5 sm:p-6"
      style={{
        background: isGradientCard
          ? "linear-gradient(360deg, #D2F4FE 0%, #FFFFFF 100%)"
          : "#FFFFFF",
        border: "1.5px solid #E4E4E7",
        boxShadow: "0 0 0 1px #E4E4E7",
      }}
    >
      {/* Group.png at top-left of every card */}
      <div className="absolute left-4 top-4 sm:left-5 sm:top-5">
        <img
          src={GroupImg}
          alt=""
          className="h-10 w-10 object-contain sm:h-12 sm:w-12"
          aria-hidden
        />
      </div>

      {/* Testimonial text - with top padding so it doesn't overlap the icon */}
      <p className="mt-12 flex-1 text-left text-sm leading-relaxed text-[#0A0C0F] sm:mt-14 sm:text-base">
        {testimonial.text}
      </p>

      {/* Customer info: avatar + name + role */}
      <div className="mt-4 flex items-center gap-3">
        <img
          src={testimonial.avatar}
          alt=""
          className="h-10 w-10 flex-shrink-0 rounded-full object-cover sm:h-12 sm:w-12"
          aria-hidden
        />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-[#0A0C0F] sm:text-base">
            {testimonial.name}
          </p>
          <p className="truncate text-xs text-[#3D495C] opacity-80 sm:text-sm">
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

  return (
    <section className="w-full bg-white py-12 sm:py-16 md:py-20">
      <div className="mx-auto max-w-[1464px] px-4 sm:px-6 lg:px-8">
        {/* Section header (centered) */}
        <div className="w-full text-center">
          <p className="text-sm text-[#3D495C]">Customers feedback</p>
          <h2 className="mt-2 text-2xl font-bold text-[#0A0C0F] sm:text-3xl lg:text-4xl">
            See what travelers think about us
          </h2>
        </div>

        {/* Slider with arrows outside + light border around track */}
        <div className="mt-6 flex w-full items-center gap-3 sm:gap-4 lg:gap-6">
          <button
            type="button"
            aria-label="Previous testimonials"
            onClick={goPrev}
            className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full text-[#3D495C] transition-colors hover:text-[#0A0C0F] sm:h-14 sm:w-14"
            style={{ background: "transparent" }}
          >
            <img src={ArrowLeftIcon} alt="prev" className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>

          <div className="min-w-0 flex-1 overflow-hidden rounded-lg p-2 sm:p-3">
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
                  1280: {
                    perPage: 4,
                    gap: `${CARD_GAP}px`,
                  },
                  1024: {
                    perPage: 3,
                    gap: `${CARD_GAP}px`,
                  },
                  768: {
                    perPage: 2,
                    gap: "16px",
                  },
                  640: {
                    perPage: 1,
                    gap: "16px",
                  },
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
            className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full text-[#3D495C] transition-colors hover:text-[#0A0C0F] sm:h-14 sm:w-14"
            style={{ background: "transparent" }}
          >
            <img src={ArrowRightIcon} alt="next" className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default CustomersFeedbackSection;