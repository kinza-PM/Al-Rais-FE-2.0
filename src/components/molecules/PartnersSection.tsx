import React from "react";
import logo01 from "../../assets/images/logos (1).jpg";
import logo02 from "../../assets/images/logos (2).jpg";
import logo03 from "../../assets/images/logos (3).jpg";
import logo04 from "../../assets/images/logos (4).jpg";
import logo05 from "../../assets/images/logos (5).jpg";
import logo06 from "../../assets/images/logos (6).jpg";
import logo07 from "../../assets/images/logos (7).jpg";
import logo08 from "../../assets/images/logos (8).jpg";
import logo09 from "../../assets/images/logos (9).jpg";
import logo10 from "../../assets/images/logos (10).jpg";
import logo11 from "../../assets/images/logos (11).jpg";

const PARTNERS: { src: string; alt: string }[] = [
  { src: logo01, alt: "Emirates" },
  { src: logo02, alt: "Qatar Airways" },
  { src: logo03, alt: "Biman Bangladesh Airlines" },
  { src: logo04, alt: "Gulf Air" },
  { src: logo05, alt: "Etihad Airways" },
  { src: logo06, alt: "Qantas" },
  { src: logo07, alt: "Lufthansa" },
  { src: logo08, alt: "Virgin Atlantic" },
  { src: logo09, alt: "American Airlines" },
  { src: logo10, alt: "Swiss International Air Lines" },
  { src: logo11, alt: "SAS Scandinavian Airlines" },
];

const PartnersSection: React.FC = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#F8FAFC] to-white py-12 sm:py-14 md:py-16">
      <div className="relative mx-auto w-full max-w-[1360px] px-4 sm:px-6 lg:px-8">
        <h2 className="text-center text-base font-medium tracking-tight text-[#0A0C0F] sm:text-lg md:text-[18px]">
          We are partnered up with the best
        </h2>

        <div
          className="mx-auto mt-8 flex max-w-[1200px] flex-wrap items-center justify-center gap-3 sm:mt-10 sm:gap-4 md:gap-5"
          role="list"
          aria-label="Airline partners"
        >
          {PARTNERS.map((partner) => (
            <div
              key={partner.alt}
              role="listitem"
              className="group relative flex h-[52px] w-[52px] shrink-0 items-center justify-center overflow-hidden rounded-full bg-white p-1.5 shadow-[0_2px_12px_rgba(8,19,38,0.06)] ring-1 ring-[#E8EDF5]/90 sm:h-[58px] sm:w-[58px] sm:p-2 md:h-[64px] md:w-[64px]"
            >
              <span
                className="partner-logo-orbit-ring"
                aria-hidden
              />
              <img
                src={partner.src}
                alt={partner.alt}
                className="relative z-[1] max-h-full max-w-full object-contain"
                loading="lazy"
                decoding="async"
              />
            </div>
          ))}
        </div>

        <p className="mt-8 text-center text-sm font-medium text-[#3D495C] sm:mt-10">
          and many more...
        </p>
      </div>
    </section>
  );
};

export default PartnersSection;
