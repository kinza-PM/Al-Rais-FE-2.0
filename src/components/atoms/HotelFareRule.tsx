import { useState } from "react";
import Button from "./Button";
import HotelRulesContent from "../common/HotelRulesContent";

export default function HotelFareRule() {
  const [houseRules, setHouseRules] = useState<boolean>(false);
  return (
    <>
      <div className="mt-4 rounded-2xl border border-[#E4E4E7] bg-white">
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#E4E4E7]">
          <div className="text-[15px] font-semibold text-[#0A0C0F]">
            Important rules
          </div>
          <Button
            overrideClasses
            className="text-[15px] font-medium text-[#5383DA]"
            onClick={() => setHouseRules(true)}
          >
            View all house rules
          </Button>
        </div>

        <ul className="px-4 py-2">
          <li className="flex items-center justify-between py-1">
            <span className="text-[#3D495C] text-xs">Cancellation fee</span>
            <span className="text-[#0A0C0F] text-sm font-medium">
              $100 (full price of your selection)
            </span>
          </li>
        </ul>
      </div>

      {houseRules && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-10">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setHouseRules(false)}
          />
          <div className="relative z-10 w-full max-w-5xl rounded-2xl bg-white p-5 shadow-lg max-h-[95vh] overflow-y-auto scrollbar-hide">
            <HotelRulesContent separatorMargin="mx-5" />
          </div>
        </div>
      )}
    </>
  );
}
