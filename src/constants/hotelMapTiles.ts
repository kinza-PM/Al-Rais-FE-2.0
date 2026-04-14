/**
 * Esri World Street Map — uses US/Esri cartography that prefers English/Latin
 * road labels in many regions. CARTO Voyager/OSM styles often render the local
 * `name` tag (e.g. Urdu in Pakistan).
 *
 * Leaflet Esri convention: tile URL uses `{z}/{y}/{x}` (row/column order).
 */
export const HOTEL_LEAFLET_TILE_URL_ESRI_WORLD_STREET =
  "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}";

export const HOTEL_LEAFLET_TILE_ATTRIBUTION_ESRI =
  '&copy; <a href="https://www.esri.com/">Esri</a> &mdash; Esri, Maxar, Earthstar Geographics, GIS User Community';
