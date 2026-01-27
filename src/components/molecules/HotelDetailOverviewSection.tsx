import { memo, useMemo } from "react";
import { getFacilityIcon } from "../../utils/hotelHelper";
import { formatTo12Hour } from "../../utils/helpers";

type HotelDetailOverviewSectionProps = {
  hotelDetail?: any;
};

const FacilityItem = memo<{ name: string; icon: string | null }>(
  ({ name, icon }) => (
    <div className="flex items-center gap-2">
      {icon && <img src={icon} alt="icon" className="w-5 h-5" />}
      <span>{name}</span>
    </div>
  )
);

FacilityItem.displayName = "FacilityItem";

const HotelDetailOverviewSection = ({
  hotelDetail,
}: HotelDetailOverviewSectionProps) => {
  const displayFacilities = useMemo(() => {
    if (!hotelDetail?.hotelFacilities) return [];

    // Filter out unwanted facilities aur duplicates
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

      // Skip unwanted facilities
      if (unwantedKeywords.some((keyword) => lowerName.includes(keyword))) {
        return;
      }

      // Skip duplicates
      if (seenFacilities.has(lowerName)) {
        return;
      }

      const icon = getFacilityIcon(cleanName);

      // Only add if we have an icon or it's an important facility
      if (icon || facilities.length < 10) {
        seenFacilities.add(lowerName);
        facilities.push({ name: cleanName, icon });
      }
    });

    // Limit to 10-12 most important facilities
    // return facilities;
    return facilities.slice(0, 10);
  }, [hotelDetail?.hotelFacilities]);
  return (
    <div className="mt-6 grid grid-cols-2 gap-x-40">
      <div>
        <h4 className="text-[#0A0C0F] text-base font-bold">
          Get the celebrity treatment with world-class service at{" "}
          {hotelDetail?.name || "This Hotel"}
        </h4>
        <p className="text-[#3D495C] text-sm mt-3">
          <span
            dangerouslySetInnerHTML={{
              __html: hotelDetail?.description
                ? hotelDetail.description
                : "This hotel offers comfortable accommodation with modern amenities and excellent service.",
            }}
          />
          <br />
          Guests really like the location — it’s rated{" "}
          <span className="font-bold">
            {hotelDetail?.userRating || hotelDetail?.starRating || "4"}
          </span>
          .
        </p>
        {hotelDetail?.phoneNumber && (
          <div className="flex items-center gap-2 text-[#2351A3] text-sm mt-1">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path
                d="M6.62 10.79C8.06 13.62 10.38 15.94 13.21 17.38L15.41 15.18C15.67 14.92 16.05 14.84 16.38 14.93C17.49 15.23 18.67 15.39 19.88 15.39C20.49 15.39 21 15.9 21 16.51V20C21 20.61 20.49 21.12 19.88 21.12C10.56 21.12 2.88 13.44 2.88 4.12C2.88 3.51 3.39 3 4 3H7.49C8.1 3 8.61 3.51 8.61 4.12C8.61 5.33 8.77 6.51 9.07 7.62C9.16 7.95 9.08 8.33 8.82 8.59L6.62 10.79Z"
                fill="#2351A3"
              />
            </svg>

            <a
              href={`tel:${hotelDetail.phoneNumber}`}
              className="font-medium hover:underline"
            >
              {hotelDetail.phoneNumber}
            </a>
          </div>
        )}
        {hotelDetail?.email && (
          <div className="flex items-center gap-2 text-[#2351A3] text-sm mt-1">
            ✉️
            <a
              href={`mailto:${hotelDetail.email}`}
              className="font-medium hover:underline"
            >
              {hotelDetail.email}
            </a>
          </div>
        )}
        {hotelDetail?.website && (
          <div className="flex items-center gap-2 text-[#2351A3] text-sm mt-1">
            🌐
            <a
              href={hotelDetail.website}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium hover:underline"
            >
              {hotelDetail.website}
            </a>
          </div>
        )}
        {(hotelDetail?.checkInTime || hotelDetail?.checkOutTime) && (
          <div className="text-[#3D495C] text-sm mt-1">
            {hotelDetail?.checkInTime && (
              <div>
                <span className="font-medium">Check-in:</span>{" "}
                {formatTo12Hour(hotelDetail.checkInTime)}
              </div>
            )}
            {hotelDetail?.checkOutTime && (
              <div>
                <span className="font-medium">Check-out:</span>{" "}
                {formatTo12Hour(hotelDetail.checkOutTime)}
              </div>
            )}
          </div>
        )}
      </div>
      <div>
        <h5 className="text-[#0A0C0F] text-base font-medium">
          Most popular facilies
        </h5>
        {/* <div className="text-[#3D495C] text-sm mt-4 flex flex-wrap items-center gap-5">
          {hotelFacilities.map((facility, index) => {
            return (
              <div className="flex items-center gap-2" key={index}>
                <img src={facility.icon} alt="icon" />
                {facility.name}
              </div>
            );
          })}
        </div> */}
        {displayFacilities.length > 0 ? (
          <div className="text-[#3D495C] text-sm mt-4 flex flex-wrap items-center gap-5">
            {displayFacilities.map((facility, index) => (
              <FacilityItem
                key={`${facility.name}-${index}`}
                name={facility.name}
                icon={facility.icon}
              />
            ))}
          </div>
        ) : (
          <p className="text-[#3D495C] text-sm mt-4">
            No facilities information available
          </p>
        )}
      </div>
    </div>
  );
};

export default memo(HotelDetailOverviewSection);
