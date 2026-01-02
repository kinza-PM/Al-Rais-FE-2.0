import React from "react";
import HotellGridCard from "../atoms/HotellGridCard";

type HotelSearchGridViewProps = {};
const HotelSearchGridView: React.FC<HotelSearchGridViewProps> = () => {
  const [favorites, setFavorites] = React.useState<{ [key: number]: boolean }>(
    {}
  );
  const toggleFavorite = (index: number) => {
    setFavorites((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };
  return (
    <div className="min-h-screen">
      <div className="mx-auto">
        <div className="grid grid-cols-4 gap-4">
          {Array.from({ length: 12 }).map((_, index) => {
            if (index === 3) {
              return <SignupPromoCard />;
            }
            return (
              <HotellGridCard
                toggleFavorite={toggleFavorite}
                index={index}
                key={index}
                favorites={favorites}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};
export default HotelSearchGridView;

const SignupPromoCard: React.FC = () => {
  return (
    <div className="rounded-2xl overflow-hidden mb-2 shadow-sm h-full">
      <div className="flex flex-col items-center bg-[linear-gradient(180deg,#5383DA_0%,#2351A3_50%,#081326_100%)] text-white h-full pt-8 px-4">
        <div className="w-48 h-48 bg-[#D9D9D9] mb-6" />

        <div className="text-center text-white px-6 py-6">
          <h3 className="text-lg font-bold leading-tight mb-3">
            Join now to experience the richness of travel.
          </h3>
          <p className="text-sm">Get the best deals in your inbox</p>
        </div>

        <button className="mt-auto mb-16 bg-[#FFFFFF] text-[#2351A3] px-8 py-2 text-base rounded-lg font-semibold shadow-md">
          Sign up
        </button>
      </div>
    </div>
  );
};
