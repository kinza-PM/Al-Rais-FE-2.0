import React from "react";
import HotelImage from "../../../src/assets/images/Hotel Image.png";
import Heart from "../../../src/assets/svgs/heart.svg";
import RedHeart from "../../../src/assets/svgs/red-heart.svg";
import FilledStar from "../../../src/assets/svgs/filled_star.svg";
import EmptyStar from "../../../src/assets/svgs/empty_star.svg";
import Share from "../../../src/assets/svgs/share-icon.svg";
import AvailableTick from "../../../src/assets/svgs/available-tick.svg";
import HotelPriceSummaryTooltip from "./HotelPriceSummaryTooltip";

type HotellGridCardProps = {
  toggleFavorite?: (index: number) => void;
  favorites?: { [key: number]: boolean };
  index?: number;
};
const HotellGridCard: React.FC<HotellGridCardProps> = ({
  toggleFavorite,
  favorites,
  index = 0,
}) => {
  return (
    <div
      className="bg-[#FFFFFF] rounded-2xl shadow-sm border border-[#E4E4E7] overflow-hidden mb-2"
      key={index}
    >
      <div className="relative h-56 p-2">
        <div className="flex gap-2 h-full">
          <div className="flex-1 rounded-xl overflow-hidden">
            <img
              src={HotelImage}
              alt="Hotel"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex flex-col gap-2 w-28">
            <div className="flex-1 rounded-xl overflow-hidden">
              <img
                src={HotelImage}
                alt="Hotel"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 rounded-xl overflow-hidden">
              <img
                src={HotelImage}
                alt="Hotel"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
        {/* // Two Images - Split Evenly */}
        {/* <div className="flex gap-2 h-full">
                  <div className="flex-1 rounded-xl overflow-hidden">
                    <img
                      src={HotelImage}
                      alt="Hotel"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 rounded-xl overflow-hidden">
                    <img
                      src={HotelImage}
                      alt="Hotel"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div> */}
        <button
          className="absolute top-4 left-3.5 w-10 h-10 bg-white/60 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md hover:bg-white/70 transition"
          onClick={() => toggleFavorite?.(index)}
        >
          <img src={favorites?.[index] ? RedHeart : Heart} alt="heart" />
        </button>
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between">
          <h3 className="text-base font-medium text-[#0A0C0F] flex-1">
            The Nishat Hotel
          </h3>
          <button className="p-1">
            <img src={Share} alt="icon" />
          </button>
        </div>

        <p className="text-xs text-[#3D495C] mb-1">
          Johar Town, Lahore • 11.9 kms from downtown
        </p>

        <div className="flex items-center gap-1 mb-3">
          {[...Array(5)].map((_, i) => (
            <img src={FilledStar} alt="icon" key={i} />
          ))}
          {[...Array(2)].map((_, i) => (
            <img src={EmptyStar} alt="icon" key={i} />
          ))}
        </div>

        <div className="flex items-center gap-2 mb-3">
          <div className="bg-[#A7C0EC] text-[#2351A3] font-semibold text-xs px-3 py-1 rounded-full">
            9.1
          </div>
          <div>
            <div className="text-[#00B868] font-semibold text-sm">
              Excellent
            </div>
            <div className="text-sm text-[#3D495C]">283 guest reviews</div>
          </div>
        </div>

        <p className="text-xs text-[#3D495C] leading-relaxed mb-3">
          Featuring free WiFi, The Nishat Hotel, Johar Town is city within a
          city which features Pakistan biggest "Emporium Mall" and the most
          spacious banquet halls, The Nishat Banquets.
        </p>

        <div className="border-t border-[#E4E4E7] pt-4 -mx-4" />

        <div className="mb-3">
          <div className="text-xs text-[#3D495C] mb-1">
            Starting from (including VAT)
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[#EA0029] line-through text-lg font-bold">
              $110
            </span>
            <span className="text-lg font-bold text-[#0A0C0F]">
              $80
              <span className="text-xs font-normal">/Night</span>
            </span>
            <HotelPriceSummaryTooltip />
          </div>
        </div>

        <div className="border-t border-[#E4E4E7] pt-4 -mx-4" />
        <div className="mb-3">
          <h4 className="text-base font-semibold text-[#0A0C0F]">
            Deluxe room{" "}
            <span className="text-xs text-[#EA0029] font-normal">
              Only 2 rooms left on AI Rais
            </span>
          </h4>
          <p className="text-xs text-[#3D495C] font-normal">1 king bed</p>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center gap-1.5">
            <img src={AvailableTick} alt="icon" />
            <p className="text-[#3D495C] text-xs leading-none">
              Free cancellation
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            <img src={AvailableTick} alt="icon" />
            <p className="text-[#3D495C] text-xs leading-none">
              Free child stay
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            <img src={AvailableTick} alt="icon" />
            <p className="text-[#3D495C] text-xs leading-none">
              High speed internet
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            <img src={AvailableTick} alt="icon" />
            <p className="text-[#3D495C] text-xs leading-none">Free parking</p>
          </div>
        </div>
        {/* <div className="text-xs flex flex-col gap-2">
                    <p className="text-[#EA0029] ">
                      No rooms are available on the dates you selected!
                    </p>
                    <p className="text-[#0A0C0F]">Please select other dates</p>
                  </div> */}
      </div>
    </div>
  );
};
export default HotellGridCard;
