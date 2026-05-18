import React from "react";
import { Link } from "react-router-dom";
import PenidaIsland from "../../assets/images/penida_island.png";
import MerlionPark from "../../assets/images/merlion_park.png";
import KoSamui from "../../assets/images/ko_samui.png";
import Switzerland from "../../assets/images/switzerland.png";

type Destination = {
  id: string;
  title: string;
  subtitle: string;
  image: string;
};

const DESTINATIONS: Destination[] = [
  { id: "1", title: "Penida island", subtitle: "Bali, Indonesia", image: PenidaIsland },
  { id: "2", title: "Merlion Park", subtitle: "One Fullerton, Singapore", image: MerlionPark },
  { id: "3", title: "Ko Samui", subtitle: "Ko Samui, Thailand", image: KoSamui },
  { id: "4", title: "Switzerland", subtitle: "Interlaken, Switzerland", image: Switzerland },
];

function DestinationCard({ d }: { d: Destination }) {
  return (
    <Link
      to="/search_flight"
      className="group relative block aspect-[4/5] w-full max-w-[520px] overflow-hidden rounded-[12px] border border-[#E4E4E7] shadow-[0_6px_22px_rgba(8,19,38,0.08)] ring-1 ring-black/[0.03] transition-transform duration-300 hover:-translate-y-0.5 hover:shadow-[0_14px_36px_rgba(8,19,38,0.12)] sm:rounded-[14px]"
    >
      <img
        src={d.image}
        alt=""
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
        <p className="text-xl font-semibold text-white drop-shadow-sm sm:text-2xl">{d.title}</p>
        <p className="mt-1 text-sm text-white/90 sm:text-[15px]">{d.subtitle}</p>
      </div>
    </Link>
  );
}

const PopularDestinationSection: React.FC = () => {
  return (
    <section className="mx-auto w-full max-w-[1280px] px-4 pb-14 pt-12 sm:px-6 sm:pb-16 sm:pt-16 lg:px-8">
      <div className="text-center sm:text-left">
        <p className="text-sm font-medium text-[#3D495C]">Destinations</p>
        <h2 className="mt-2 text-3xl font-medium tracking-tight text-[#081326] sm:text-4xl md:text-5xl">
          Find your next adventure
        </h2>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
        {DESTINATIONS.map((d) => (
          <DestinationCard key={d.id} d={d} />
        ))}
      </div>

      <div className="mt-10 flex justify-center sm:mt-12">
        <Link
          to="/search_flight"
          className="inline-flex h-11 min-w-[160px] items-center justify-center rounded-[10px] bg-[#2351A3] px-8 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#1b4181] sm:h-12 sm:rounded-[12px] sm:text-[15px]"
        >
          View All
        </Link>
      </div>
    </section>
  );
};

export default PopularDestinationSection;
