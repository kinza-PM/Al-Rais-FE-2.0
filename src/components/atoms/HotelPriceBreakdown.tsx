import HotelPriceSummaryTooltip from "./HotelPriceSummaryTooltip";

type Props = {
  totalPrice?: number;
  currency?: string;
};

export default function HotelPriceBreakdown({
  totalPrice = 0,
  currency = "AED",
}: Props) {
  return (
    <div className="mt-4 rounded-2xl border border-[#E4E4E7] bg-white">
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#E4E4E7]">
        <div className="text-[15px] font-semibold text-[#0A0C0F]">
          Price breakdown
        </div>
        <HotelPriceSummaryTooltip
          totalPrice={totalPrice}
          currency={currency}
        />
      </div>

      <div className="flex items-center justify-between px-4 py-2">
        <span className="text-xs text-[#3D495C]">Total</span>
        <span className="text-sm font-semibold text-[#0A0C0F]">
          {currency} {totalPrice.toFixed(2)}
        </span>
      </div>
    </div>
  );
}
