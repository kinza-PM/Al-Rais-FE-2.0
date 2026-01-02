import React from "react";
import HotellGridCard from "../atoms/HotellGridCard";
import { MapContainer, TileLayer, Marker, Popup, Tooltip } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

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

type HotelSearchMapViewProps = {};
const HotelSearchMapView: React.FC<HotelSearchMapViewProps> = () => {
  const [favorites, setFavorites] = React.useState<{ [key: number]: boolean }>(
    {}
  );
  const [isMapExpanded, setIsMapExpanded] = React.useState(false);
  const mapRef = React.useRef<L.Map | null>(null);

  const toggleMapExpand = () => {
    setIsMapExpanded(!isMapExpanded);
    setTimeout(() => {
      if (mapRef.current) {
        mapRef.current.invalidateSize();
      }
    }, 300);
  };

  const toggleFavorite = (index: number) => {
    setFavorites((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const hotelMapItems = [
    {
      id: 1,
      name: "Pearl Continental Hotel",
      position: [24.8607, 67.0011],
      price: "$120",
    },
    {
      id: 2,
      name: "Movenpick Hotel",
      position: [24.9056, 67.0822],
      price: "$95",
    },
    {
      id: 3,
      name: "Avari Towers",
      position: [24.8138, 67.0294],
      price: "$110",
    },
    {
      id: 4,
      name: "Beach Luxury Hotel",
      position: [24.8256, 66.975],
      price: "$85",
    },
  ];

  return (
    <div className="min-h-screen">
      <div className="mx-auto">
        <div className="grid grid-cols-4 gap-5">
          {!isMapExpanded && (
            <div className="col-span-1 flex flex-col gap-4 transition-all duration-300 ease-in-out">
              {Array.from({ length: 10 }).map((_, index) => {
                return (
                  <HotellGridCard
                    toggleFavorite={toggleFavorite}
                    index={index}
                    key={index}
                    favorites={favorites}
                  />
                );
              })}
            </div>
          )}

          <div
            className={`${
              isMapExpanded ? "col-span-4" : "col-span-3"
            } sticky top-5 h-[calc(100vh-27vh)] mb-4 transition-all duration-300 ease-in-out`}
          >
            <div className="h-full rounded-xl overflow-hidden">
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
                center={[24.8607, 67.0011]}
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
                {hotelMapItems.map((hotel) => (
                  <Marker
                    key={hotel.id}
                    position={hotel.position as [number, number]}
                    icon={redIcon}
                  >
                    <Tooltip permanent direction="top" offset={[0, -41]}>
                      <div className="text-xs font-semibold">{hotel.name}</div>
                    </Tooltip>
                    <Popup>
                      <div className="text-sm">
                        <p className="font-semibold">{hotel.name}</p>
                        <p className="text-gray-600">{hotel.price}/night</p>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default HotelSearchMapView;
