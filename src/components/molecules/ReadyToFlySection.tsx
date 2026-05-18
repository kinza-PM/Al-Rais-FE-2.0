import React from "react";
import { Link } from "react-router-dom";
import PlaneImage from "../../assets/images/Plane_Image.png";

const ReadyToFlySection: React.FC = () => {
  return (
    <section className="relative z-0 w-full">
      <div
        className="relative isolate overflow-x-clip pb-16 pt-24 sm:pb-20 sm:pt-28 md:pt-32"
        style={{
          background:
            "linear-gradient(90deg, #5383DA 0%, #2351A3 42%, #0a1628 72%, #081326 100%)",
        }}
      >
        {/* Subtle dotted map layer */}
        <div
          className="pointer-events-none absolute inset-0 z-[1] opacity-[0.22]"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(255,255,255,0.5) 1px, transparent 1.05px)",
            backgroundSize: "20px 20px",
          }}
          aria-hidden
        />

        {/* Plane: top-left, breaks upward past the gradient (Figma) */}
        <img
          src={PlaneImage}
          alt=""
          className="pointer-events-none absolute left-0 top-0 z-[15] w-[min(520px,70vw)] max-w-[640px] origin-top-left -translate-x-1 -translate-y-[22%] object-contain sm:w-[min(560px,58vw)] sm:-translate-y-[26%] md:left-2 md:w-[600px] md:-translate-y-[28%] lg:left-6 lg:w-[640px]"
          style={{ mixBlendMode: "screen", marginBottom: "-9rem" }}
          aria-hidden
        />

        <div className="relative z-20 mx-auto flex w-full max-w-[1360px] flex-col items-center px-4 pb-2 pt-6 text-center sm:px-6 lg:px-8">
          <h2 className="max-w-[920px] text-balance text-2xl font-bold leading-tight tracking-tight text-white sm:text-3xl md:text-4xl lg:text-[40px] lg:leading-[1.15]">
            Ready to take a trip around the world with us?
          </h2>
          <p className="mt-4 max-w-[640px] text-pretty text-sm leading-relaxed text-white/88 sm:mt-5 sm:text-base">
            Book your travel with our reliable, transparent platform that is
            committed to customer satisfaction.
          </p>
          <Link
            to="/search_flight"
            className="mt-8 inline-flex h-12 min-w-[160px] items-center justify-center rounded-[10px] bg-white px-10 text-[15px] font-semibold text-[#2351A3] shadow-[0_8px_24px_rgba(8,19,38,0.15)] transition-colors hover:bg-[#F4F7FB] active:bg-[#E8EDF5] sm:mt-10 sm:h-[52px] sm:rounded-[12px]"
          >
            Book a flight
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ReadyToFlySection;
