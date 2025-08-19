import React, { useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

type Location = {
  lat: number;
  lng: number;
  countryFlag: string;
  destinationName: string;
};

type MapInfoProps = {
  locations: Location[];
};

const AutoZoomAndAddTooltips: React.FC<{ locations: Location[] }> = ({
  locations,
}) => {
  const map = useMap();

  useEffect(() => {
    if (locations.length > 0) {
      const bounds = L.latLngBounds(locations.map((loc) => [loc.lat, loc.lng]));
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 4 });

      locations.forEach((loc) => {
        const marker = L.marker([loc.lat, loc.lng]).addTo(map);
        marker
          .bindTooltip(
            `<div style="display: flex; justify-content: center; align-items: center; gap: 5px; padding: 2px 25px">
            <img src="${loc.countryFlag}" alt="Flag" style="width: 20px; height: 15px; object-fit: cover"/>
            <span style="font-weight: 500; font-size: 12px">${loc.destinationName}</span>
          </div>`,
            {
              permanent: true,
              direction: "top",
              offset: [0, -10],
              opacity: 1,
              className: "custom-tooltip",
            }
          )
          .openTooltip();
      });
    }
  }, [locations, map]);

  return null;
};

const customIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const MapInfo: React.FC<MapInfoProps> = ({ locations }) => {
  if (locations.length === 0) return null;

  return (
    <>
      <MapContainer
        center={[locations[0].lat, locations[0].lng]}
        zoom={4}
        style={{ height: "100%", width: "100%" }}
        zoomControl={false}
      >
        {/* Custom tile layer with gray country borders (#6B6B6B) */}
        <TileLayer
          url={`https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}.png`}
        />
        <TileLayer
          url={`https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}.png`}
        />
        {/* Additional styling layer for gray borders */}
        <TileLayer
          url={`https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_only_labels/{z}/{x}/{y}.png`}
          pane="shadowPane"
          opacity={0.3}
        />

        <AutoZoomAndAddTooltips locations={locations} />

        {locations.map((loc, index) => (
          <Marker key={index} position={[loc.lat, loc.lng]} icon={customIcon} />
        ))}

        {locations.length > 1 && (
          <Polyline
            positions={locations.map((loc) => [loc.lat, loc.lng])}
            pathOptions={{
              color: "#FFA500",
              weight: 3,
              opacity: 0.9,
            }}
          />
        )}
      </MapContainer>

      <style>{`
        .leaflet-tooltip.custom-tooltip {
          background: white;
          border: 1px solid #e2e8f0;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          border-radius: 13px;
          margin-bottom: 8px;
        }
        .leaflet-tooltip.custom-tooltip:before {
          border-top-color: white;
        }
        .leaflet-container {
          background: #f8f8f8;
        }
        .leaflet-overlay-pane path {
          stroke: #6B6B6B;
          stroke-width: 0.5;
        }
      `}</style>
    </>
  );
};

export default MapInfo;
