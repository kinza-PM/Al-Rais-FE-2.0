import HotelPriceSummaryTooltip from "./HotelPriceSummaryTooltip";

type Props = {};

export default function HotelPriceBreakdown({}: Props) {
  return (
    <div className="mt-4 rounded-2xl border border-[#E4E4E7] bg-white">
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#E4E4E7]">
        <div className="text-[15px] font-semibold text-[#0A0C0F]">
          Price breakdown
        </div>
        <HotelPriceSummaryTooltip />
      </div>

      <div className="flex items-center justify-between px-4 py-2">
        <span className="text-xs text-[#3D495C]">Total</span>
        <span className="text-sm font-semibold text-[#0A0C0F]">$1,329.75</span>
      </div>
    </div>
  );
}
