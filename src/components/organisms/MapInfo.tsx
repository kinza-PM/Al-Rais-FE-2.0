import React, { useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  useMap,
  Tooltip,
  Pane,
} from "react-leaflet";
import * as L from "leaflet";
import "leaflet/dist/leaflet.css";

type Location = {
  lat: number;
  lng: number;
  countryFlag?: string;
  destinationName: string;
};

type MapInfoProps = {
  locations: Location[];
};

const AutoZoom: React.FC<{ locations: Location[] }> = ({ locations }) => {
  const map = useMap();

  useEffect(() => {
    if (!locations.length) return;

    const bounds = L.latLngBounds(
      locations.map<L.LatLngExpression>((loc) => [loc.lat, loc.lng])
    );
    map.fitBounds(bounds, { padding: [80, 80], maxZoom: 5 });
  }, [locations, map]);

  return null;
};

// Default Leaflet icon
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
  if (!locations.length) return null;

  const initialCenter: L.LatLngExpression = [
    locations[0].lat,
    locations[0].lng,
  ];

  return (
    <>
      <MapContainer
        center={initialCenter}
        zoom={4}
        style={{ height: "100%", width: "100%" }}
        zoomControl={false}
      >
        {/* Base map */}
        <TileLayer url="https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}.png" />
        <TileLayer url="https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}.png" />

        {/* Optional: create a pane for subtle borders/labels */}
        <Pane name="borders" style={{ zIndex: 350, opacity: 0.3 }}>
          <TileLayer url="https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_only_labels/{z}/{x}/{y}.png" />
        </Pane>

        <AutoZoom locations={locations} />

        {/* Markers with tooltips */}
        {locations.map((loc, idx) => (
          <Marker key={idx} position={[loc.lat, loc.lng]} icon={customIcon}>
            <Tooltip
              permanent
              direction="top"
              offset={[0, -35]}
              opacity={1}
              className="custom-tooltip"
            >
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '5px', padding: '2px 25px' }}>
                {loc.countryFlag && (
                  <img
                    src={loc.countryFlag}
                    alt="Flag"
                    style={{ width: '20px', height: '15px', objectFit: 'cover', marginRight: '5px' }}
                  />
                )}
                <span style={{ fontWeight: 500, fontSize: '12px' }}>{loc.destinationName}</span>
              </div>
            </Tooltip>
          </Marker>
        ))}

        {/* Straight lines connecting locations */}
        {locations.length > 1 && locations.map((_, idx) => {
          if (idx === locations.length - 1) return null;

          const start = locations[idx];
          const end = locations[idx + 1];

          return (
            <Polyline
              key={`path-${idx}`}
              positions={[
                [start.lat, start.lng],
                [end.lat, end.lng]
              ]}
              pathOptions={{ color: "#FFA500", weight: 3, opacity: 0.9 }}
            />
          );
        })}
      </MapContainer>

      <style>{`
        .leaflet-tooltip.custom-tooltip {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          border-radius: 13px;
          margin-bottom: 8px;
        }
        .leaflet-tooltip.custom-tooltip:before { border-top-color: white; }
        .leaflet-container { background: #f8f8f8; }
        .leaflet-overlay-pane path { stroke: #6B6B6B; stroke-width: 0.5; }
      `}</style>
    </>
  );
};

export default MapInfo;