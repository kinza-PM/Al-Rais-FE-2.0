import React from "react";

const HeroTabUnderline: React.FC = () => (
  <span
    className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center"
    aria-hidden
  >
    <span className="relative block h-[4px] w-[52px] overflow-visible">
      <span
        className="absolute left-1/2 top-[-12px] z-0 h-[18px] w-[76px] -translate-x-1/2 rounded-[999px] bg-gradient-to-b from-[#5383DA]/70 via-[#5383DA]/28 to-transparent blur-[8px]"
      />
      <span className="relative z-[1] block h-[4px] w-[52px] rounded-[1px] bg-[#5383DA] shadow-[0_-1px_0_rgba(83,131,218,0.35)]" />
    </span>
  </span>
);

export default HeroTabUnderline;
