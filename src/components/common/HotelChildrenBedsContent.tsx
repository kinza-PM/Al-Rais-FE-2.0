import HotelRulesSeparator from "./HotelRulesSeparator";

type HotelChildrenBedsContentProps = {
  separatorMargin?: string;
  hotelDetail?: any;
};

export default function HotelChildrenBedsContent({
  separatorMargin = "mx-5",
  hotelDetail,
}: HotelChildrenBedsContentProps) {
  const childPolicy = hotelDetail?.childPolicy || "";

  return (
    <div>
      <h3 className="text-sm font-medium text-[#0A0C0F] mb-3">
        Children & Beds
      </h3>
      <HotelRulesSeparator marginX={separatorMargin} />
      <p className="text-xs text-[#3D495C] leading-relaxed mt-3">
        {childPolicy ||
          "Children of all ages are welcome. Please check with the property for specific policies."}
      </p>
    </div>
  );
}
