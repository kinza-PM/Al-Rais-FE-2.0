import InfoPrimary from "../../assets/svgs/info-primary.svg";

type Props = {
  totalPrice?: number;
  currency?: string;
  vatPercentage?: number | null;
};

export default function HotelPriceSummaryTooltip({
  totalPrice,
  currency = "AED",
  vatPercentage = null,
}: Props) {
  const vatAmount = vatPercentage ? (totalPrice ?? 0 * vatPercentage) / 100 : 0;

  return (
    <div className="relative group ml-auto">
      <button>
        <img src={InfoPrimary} alt="icon" />
      </button>
      <div className="absolute right-0 mb-2 hidden group-hover:block z-10 w-48">
        <div className="bg-[#F2F2F3] rounded-lg px-5 py-4 shadow-lg">
          <p className="text-[#000000] text-sm font-semibold mb-2">
            Price summary
          </p>
          <div className="flex justify-between mb-1 text-xs">
            <span className="text-[#3D495C]">Total price:</span>
            <span className="font-semibold text-[#0A0C0F]">
              {currency} {totalPrice?.toFixed(2)}
            </span>
          </div>
          {vatPercentage && (
            <div className="flex justify-between text-xs">
              <span className="text-[#3D495C]">{vatPercentage}% VAT:</span>
              <span className="font-semibold text-[#0A0C0F]">
                {currency} {vatAmount.toFixed(2)}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
// import InfoPrimary from "../../assets/svgs/info-primary.svg";

// type Props = {};

// export default function HotelPriceSummaryTooltip({}: Props) {
//   return (
//     <div className="relative group ml-auto">
//       <button>
//         <img src={InfoPrimary} alt="icon" />
//       </button>
//       <div className="absolute right-0 mb-2 hidden group-hover:block z-10 w-48">
//         <div className="bg-[#F2F2F3] rounded-lg px-5 py-4 shadow-lg">
//           <p className="text-[#000000] text-sm font-semibold mb-2">
//             Price summary
//           </p>
//           <div className="flex justify-between mb-1 text-xs">
//             <span className="text-[#3D495C]">Total price:</span>
//             <span className="font-semibold text-[#0A0C0F]">$110</span>
//           </div>
//           <div className="flex justify-between text-xs">
//             <span className="text-[#3D495C]">17% VAT:</span>
//             <span className="font-semibold text-[#0A0C0F]">$18.7</span>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
