import type { ReactNode } from "react";
import HotelRulesSeparator from "./HotelRulesSeparator";

type HotelCheckInOutContentProps = {
  separatorMargin?: string;
  hotelDetail?: any;
  /** e.g. modal close control, aligned with the Check-in heading */
  headerAction?: ReactNode;
};

export default function HotelCheckInOutContent({
  separatorMargin = "mx-5",
  hotelDetail,
  headerAction,
}: HotelCheckInOutContentProps) {
  const checkInTime = hotelDetail?.checkInTime || "";
  const checkOutTime = hotelDetail?.checkOutTime || "";

  return (
    <>
      <div>
        <div className="mb-3 flex items-center justify-between gap-2">
          <h3 className="text-sm font-medium text-[#0A0C0F]">Check-in</h3>
          {headerAction ? (
            <span className="shrink-0">{headerAction}</span>
          ) : null}
        </div>
        <HotelRulesSeparator marginX={separatorMargin} />
        <p className="text-sm font-normal text-[#3D495C] mb-2 mt-3">
          {checkInTime && (
            <>
              From <span className="text-[#0A0C0F]">{checkInTime}</span>{" "}
            </>
          )}
          {checkInTime && (
            <>
              to <span className="text-[#0A0C0F]">{checkOutTime}</span>
            </>
          )}
        </p>
        <p className="text-xs text-[#3D495C] leading-relaxed max-w-md">
          Guests are required to show a photo ID and credit card at check-in.
          You need to let the property know what time you&apos;ll be arriving in
          advance.
        </p>
      </div>

      <HotelRulesSeparator marginX={separatorMargin} />

      <div>
        <h3 className="text-sm font-medium text-[#0A0C0F] mb-3">Check-out</h3>
        <HotelRulesSeparator marginX={separatorMargin} />
        <p className="text-sm font-normal text-[#3D495C] mb-2 mt-3">
          Available 24 hours
        </p>
      </div>
    </>
  );
}
