import { useState } from "react";
import { CloseOutlined } from "@ant-design/icons";
import Button from "./Button";
import HotelCheckInOutContent from "../common/HotelCheckInOutContent";
import HotelChildrenBedsContent from "../common/HotelChildrenBedsContent";
import HotelCancellationPrepaymentContent from "../common/HotelCancellationPrepaymentContent";
import HotelRulesSeparator from "../common/HotelRulesSeparator";

type HotelFareRuleProps = {
  selectedRooms?: any[];
  totalPrice?: number;
  currency?: string;
  hotelDetail?: any;
};

export default function HotelFareRule({
  selectedRooms = [],
  totalPrice = 0,
  currency = "AED",
  hotelDetail,
}: HotelFareRuleProps) {
  const [houseRulesOpen, setHouseRulesOpen] = useState(false);
  const [cancellationOpen, setCancellationOpen] = useState(false);

  const hasNonRefundable = selectedRooms.some(
    (sr) => sr?.room?.ratePlan?.cancelPolicyIndicator === "Non-Refundable",
  );

  const cancellationText =
    totalPrice > 0
      ? `${currency} ${totalPrice.toFixed(2)} (full price of your selection)`
      : "—";

  const modalCloseClassName =
    "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[#64748B] transition-colors hover:bg-[#F1F5F9] hover:text-[#0F172A]";

  return (
    <>
      <div className="mt-4 rounded-2xl border border-[#E4E4E7] bg-white">
        <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 border-b border-[#E4E4E7]">
          <div className="text-[15px] font-semibold text-[#0A0C0F]">
            Important rules
          </div>
          <div className="flex flex-wrap items-center gap-3 justify-end">
            <Button
              overrideClasses
              className="text-[15px] font-medium text-[#5383DA]"
              onClick={() => setCancellationOpen(true)}
            >
              View cancellation policy
            </Button>
            <Button
              overrideClasses
              className="text-[15px] font-medium text-[#5383DA]"
              onClick={() => setHouseRulesOpen(true)}
            >
              View all house rules
            </Button>
          </div>
        </div>

        <ul className="px-4 py-2">
          <li className="flex items-center justify-between py-1">
            <span className="text-[#3D495C] text-xs">Cancellation fee</span>
            {/* <span className="text-[#0A0C0F] text-sm font-medium">
              {cancellationText}
            </span> */}
            <span className={`text-sm font-medium text-[#0A0C0F]`}>
              {hasNonRefundable ? cancellationText : "Free cancellation"}
            </span>
          </li>
        </ul>
      </div>

      {houseRulesOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-10">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setHouseRulesOpen(false)}
          />
          <div
            className="relative z-10 w-full max-w-5xl rounded-2xl bg-white p-5 shadow-lg max-h-[95vh] overflow-y-auto scrollbar-hide"
            onClick={(e) => e.stopPropagation()}
          >
            <HotelCheckInOutContent
              separatorMargin="mx-5"
              hotelDetail={hotelDetail}
              headerAction={
                <button
                  type="button"
                  aria-label="Close"
                  className={modalCloseClassName}
                  onClick={() => setHouseRulesOpen(false)}
                >
                  <CloseOutlined className="text-lg" />
                </button>
              }
            />
            <HotelRulesSeparator marginX="mx-5" />
            <HotelChildrenBedsContent
              separatorMargin="mx-5"
              hotelDetail={hotelDetail}
            />
          </div>
        </div>
      )}

      {cancellationOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-10">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setCancellationOpen(false)}
          />
          <div
            className="relative z-10 w-full max-w-5xl rounded-2xl bg-white p-5 shadow-lg max-h-[95vh] overflow-y-auto scrollbar-hide"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between gap-2 border-b border-[#E4E4E7] pb-3">
              <h3 className="text-sm font-medium text-[#0A0C0F]">
                Cancellation / Prepayment
              </h3>
              <button
                type="button"
                aria-label="Close"
                className={modalCloseClassName}
                onClick={() => setCancellationOpen(false)}
              >
                <CloseOutlined className="text-lg" />
              </button>
            </div>
            <HotelCancellationPrepaymentContent
              separatorMargin="mx-5"
              selectedRooms={selectedRooms}
              currency={currency}
              leadWithSeparator={false}
              hideHeading
              // totalPrice={totalPrice}
            />
          </div>
        </div>
      )}
    </>
  );
}
