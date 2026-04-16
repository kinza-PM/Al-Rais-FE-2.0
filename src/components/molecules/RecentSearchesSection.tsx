import React, { useEffect, useRef, useState, useCallback } from "react";
import HotelImg1 from "../../assets/images/hotels-1 (1).png";
import HotelImg2 from "../../assets/images/hotels-1 (2).png";
import HotelImg3 from "../../assets/images/hotels-1 (3).png";
import HotelImg4 from "../../assets/images/hotels-1 (4).png";

type RecentSearch = {
  id: string;
  title: string;
  dateRange: string;
  pax: string;
  image: string;
};

const RECENT_SEARCHES: RecentSearch[] = [
  { id: "1", title: "Dubai",    dateRange: "Sep 09 - Sep 10", pax: "02 People", image: HotelImg1 },
  { id: "2", title: "Lahore",   dateRange: "Sep 09 - Sep 10", pax: "06 People", image: HotelImg2 },
  { id: "3", title: "Maldives", dateRange: "Aug 20 - Sep 01", pax: "04 People", image: HotelImg3 },
  { id: "4", title: "Istanbul", dateRange: "Aug 15 - Aug 18", pax: "04 People", image: HotelImg4 },
];

type Ripple = { x: number; y: number; id: number };

function SearchCard({
  s,
  i,
  visible,
}: {
  s: RecentSearch;
  i: number;
  visible: boolean;
}) {
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const [searching, setSearching] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      // Ripple origin relative to card
      const rect = cardRef.current!.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const id = Date.now();
      setRipples((prev) => [...prev, { x, y, id }]);
      setTimeout(() => setRipples((prev) => prev.filter((r) => r.id !== id)), 600);

      // "Searching…" badge
      setSearching(true);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setSearching(false), 1800);
    },
    [],
  );

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  return (
    <div
      ref={cardRef}
      onClick={handleClick}
      className={[
        "group relative flex w-full cursor-pointer items-center gap-4 rounded-[12px] border border-[#2351A3] bg-white p-4 overflow-hidden",
        "sm:w-[calc(50%-0.5rem)] lg:w-1/4",
        "transition-all duration-300 ease-out",
        "hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(35,81,163,0.18)]",
        "active:scale-[0.97]",
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5",
      ].join(" ")}
      style={{
        boxShadow: "0 1px 4px rgba(12,40,86,0.08)",
        transitionDelay: visible ? `${i * 80}ms` : "0ms",
      }}
    >
      {/* Click ripples */}
      {ripples.map((r) => (
        <span
          key={r.id}
          className="pointer-events-none absolute rounded-full bg-[#2351A3]/15 animate-[ripple_600ms_ease-out_forwards]"
          style={{
            left: r.x,
            top: r.y,
            width: 8,
            height: 8,
            transform: "translate(-50%, -50%)",
          }}
        />
      ))}

      {/* Click feedback overlay */}
      <div
        className={[
          "pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-[12px] px-4",
          "transition-all duration-300 ease-out",
          searching
            ? "opacity-100 bg-[#2351A3]/92 backdrop-blur-[3px]"
            : "opacity-0",
        ].join(" ")}
      >
        {/* Destination + date line */}
        <div className="flex items-center gap-1.5">
          <svg className="h-3.5 w-3.5 text-white/80 shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
          </svg>
          <span className="text-[12px] font-semibold text-white tracking-wide">{s.title}</span>
          <span className="text-white/60 text-[11px]">·</span>
          <span className="text-[11px] text-white/80">{s.dateRange}</span>
        </div>

        {/* Animated progress bar */}
        <div className="w-full max-w-[120px] h-[3px] rounded-full bg-white/25 overflow-hidden">
          <div
            className={[
              "h-full rounded-full bg-white",
              searching ? "animate-[searchProgress_1.6s_ease-in-out_forwards]" : "w-0",
            ].join(" ")}
          />
        </div>

        {/* Bouncing dots */}
        <div className="flex items-center gap-1">
          {[0, 1, 2].map((dot) => (
            <span
              key={dot}
              className="h-1.5 w-1.5 rounded-full bg-white animate-bounce"
              style={{ animationDelay: `${dot * 150}ms`, animationDuration: "700ms" }}
            />
          ))}
          <span className="ml-1 text-[12px] font-medium text-white/90">Finding best results</span>
        </div>
      </div>

      {/* Image with zoom-on-hover */}
      <div className="h-[72px] w-[72px] flex-shrink-0 overflow-hidden rounded-[8px] bg-gray-100">
        <img
          src={s.image}
          alt={s.title}
          className="h-full w-full object-cover transition-transform duration-400 ease-out group-hover:scale-110"
        />
      </div>

      <div className="min-w-0 flex-1">
        <h3 className="truncate text-[16px] font-semibold text-[#0A0C0F] transition-colors duration-200 group-hover:text-[#2351A3]">
          {s.title}
        </h3>
        <p className="mt-1 truncate text-[13px] text-[#3D495C]">
          {s.dateRange}, {s.pax}
        </p>
      </div>

      {/* Arrow indicator — slides in on hover */}
      <svg
        className="h-4 w-4 shrink-0 translate-x-1 text-[#2351A3] opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100"
        viewBox="0 0 16 16"
        fill="none"
        aria-hidden
      >
        <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

const RecentSearchesSection: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { threshold: 0.12 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="mx-auto max-w-[1268px] px-4 pt-4 pb-6 sm:pt-5 sm:pb-8"
    >
      {/* Header */}
      <div
        className={[
          "max-w-full transition-all duration-500 ease-out",
          visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-3",
        ].join(" ")}
      >
        <p className="text-sm font-medium text-[#3D495C]">Book again</p>
        <h2 className="mt-2 text-3xl font-medium text-[#0A0C0F] sm:text-4xl">
          Your recent searches
        </h2>
      </div>

      {/* Cards */}
      <div className="mt-5 flex flex-col items-stretch gap-4 py-1 sm:flex-row sm:flex-wrap lg:flex-nowrap">
        {RECENT_SEARCHES.map((s, i) => (
          <SearchCard key={s.id} s={s} i={i} visible={visible} />
        ))}
      </div>
    </section>
  );
};

export default RecentSearchesSection;
