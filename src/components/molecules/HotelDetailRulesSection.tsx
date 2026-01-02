import HotelRulesContent from "../common/HotelRulesContent";

const HotelDetailRulesSection = () => {
  return (
    <div className="mt-6">
      <h4 className="text-[#0A0C0F] text-base font-bold">Hotel rules</h4>
      <div className="max-w-6xl mx-auto mt-8">
        <div className="border border-[#E4E4E7] rounded-2xl p-3">
          <HotelRulesContent separatorMargin="mx-3" />
        </div>
      </div>

      <h4 className="text-[#0A0C0F] text-base font-bold mt-20">
        The fine print
      </h4>
      <div className="max-w-6xl mx-auto mt-8">
        <div className="border border-[#E4E4E7] rounded-2xl p-3">
          <div>
            <h3 className="text-sm font-medium text-[#0A0C0F] mb-3">
              Must-know information for guests at this property
            </h3>
            <Seperator />
            <p className="text-xs font-normal text-[#3D495C] mt-3">
              In response to the coronavirus (COVID-19), additional safety and
              sanitation measures are in effect at this property.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HotelDetailRulesSection;

const Seperator = () => {
  return <div className="border-t border-[#E4E4E7] -mx-3 mt-4 mb-4"></div>;
};
