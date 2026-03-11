import React, { useCallback } from "react";
import HotellGridCard from "../atoms/HotellGridCard";
import { useHotelStore } from "../../store/UseHotelStore";
import { handleHotelShare } from "../../utils/hotelHelper";

type HotelSearchGridViewProps = {
  hotels: Array<any>;
};

const HotelSearchGridView: React.FC<HotelSearchGridViewProps> = React.memo(({
  hotels,
}) => {
  const { hotel: bookingParams } = useHotelStore();
  const [favorites, setFavorites] = React.useState<{ [key: string]: boolean }>(
    {}
  );
  const toggleFavorite = (hotelKey: string) => {
    setFavorites((prev) => ({
      ...prev,
      [hotelKey]: !prev[hotelKey],
    }));
  };

  const handleShare = useCallback(
    (hotelKey: string, searchKey: string) => handleHotelShare(hotelKey, searchKey, bookingParams),
    [bookingParams]
  );

  if (!hotels || hotels.length === 0) {
    return (
      <div className="py-16 flex flex-col items-center text-center">
        <p className="mt-2 text-[14px] text-[#0F172A]">No hotels found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="mx-auto">
        <div className="grid grid-cols-4 gap-x-8 gap-y-8">
          {hotels.map((hotel, index) => {
            // Show promo card at index 3 (4th position)
            // if (index === 3) {
            //   return (
            //     <React.Fragment key={`fragment-${index}`}>
            //       <SignupPromoCard />
            //       <HotellGridCard
            //         hotel={hotel}
            //         toggleFavorite={toggleFavorite}
            //         hotelKey={hotel.hotelKey || index.toString()}
            //         favorites={favorites}
            //       />
            //     </React.Fragment>
            //   );
            // }
            return (
              <HotellGridCard
                key={hotel.hotelKey || index}
                hotel={hotel}
                toggleFavorite={toggleFavorite}
                hotelKey={hotel.hotelKey || index.toString()}
                favorites={favorites}
                onShare={() => handleShare(hotel.hotelKey, hotel.searchKey)}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
});

HotelSearchGridView.displayName = "HotelSearchGridView";

export default HotelSearchGridView;

// const SignupPromoCard: React.FC = () => {
//   return (
//     <div className="rounded-2xl overflow-hidden mb-2 shadow-sm h-full">
//       <div className="flex flex-col items-center bg-[linear-gradient(180deg,#5383DA_0%,#2351A3_50%,#081326_100%)] text-white h-full pt-8 px-4">
//         <div className="w-48 h-48 bg-[#D9D9D9] mb-6" />

//         <div className="text-center text-white px-6 py-6">
//           <h3 className="text-lg font-bold leading-tight mb-3">
//             Join now to experience the richness of travel.
//           </h3>
//           <p className="text-sm">Get the best deals in your inbox</p>
//         </div>

//         <button className="mt-auto mb-16 bg-[#FFFFFF] text-[#2351A3] px-8 py-2 text-base rounded-lg font-semibold shadow-md">
//           Sign up
//         </button>
//       </div>
//     </div>
//   );
// };
