import HotelCheckInOutContent from "./HotelCheckInOutContent";
import HotelChildrenBedsContent from "./HotelChildrenBedsContent";
import HotelCancellationPrepaymentContent from "./HotelCancellationPrepaymentContent";
import HotelRulesSeparator from "./HotelRulesSeparator";

type HotelRulesContentProps = {
  separatorMargin?: string;
  hotelDetail?: any;
  selectedRooms?: any[];
  currency?: string;
};

/** Full rules: check-in/out → cancellation → children (e.g. hotel detail page). */
export default function HotelRulesContent({
  separatorMargin = "mx-5",
  hotelDetail,
  selectedRooms = [],
  currency = "AED",
}: HotelRulesContentProps) {
  return (
    <div className="rounded-2xl">
      <HotelCheckInOutContent
        separatorMargin={separatorMargin}
        hotelDetail={hotelDetail}
      />
      <HotelCancellationPrepaymentContent
        separatorMargin={separatorMargin}
        selectedRooms={selectedRooms}
        currency={currency}
        leadWithSeparator
      />
      <HotelRulesSeparator marginX={separatorMargin} />
      <HotelChildrenBedsContent
        separatorMargin={separatorMargin}
        hotelDetail={hotelDetail}
      />
    </div>
  );
}
