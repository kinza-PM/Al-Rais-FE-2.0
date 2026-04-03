type HotelRulesSeparatorProps = {
  marginX?: string;
};

export default function HotelRulesSeparator({
  marginX = "mx-5",
}: HotelRulesSeparatorProps) {
  return (
    <div className={`border-t border-[#E4E4E7] -${marginX} mt-4 mb-4`} />
  );
}
