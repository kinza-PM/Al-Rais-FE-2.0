import { formatDate } from "../../utils/helpers";
import HotelRulesSeparator from "./HotelRulesSeparator";

export type HotelCancellationPrepaymentContentProps = {
  separatorMargin?: string;
  selectedRooms?: any[];
  currency?: string;
  /** When true, omits the leading separator (e.g. top of a dedicated modal). */
  leadWithSeparator?: boolean;
  /** When true, omits title + divider (parent renders the header row). */
  hideHeading?: boolean;
};

export default function HotelCancellationPrepaymentContent({
  separatorMargin = "mx-5",
  selectedRooms = [],
  currency = "AED",
  leadWithSeparator = true,
  hideHeading = false,
}: HotelCancellationPrepaymentContentProps) {
  return (
    <div>
      {leadWithSeparator && <HotelRulesSeparator marginX={separatorMargin} />}
      {!hideHeading && (
        <>
          <h3 className="text-sm font-medium text-[#0A0C0F] mb-3">
            Cancellation / Prepayment
          </h3>
          <HotelRulesSeparator marginX={separatorMargin} />
        </>
      )}

      <div className={hideHeading ? "space-y-4" : "mt-3 space-y-4"}>
        {selectedRooms.length === 0 && (
          <p className="text-xs text-[#3D495C]">
            Cancellation and prepayment policies vary according to accommodation
            type.
          </p>
        )}

        {selectedRooms.map((selectedRoom, index) => {
          const room = selectedRoom?.room;
          const ratePlan = room?.ratePlan;
          const roomRate = room?.roomRate;
          const isNonRefundable =
            ratePlan?.cancelPolicyIndicator === "Non-Refundable";
          const roomTotalPrice =
            (roomRate?.netAmount || 0) * (selectedRoom?.count || 1);

          return (
            <div
              key={selectedRoom?.roomKey || index}
              className={`${
                selectedRooms.length > 1
                  ? "p-3 rounded-xl border border-[#E4E4E7] bg-[#F8F9FB]"
                  : ""
              }`}
            >
              {selectedRooms.length > 1 && (
                <p className="text-xs font-semibold text-[#0A0C0F] mb-2">
                  Room {index + 1}: {room?.roomTypeName || `Room ${index + 1}`}
                </p>
              )}

              <div className="space-y-1">
                <p className="text-xs text-[#3D495C]">
                  Policy:{" "}
                  <span
                    className={`font-medium ${
                      isNonRefundable ? "text-[#EA0029]" : "text-[#1A7F4B]"
                    }`}
                  >
                    {ratePlan?.cancelPolicyIndicator || "See property policy"}
                  </span>
                </p>

                {isNonRefundable && roomTotalPrice > 0 && (
                  <p className="text-xs text-[#3D495C]">
                    Cancellation fee:{" "}
                    <span className="font-medium text-[#EA0029]">
                      {currency} {roomTotalPrice.toFixed(2)}
                    </span>
                  </p>
                )}

                {ratePlan?.lastCancellationDate && (
                  <p className="text-xs text-[#3D495C]">
                    Last free cancellation:{" "}
                    <span className="font-medium text-[#0A0C0F]">
                      {formatDate(ratePlan.lastCancellationDate)}
                    </span>
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
