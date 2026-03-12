import React, { useCallback } from "react";
import HotellGridCard from "../atoms/HotellGridCard";
import { MapContainer, TileLayer, Marker, Tooltip } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useHotelStore } from "../../store/UseHotelStore";
import { handleHotelShare } from "../../utils/hotelHelper";
import FilledStar from "../../assets/svgs/filled_star.svg";
import EmptyStar from "../../assets/svgs/empty_star.svg";
import HotelImage from "../../assets/images/Hotel Image.png";

const redIcon = L.icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [20, 30],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

type HotelSearchMapViewProps = {
  hotels: Array<any>;
};

const renderStars = (rating: string | number | undefined) => {
  const numRating = rating ? Math.floor(Number(rating)) : 0;
  const totalStars = 5;

  return (
    <div className="flex items-center gap-[3px] mt-1 mb-3">
      {Array.from({ length: numRating }).map((_, i) => (
        <img
          key={`filled-${i}`}
          src={FilledStar}
          alt="filled star"
          className="w-[16px] h-[16px]"
        />
      ))}
      {Array.from({ length: totalStars - numRating }).map((_, i) => (
        <img
          key={`empty-${i}`}
          src={EmptyStar}
          alt="empty star"
          className="w-[16px] h-[16px]"
        />
      ))}
    </div>
  );
};

const getPreviewData = (hotel: any) => {
  const firstRoom = hotel.rooms?.[0];
  const price = hotel.totalPrice || firstRoom?.roomRate?.netAmount || 0;
  const currency = firstRoom?.roomRate?.currency || "PKR";
  const roomName = firstRoom?.roomTypeName || "Superior Single Room";
  const meal = firstRoom?.ratePlan?.meal || "";
  const cancellationPolicy =
    firstRoom?.ratePlan?.cancelPolicyIndicator || "";
  const adults = firstRoom?.maxOccupancy || 2;
  const nights = firstRoom?.roomRate?.rates?.length || 1;

  const taxesAndFees = hotel?.taxesAndFees || 2340; // fallback for UI preview
  const reviewScore = hotel?.reviewScore || hotel?.propertyInfo?.reviewScore || 7.3;
  const reviewText =
    reviewScore >= 8 ? "Very good" : reviewScore >= 7 ? "Good" : "Average";
  const reviewCount = hotel?.reviewCount || 131;
  const locationScore = hotel?.locationScore || 8.4;
  const beachDistance = hotel?.beachDistance || "600 m from beach";

  return {
    price,
    currency,
    roomName,
    meal,
    cancellationPolicy,
    adults,
    nights,
    taxesAndFees,
    reviewScore,
    reviewText,
    reviewCount,
    locationScore,
    beachDistance,
  };
};

const HotelMapHoverCard = ({ hotel }: { hotel: any }) => {
  const imageUrl = hotel.propertyInfo?.imageUrl || HotelImage;
  const hotelName = hotel.propertyInfo?.hotelName || "Hotel";
  const starRating = hotel.propertyInfo?.starRating || 0;

  const {
    price,
    currency,
    roomName,
    meal,
    cancellationPolicy,
    adults,
    nights,
    taxesAndFees,
    reviewScore,
    reviewText,
    reviewCount,
    locationScore,
    beachDistance,
  } = getPreviewData(hotel);

  return (
    <div className="hotel-map-hover-card">
      <button
        type="button"
        className="hotel-map-hover-close"
        onClick={(e) => e.preventDefault()}
      >
        ×
      </button>

      <div className="hotel-map-hover-image-wrap">
        <img
          src={imageUrl}
          alt={hotelName}
          className="hotel-map-hover-image"
          onError={(e) => {
            e.currentTarget.src = HotelImage;
          }}
        />
      </div>

      <div className="hotel-map-hover-content">
        <h3 className="hotel-map-hover-title">{hotelName}</h3>

        {renderStars(starRating)}

        <div className="hotel-map-hover-distance">{beachDistance}</div>

        <div className="hotel-map-hover-rating-row">
          <span className="hotel-map-hover-score">{reviewScore}</span>
          <span className="hotel-map-hover-rating-text">
            {reviewText} · {reviewCount} reviews
          </span>
        </div>

        <div className="hotel-map-hover-location-score">
          {locationScore} Location
        </div>

        <div className="hotel-map-hover-room">
          <strong>{roomName}:</strong>{" "}
          {adults > 1 ? `${adults} beds` : "1 bed"}
        </div>

        <div className="hotel-map-hover-meta">
          {nights} night{nights > 1 ? "s" : ""}, {adults} adult
          {adults > 1 ? "s" : ""}
        </div>

        <div className="hotel-map-hover-price">
          {currency} {Number(price).toLocaleString()}
        </div>

        <div className="hotel-map-hover-tax">
          +{currency} {Number(taxesAndFees).toLocaleString()} taxes and fees
        </div>

        {meal && (
          <div className="hotel-map-hover-green">
            {meal.toLowerCase().includes("breakfast")
              ? "Breakfast included"
              : meal}
          </div>
        )}

        {cancellationPolicy && (
          <div className="hotel-map-hover-green">
            {cancellationPolicy.toLowerCase().includes("free")
              ? "Free cancellation"
              : cancellationPolicy}
          </div>
        )}
      </div>
    </div>
  );
};

const HotelSearchMapView: React.FC<HotelSearchMapViewProps> = React.memo(
  ({ hotels }) => {
    const [favorites, setFavorites] = React.useState<{ [key: string]: boolean }>(
      {},
    );
    const [isMapExpanded, setIsMapExpanded] = React.useState(false);
    const mapRef = React.useRef<L.Map | null>(null);
    const { hotel: bookingParams } = useHotelStore();

    const toggleMapExpand = () => {
      setIsMapExpanded(!isMapExpanded);
      setTimeout(() => {
        if (mapRef.current) {
          mapRef.current.invalidateSize();
        }
      }, 300);
    };

    const toggleFavorite = (hotelKey: string) => {
      setFavorites((prev) => ({
        ...prev,
        [hotelKey]: !prev[hotelKey],
      }));
    };

    const getMapCenter = () => {
      if (!hotels || hotels.length === 0) {
        return [24.8607, 67.0011] as [number, number];
      }

      const validHotels = hotels.filter(
        (hotel) =>
          hotel.propertyInfo?.latitude && hotel.propertyInfo?.longitude,
      );

      if (validHotels.length === 0) {
        return [24.8607, 67.0011] as [number, number];
      }

      const avgLat =
        validHotels.reduce(
          (sum, hotel) => sum + parseFloat(hotel.propertyInfo.latitude),
          0,
        ) / validHotels.length;
      const avgLng =
        validHotels.reduce(
          (sum, hotel) => sum + parseFloat(hotel.propertyInfo.longitude),
          0,
        ) / validHotels.length;

      return [avgLat, avgLng] as [number, number];
    };

    const handleShare = useCallback(
      (hotelKey: string, searchKey: string) =>
        handleHotelShare(hotelKey, searchKey, bookingParams),
      [bookingParams],
    );

    if (!hotels || hotels.length === 0) {
      return (
        <div className="py-16 flex flex-col items-center text-center">
          <p className="mt-2 text-[14px] text-[#0F172A]">No hotels found</p>
        </div>
      );
    }

    return (
      <div className="min-h-screen">
        <div className="mx-auto">
          <div className="grid grid-cols-4 gap-5">
            {!isMapExpanded && (
              <div className="col-span-1 flex flex-col gap-4 transition-all duration-300 ease-in-out">
                {hotels.slice(0, 10).map((hotel, index) => (
                  <HotellGridCard
                    key={hotel.hotelKey || index}
                    hotel={hotel}
                    toggleFavorite={toggleFavorite}
                    hotelKey={hotel.hotelKey || index.toString()}
                    favorites={favorites}
                    onShare={() => handleShare(hotel.hotelKey, hotel.searchKey)}
                  />
                ))}
              </div>
            )}

            <div
              className={`${
                isMapExpanded ? "col-span-4" : "col-span-3"
              } sticky top-5 h-[calc(100vh-27vh)] mb-4 transition-all duration-300 ease-in-out`}
            >
              <div className="h-full rounded-xl overflow-hidden relative">
                <button
                  className={`absolute top-1/2 -translate-y-1/2 z-[1000] bg-[#F2F2F3] py-4 px-5 border border-[#FFFFFF] ${
                    isMapExpanded
                      ? "left-0 rounded-r-full border-l-0 px-3"
                      : "-left-4 rounded-full"
                  }`}
                  onClick={toggleMapExpand}
                >
                  <svg
                    width="8"
                    height="14"
                    viewBox="0 0 8 14"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M6.4332 13.5675L0.183197 7.31754C0.125086 7.25949 0.0789868 7.19056 0.0475342 7.11468C0.0160815 7.03881 -0.000106639 6.95748 -0.000106635 6.87535C-0.000106632 6.79321 0.0160815 6.71188 0.0475342 6.63601C0.0789868 6.56014 0.125087 6.4912 0.183197 6.43316L6.4332 0.18316C6.55047 0.0658845 6.70953 -3.45844e-08 6.87538 -2.73348e-08C7.04124 -2.00852e-08 7.2003 0.0658846 7.31757 0.18316C7.43485 0.300435 7.50073 0.459495 7.50073 0.625347C7.50073 0.7912 7.43485 0.95026 7.31757 1.06753L1.50898 6.87535L7.31757 12.6832C7.37564 12.7412 7.4217 12.8102 7.45313 12.886C7.48456 12.9619 7.50073 13.0432 7.50073 13.1253C7.50073 13.2075 7.48456 13.2888 7.45313 13.3647C7.4217 13.4405 7.37564 13.5095 7.31757 13.5675C7.2595 13.6256 7.19057 13.6717 7.11469 13.7031C7.03882 13.7345 6.95751 13.7507 6.87538 13.7507C6.79326 13.7507 6.71194 13.7345 6.63607 13.7031C6.5602 13.6717 6.49127 13.6256 6.4332 13.5675Z"
                      fill="#0A0C0F"
                    />
                  </svg>
                </button>
                <MapContainer
                  center={getMapCenter()}
                  zoom={12}
                  style={{ height: "100%", width: "100%" }}
                  zoomControl={false}
                  attributionControl={false}
                  ref={mapRef}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://carto.com/">CARTO</a>'
                    url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png"
                  />

                  {hotels
                    .filter(
                      (hotel) =>
                        hotel.propertyInfo?.latitude &&
                        hotel.propertyInfo?.longitude,
                    )
                    .map((hotel) => {
                      const lat = parseFloat(hotel.propertyInfo.latitude);
                      const lng = parseFloat(hotel.propertyInfo.longitude);

                      return (
                        <Marker
                          key={hotel.hotelKey}
                          position={[lat, lng]}
                          icon={redIcon}
                        >
                          <Tooltip
                            direction="right"
                            offset={[18, -10]}
                            opacity={1}
                            permanent={false}
                            sticky={true}
                            interactive={true}
                            className="hotel-map-custom-tooltip"
                          >
                            <HotelMapHoverCard hotel={hotel} />
                          </Tooltip>
                        </Marker>
                      );
                    })}
                </MapContainer>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  },
);

HotelSearchMapView.displayName = "HotelSearchMapView";

export default HotelSearchMapView;