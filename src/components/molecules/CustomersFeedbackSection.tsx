import React, { useMemo } from "react";
import LastSection1 from "../../assets/images/last-sectionimage (1).png";
import LastSection2 from "../../assets/images/last-sectionimage (2).png";
import LastSection3 from "../../assets/images/last-sectionimage (3).png";
import LastSection4 from "../../assets/images/last-sectionimage (4).png";

type Testimonial = {
  id: string;
  name: string;
  role: string;
  avatar: string;
  text: string;
};

/** Exactly four cards per Figma — row 1 and row 2 each show these four (duplicated for marquee). */
const TESTIMONIALS_ROW_A: Testimonial[] = [
  {
    id: "1",
    name: "Michael Brown",
    role: "Frequent Traveler",
    avatar: LastSection1,
    text: "Joining the loyalty program was the best decision! I earn points with every booking, and I've already redeemed them for fantastic upgrades and discounts. Highly recommend it!",
  },
  {
    id: "2",
    name: "Martin Williams",
    role: "Doctor",
    avatar: LastSection2,
    text: "Al Rais has transformed my travel experiences! Their customer support is exceptional, always available to help with any questions I have. I truly feel valued and supported throughout my journey.",
  },
  {
    id: "3",
    name: "John Smith",
    role: "Travel Blogger",
    avatar: LastSection3,
    text: "The personalized services at Al Rais are unmatched. They took the time to understand my travel preferences and crafted an itinerary that was perfect for me. Every trip has been unforgettable!",
  },
  {
    id: "4",
    name: "Sarah Davis",
    role: "Healthcare Professional",
    avatar: LastSection4,
    text: "Traveling with Al Rais gives me peace of mind. Their strict health and safety protocols make me feel secure, allowing me to focus on enjoying my trip without worries.",
  },
];

/** Second row: same four cards, different order for variety */
const TESTIMONIALS_ROW_B: Testimonial[] = [
  TESTIMONIALS_ROW_A[3],
  TESTIMONIALS_ROW_A[2],
  TESTIMONIALS_ROW_A[1],
  TESTIMONIALS_ROW_A[0],
];

const CARD_GAP_PX = 24;

type MarqueeTrackClass =
  | "testimonials-marquee-track--row-a"
  | "testimonials-marquee-track--row-b";

function QuoteMarkIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      className="h-8 w-8 shrink-0 text-[#2351A3]"
      aria-hidden
    >
      <path
        fill="currentColor"
        d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4V21h-9.983zM0 21v-7.391C0 7.905 3.748 4.04 9 3.001l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983V21H0z"
      />
    </svg>
  );
}

function FeedbackCard({ testimonial }: { testimonial: Testimonial }) {
  return (
    <article className="relative box-border flex h-[281px] w-[min(468px,calc(100vw-3rem))] shrink-0 flex-col rounded-[16px] border border-[#E4E4E7] bg-[#FFFFFF] px-8 py-8 sm:px-10">
      <div className="shrink-0">
        <QuoteMarkIcon />
      </div>

      <p className="mt-3 line-clamp-4 flex-1 overflow-hidden text-left text-[14px] font-normal leading-[1.5] text-[#0A0C0F]">
        {testimonial.text}
      </p>

      <div className="mt-auto flex shrink-0 items-center gap-3 pt-2">
        <img
          src={testimonial.avatar}
          alt=""
          className="h-10 w-10 shrink-0 rounded-full object-cover sm:h-11 sm:w-11"
          aria-hidden
        />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[15px] font-bold leading-tight text-[#0A0C0F]">
            {testimonial.name}
          </p>
          <p className="truncate text-[13px] font-normal leading-tight text-[#64748B]">
            {testimonial.role}
          </p>
        </div>
      </div>
    </article>
  );
}

function MarqueeRow({
  items,
  trackClass,
}: {
  items: Testimonial[];
  trackClass: MarqueeTrackClass;
}) {
  const loop = useMemo(() => [...items, ...items], [items]);

  return (
    <div className="testimonials-marquee-row overflow-hidden py-1">
      <div
        className={`flex w-max ${trackClass}`}
        style={{ gap: CARD_GAP_PX }}
      >
        {loop.map((t, i) => (
          <FeedbackCard key={`${t.id}-${i}`} testimonial={t} />
        ))}
      </div>
    </div>
  );
}

const CustomersFeedbackSection: React.FC = () => {
  return (
    <section className="relative w-full overflow-x-clip bg-white py-14 sm:py-16 md:py-20">
      <div className="mx-auto max-w-[1360px] px-4 sm:px-6 lg:px-8">
        <header className="w-full text-center">
          <p className="text-sm font-medium text-[#3D495C]">Customers feedback</p>
          <h2 className="mt-3 text-balance text-2xl font-bold leading-tight tracking-tight text-[#081326] sm:text-3xl md:text-4xl lg:text-[40px] lg:leading-[1.15]">
            See what travelers think about us
          </h2>
        </header>
      </div>

      {/* True viewport-width rows (breaks out of any horizontal centering) */}
      <div className="testimonials-marquee-bleed mt-10 sm:mt-12">
        <div className="flex flex-col gap-6 sm:gap-7 md:gap-8">
          <MarqueeRow items={TESTIMONIALS_ROW_A} trackClass="testimonials-marquee-track--row-a" />
          <MarqueeRow items={TESTIMONIALS_ROW_B} trackClass="testimonials-marquee-track--row-b" />
        </div>
      </div>
    </section>
  );
};

export default CustomersFeedbackSection;
