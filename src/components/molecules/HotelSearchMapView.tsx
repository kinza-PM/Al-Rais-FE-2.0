import React, { useCallback } from "react";
import HotellGridCard from "../atoms/HotellGridCard";
import { MapContainer, TileLayer, Marker, Popup, Tooltip } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import toast from "react-hot-toast";
import { useHotelStore } from "../../store/UseHotelStore";

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

const HotelSearchMapView: React.FC<HotelSearchMapViewProps> = React.memo(({ hotels }) => {
  const [favorites, setFavorites] = React.useState<{ [key: string]: boolean }>(
    {}
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

  // Calculate map center from hotels
  const getMapCenter = () => {
    if (!hotels || hotels.length === 0) {
      return [24.8607, 67.0011] as [number, number]; // Default center
    }

    const validHotels = hotels.filter(
      (hotel) =>
        hotel.propertyInfo?.latitude && hotel.propertyInfo?.longitude
    );

    if (validHotels.length === 0) {
      return [24.8607, 67.0011] as [number, number];
    }

    const avgLat =
      validHotels.reduce(
        (sum, hotel) => sum + parseFloat(hotel.propertyInfo.latitude),
        0
      ) / validHotels.length;
    const avgLng =
      validHotels.reduce(
        (sum, hotel) => sum + parseFloat(hotel.propertyInfo.longitude),
        0
      ) / validHotels.length;

    return [avgLat, avgLng] as [number, number];
  };

  const handleShare = useCallback((hotelKey: string, searchKey: string) => {
    const params = new URLSearchParams({
      searchKey: searchKey ?? "",
    });
    if (bookingParams) {
      params.set("bookingParams", JSON.stringify(bookingParams));
    }

    const shareUrl = `${window.location.origin}/hotel-detail/${hotelKey}?${params.toString()}`;
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(shareUrl);
    } else {
      const textArea = document.createElement("textarea");
      textArea.value = shareUrl;
      textArea.style.position = "fixed";
      textArea.style.opacity = "0";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
    }
    toast.success("Link copied to clipboard!");
  }, [bookingParams]);

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
              {hotels.slice(0, 10).map((hotel, index) => {
                return (
                  <HotellGridCard
                    key={hotel.hotelKey || index}
                    hotel={hotel}
                    toggleFavorite={toggleFavorite}
                    hotelKey={hotel.hotelKey || index.toString()}
                    favorites={favorites}
                    onShare={() => handleShare(hotel.hotelKey, hotel.searchKey)}
                  />
                );
              })}
            </div>
          )}

          <div
            className={`${isMapExpanded ? "col-span-4" : "col-span-3"
              } sticky top-5 h-[calc(100vh-27vh)] mb-4 transition-all duration-300 ease-in-out`}
          >
            <div className="h-full rounded-xl overflow-hidden">
              <button
                className={`absolute top-1/2 -translate-y-1/2 z-[1000] bg-[#F2F2F3] py-4 px-5 border border-[#FFFFFF] ${isMapExpanded
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
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {hotels
                  .filter(
                    (hotel) =>
                      hotel.propertyInfo?.latitude &&
                      hotel.propertyInfo?.longitude
                  )
                  .map((hotel) => {
                    const firstRoom = hotel.rooms?.[0];
                    const price =
                      hotel.totalPrice || firstRoom?.roomRate?.netAmount || 0;
                    const currency =
                      firstRoom?.roomRate?.currency || "AED";
                    const lat = parseFloat(hotel.propertyInfo.latitude);
                    const lng = parseFloat(hotel.propertyInfo.longitude);

                    return (
                      <Marker
                        key={hotel.hotelKey}
                        position={[lat, lng]}
                        icon={redIcon}
                      >
                        <Tooltip permanent direction="top" offset={[0, -41]}>
                          <div className="text-xs font-semibold">
                            {hotel.propertyInfo?.hotelName || "Hotel"}
                          </div>
                        </Tooltip>
                        <Popup>
                          <div className="text-sm">
                            <p className="font-semibold">
                              {hotel.propertyInfo?.hotelName || "Hotel"}
                            </p>
                            <p className="text-gray-600">
                              {currency} {price.toFixed(2)}
                              {/* {currency} {price.toFixed(2)}/night */}
                            </p>
                          </div>
                        </Popup>
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
});

HotelSearchMapView.displayName = "HotelSearchMapView";

export default HotelSearchMapView;
