import Button from "../atoms/Button";
import { useMemo } from "react";
import {
  categorizeFacilities,
  FACILITY_KEYWORDS,
  getFacilityIcon,
  GREAT_KEYWORDS,
} from "../../utils/hotelHelper";

const HotelDetailAmenetiesSection = ({
  hotelDetail,
  onSeeRooms,
}: {
  hotelDetail: any;
  onSeeRooms?: () => void;
}) => {
  const displayPopularFacilities = useMemo(() => {
    if (!hotelDetail?.hotelFacilities) return [];
    const unwantedKeywords = [
      "total number",
      "hotel",
      "american express",
      "mastercard",
      "visa",
      "identification",
      "**",
      "payment",
      "card",
    ];
    const seenFacilities = new Set<string>();
    const facilities: Array<{ name: string; icon: string | null }> = [];
    hotelDetail.hotelFacilities.forEach((facility: any) => {
      const cleanName = facility.name.replace(/\*\*/g, "").trim();
      const lowerName = cleanName.toLowerCase();
      if (unwantedKeywords.some((keyword) => lowerName.includes(keyword))) {
        return;
      }
      if (seenFacilities.has(lowerName)) {
        return;
      }
      const icon = getFacilityIcon(cleanName);
      if (icon || facilities.length < 10) {
        seenFacilities.add(lowerName);
        facilities.push({ name: cleanName, icon });
      }
    });
    // return facilities;
    return facilities.slice(0, 10); // Limit to 10
  }, [hotelDetail?.hotelFacilities]);

  const categorizedAmenities = useMemo(() => {
    const categories = [
      "greatForYourStay",
      "bathroom",
      "mediaAndTechnology",
      "foodAndDrink",
      "cleaningServices",
      "safetyAndSecurity",
      "kitchen",
      "bedrooms",
    ];

    return categorizeFacilities(
      [hotelDetail?.hotelFacilities, hotelDetail?.roomFacilities],
      categories,
      FACILITY_KEYWORDS,
      GREAT_KEYWORDS,
    );
  }, [hotelDetail]);

  const categoryCount = Object.entries(categorizedAmenities).filter(
    ([_, items]) => items.length > 0,
  ).length;

  const columnClass =
    categoryCount >= 6
      ? "columns-4"
      : categoryCount >= 4
        ? "columns-3"
        : categoryCount >= 2
          ? "columns-2"
          : "columns-1";

  return (
    <div className="mt-6">
      <h4 className="text-[#0A0C0F] text-base font-bold">
        Facilities of {hotelDetail?.name || "Hotel"}
      </h4>
      <div className="mt-1 flex items-center justify-between">
        <div className="">
          <div className="text-[#00B868] font-semibold text-sm mb-0.5">
            Great facilities
          </div>
          <div className="text-sm text-[#3D495C]">
            Review score{" "}
            {hotelDetail?.userRating || hotelDetail?.starRating || "N/A"}
          </div>
        </div>
        <Button
          type="button"
          overrideClasses
          className="bg-[#2351A3] text-[#F2F2F3] text-sm font-semibold px-8 py-3 border-none rounded-lg"
          onClick={onSeeRooms}
        >
          See rooms
        </Button>
      </div>

      <div className="mt-8">
        <h5 className="text-[#0A0C0F] text-sm font-semibold">
          Most popular facilies
        </h5>
        <div className="mt-5 max-w-3xl text-[#3D495C] text-sm mt-4 flex flex-wrap items-center gap-5">
          {displayPopularFacilities.length > 0 ? (
            displayPopularFacilities.map((facility, index) => (
              <div className="flex items-center gap-2" key={index}>
                {facility.icon && <img src={facility.icon} alt="icon" />}
                {facility.name}
              </div>
            ))
          ) : (
            <p>No popular facilities available</p>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto mt-16">
        <div className={`${columnClass} gap-10`}>
          {Object.entries(categorizedAmenities)
            .filter(([_, items]) => items.length > 0)
            .map(([cat, items], idx) => (
              <div key={idx} className="mb-12 break-inside-avoid">
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex items-center justify-center">
                    <AmenetiesHeadingIcon />
                  </div>
                  <h4 className="text-[#0A0C0F] text-sm font-semibold">
                    {cat.charAt(0).toUpperCase() +
                      cat
                        .slice(1)
                        .replace(/And/g, " & ")
                        .replace(/([A-Z])/g, " $1")
                        .trim()}
                  </h4>
                </div>
                <ul className="space-y-2">
                  {items.map((it, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-xs text-[#3D495C]"
                    >
                      <div className="pt-0.5">
                        <CheckIcon />
                      </div>
                      <span className="leading-snug">{it}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default HotelDetailAmenetiesSection;

const AmenetiesHeadingIcon = () => (
  <svg
    width="20"
    height="19"
    viewBox="0 0 20 19"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M19.4082 17.6276C17.9803 15.1591 15.78 13.3891 13.2122 12.5501C14.4824 11.7939 15.4692 10.6417 16.0212 9.27048C16.5731 7.89922 16.6597 6.38468 16.2676 4.95945C15.8755 3.53422 15.0264 2.27711 13.8506 1.38117C12.6749 0.485228 11.2376 0 9.75941 0C8.28122 0 6.84391 0.485228 5.66818 1.38117C4.49246 2.27711 3.64334 3.53422 3.25123 4.95945C2.85911 6.38468 2.94569 7.89922 3.49765 9.27048C4.04961 10.6417 5.03644 11.7939 6.3066 12.5501C3.73878 13.3882 1.53847 15.1582 0.110659 17.6276C0.0582987 17.7129 0.0235684 17.8079 0.00851736 17.9069C-0.00653367 18.006 -0.00160057 18.107 0.0230256 18.2041C0.0476518 18.3011 0.0914723 18.3923 0.151901 18.4722C0.212331 18.552 0.288144 18.619 0.37487 18.6691C0.461595 18.7192 0.557476 18.7514 0.656854 18.7638C0.756232 18.7763 0.857095 18.7687 0.953492 18.7415C1.04989 18.7143 1.13987 18.6681 1.21812 18.6056C1.29637 18.5431 1.3613 18.4656 1.4091 18.3776C3.17535 15.3251 6.29722 13.5026 9.75941 13.5026C13.2216 13.5026 16.3435 15.3251 18.1097 18.3776C18.1575 18.4656 18.2225 18.5431 18.3007 18.6056C18.379 18.6681 18.4689 18.7143 18.5653 18.7415C18.6617 18.7687 18.7626 18.7763 18.862 18.7638C18.9613 18.7514 19.0572 18.7192 19.1439 18.6691C19.2307 18.619 19.3065 18.552 19.3669 18.4722C19.4273 18.3923 19.4712 18.3011 19.4958 18.2041C19.5204 18.107 19.5254 18.006 19.5103 17.9069C19.4952 17.8079 19.4605 17.7129 19.4082 17.6276ZM4.50941 6.75255C4.50941 5.7142 4.81732 4.69917 5.39419 3.83581C5.97107 2.97245 6.79101 2.29954 7.75032 1.90218C8.70963 1.50482 9.76523 1.40086 10.7836 1.60343C11.802 1.806 12.7375 2.30601 13.4717 3.04024C14.2059 3.77447 14.706 4.70993 14.9085 5.72833C15.1111 6.74673 15.0071 7.80233 14.6098 8.76164C14.2124 9.72095 13.5395 10.5409 12.6762 11.1178C11.8128 11.6946 10.7978 12.0026 9.75941 12.0026C8.36748 12.0011 7.03299 11.4475 6.04874 10.4632C5.0645 9.47897 4.5109 8.14448 4.50941 6.75255Z"
      fill="#2351A3"
    />
  </svg>
);

const CheckIcon = () => (
  <svg
    width="16"
    height="12"
    viewBox="0 0 16 12"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M15.4425 1.06754L5.44254 11.0675C5.38449 11.1256 5.31556 11.1717 5.23969 11.2032C5.16381 11.2347 5.08248 11.2508 5.00035 11.2508C4.91821 11.2508 4.83688 11.2347 4.76101 11.2032C4.68514 11.1717 4.61621 11.1256 4.55816 11.0675L0.18316 6.69254C0.0658846 6.57526 0 6.4162 0 6.25035C0 6.0845 0.0658846 5.92544 0.18316 5.80816C0.300435 5.69088 0.459495 5.625 0.625347 5.625C0.7912 5.625 0.95026 5.69088 1.06753 5.80816L5.00035 9.74175L14.5582 0.18316C14.6754 0.0658843 14.8345 -1.2357e-09 15.0003 0C15.1662 1.2357e-09 15.3253 0.0658843 15.4425 0.18316C15.5598 0.300435 15.6257 0.459495 15.6257 0.625347C15.6257 0.7912 15.5598 0.95026 15.4425 1.06754Z"
      fill="#3D495C"
    />
  </svg>
);
