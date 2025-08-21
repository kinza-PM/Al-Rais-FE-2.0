import React, { useState } from "react";
import Deal1 from "../../assets/images/deal1.png";
import Deal2 from "../../assets/images/deal2.png";
import Deal3 from "../../assets/images/deal3.png";
import Deal4 from "../../assets/images/deal4.png";

type Deal = {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  price: number;
};

const DEALS: Deal[] = [
  {
    id: "1",
    title: "Switzerland",
    subtitle: "Grindelwald",
    image: Deal1,
    price: 98,
  },
  {
    id: "2",
    title: "France",
    subtitle: "Paris, France",
    image: Deal2,
    price: 197,
  },
  {
    id: "3",
    title: "United Kingdom",
    subtitle: "London, UK",
    image: Deal3,
    price: 178,
  },
  { id: "4", title: "Dubai", subtitle: "UAE", image: Deal4, price: 189 },
];

// const TABS = [100, 200, 500, 999];

const DealCard: React.FC<{ d: Deal }> = ({ d }) => {
  return (
    <div className="group relative overflow-hidden rounded-2xl shadow-sm ring-1 ring-black/5 bg-white">
      {/* Image */}
      <img
        src={d.image}
        alt={d.title}
        className="block w-full h-80 object-cover transition-transform duration-300 group-hover:scale-[1.03]"
      />

      {/* Bottom overlay — height ↓ */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-28 rounded-b-2xl
                     bg-gradient-to-t from-black/50 via-black/25 to-transparent
                     backdrop-blur-[3px] z-10"
      />

      {/* Content */}
      <div className="absolute inset-x-0 bottom-0 z-20 px-2 pb-3">
        {/* Top row */}
        <div className="mb-2 flex items-end justify-between text-white">
          <div>
            <p className="text-[14px] sm:text-lg font-medium">{d.title}</p>
            <p className="text-[rgba(228,228,231,1)] text-[12px] leading-tight">
              Round-trip flights
            </p>
            <p className="text-[rgba(228,228,231,1)] text-[12px] leading-tight">
              4 nights hotels
            </p>
          </div>

          <div className="text-right">
            <p className="text-[rgba(228,228,231,1)] text-[12px] leading-tight">
              Starting from
            </p>
            <p className="text-[rgba(228,228,231,1)] text-[16px] font-semibold leading-tight">
              ${d.price}
            </p>
          </div>
        </div>

        {/* Center button — slightly smaller */}
        <div className="flex justify-center">
          <button
            type="button"
            className="rounded-lg px-4 py-1.5 text-sm
                         bg-white text-[rgba(35,81,163,1)]
                         shadow-[0_1px_2px_rgba(0,0,0,0.08),0_6px_18px_rgba(0,0,0,0.06)]
                         ring-1 ring-black/5 hover:bg-[#F6F7FB] transition"
          >
            Book now
          </button>
        </div>
      </div>
    </div>
  );
};

const BestDealsSection: React.FC = () => {
  const TABS = ["Below $199", "Below $399", "Below $699", "Below $999"];
  const [active, setActive] = useState(0); // UI-only; no filtering (static cards)

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pt-10 sm:pt-14 md:pt-16 pb-12">
      <p className="text-sm text-[rgba(61,73,92,1)]">Best deals</p>
      <h2 className="mt-2 text-3xl sm:text-5xl font-medium text-[rgba(10,12,15,1)]">
        No one can beat these prices
      </h2>

      {/* Segmented tabs (exact style in screenshot) */}
      <div className="mt-4">
        <div className="inline-flex items-center rounded-2xl ring-1 ring-[#D9E2EF] bg-white p-1 shadow-sm">
          {TABS.map((label, i) => (
            <button
              key={label}
              onClick={() => setActive(i)}
              className={`rounded-xl px-7 py-2 text-sm font-medium transition
                    ${
                      active === i
                        ? "bg-[rgba(35,81,163,1)] text-white shadow-[0_1px_2px_rgba(12,40,86,0.15)]"
                        : "text-[#3D495C] hover:bg-[#F4F6FA]"
                    }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Cards — FLEX ONLY, single row, static content */}
      <div className="mt-6 flex flex-nowrap gap-6 overflow-hidden">
        {DEALS.map((d) => (
          <div key={d.id} className="min-w-0 basis-1/4 flex-1">
            <DealCard d={d} />
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="mt-10 flex justify-center">
        <button
          type="button"
          className="rounded-lg px-6 py-2 text-white
                         bg-[rgba(35,81,163,1)]
                         hover:bg-[rgba(35,81,163,0.92)]
                         active:bg-[rgba(35,81,163,0.88)]
                         shadow-sm ring-1 ring-black/5
                         focus:outline-none focus:ring-2 focus:ring-[rgba(35,81,163,0.5)]"
        >
          Explore flights and hotels
        </button>
      </div>
    </div>
  );
};

export default BestDealsSection;
