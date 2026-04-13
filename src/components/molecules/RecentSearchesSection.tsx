import React from "react";
import HotelImg1 from "../../assets/images/hotels-1 (1).png";
import HotelImg2 from "../../assets/images/hotels-1 (2).png";
import HotelImg3 from "../../assets/images/hotels-1 (3).png";
import HotelImg4 from "../../assets/images/hotels-1 (4).png";

type RecentSearch = {
  id: string;
  title: string;
  dateRange: string;
  pax: string;
  image: string;
};

const RECENT_SEARCHES: RecentSearch[] = [
  { id: "1", title: "Dubai", dateRange: "Sep 09 - Sep 10", pax: "02 People", image: HotelImg1 },
  { id: "2", title: "Lahore", dateRange: "Sep 09 - Sep 10", pax: "06 People", image: HotelImg2 },
  { id: "3", title: "Maldives", dateRange: "Aug 20 - Sep 01", pax: "04 People", image: HotelImg3 },
  { id: "4", title: "Istanbul", dateRange: "Aug 15 - Aug 18", pax: "04 People", image: HotelImg4 },
];

const RecentSearchesSection: React.FC = () => {
  return (
    <section className="mx-auto max-w-[1268px] px-4 py-8">
      <div className="max-w-full">
        <p className="text-sm text-[rgba(61,73,92,1)]">Book again</p>
        <h2 className="mt-3 text-3xl sm:text-4xl font-medium text-[rgba(10,12,15,1)]">Your recent searches</h2>
      </div>

      <div className="mt-6 flex gap-4 py-2 flex-nowrap items-stretch">
        {RECENT_SEARCHES.map((s) => (
          <div
            key={s.id}
            className="flex items-center gap-4 p-4 rounded-[12px] border border-[#2351A3] bg-white w-1/4"
            style={{ boxShadow: "0 1px 4px rgba(12,40,86,0.08)" }}
          >
            <div className="w-[72px] h-[72px] overflow-hidden rounded-[8px] flex-shrink-0 bg-gray-100">
              <img src={s.image} alt={s.title} className="w-full h-full object-cover" />
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="text-[16px] font-semibold text-[#0A0C0F] truncate">{s.title}</h3>
              <p className="text-[13px] text-[#3D495C] truncate mt-1">{s.dateRange}, {s.pax}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default RecentSearchesSection;
