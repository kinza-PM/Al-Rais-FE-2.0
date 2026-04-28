import { VITE_NOMINATIM_BASE_URL } from "../config/publicEnv";

const nominatimFetchInit: RequestInit = {
  headers: {
    "User-Agent": "AlRaisTravelApp/1.0", // Nominatim policy; may be stripped in browser
    "Accept-Language": "en",
  },
};

type AirportCoords = {
  lat: number;
  lng: number;
  name: string;
};

const AIRPORT_COORDS_CACHE_PREFIX = "airport_coords_v1:";
const memoryCache = new Map<string, AirportCoords>();
const inFlightRequests = new Map<string, Promise<AirportCoords>>();

const sleep = (ms: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

const normalizeAirportCode = (airportCode: string) =>
  String(airportCode ?? "").trim().toUpperCase();

const readCachedAirportCoords = (airportCode: string): AirportCoords | null => {
  const code = normalizeAirportCode(airportCode);
  if (!code) return null;

  const inMemory = memoryCache.get(code);
  if (inMemory) return inMemory;

  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(`${AIRPORT_COORDS_CACHE_PREFIX}${code}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AirportCoords;
    if (
      typeof parsed?.lat === "number" &&
      typeof parsed?.lng === "number" &&
      Number.isFinite(parsed.lat) &&
      Number.isFinite(parsed.lng)
    ) {
      memoryCache.set(code, parsed);
      return parsed;
    }
  } catch {
    // Ignore malformed cached data.
  }
  return null;
};

const writeCachedAirportCoords = (airportCode: string, value: AirportCoords) => {
  const code = normalizeAirportCode(airportCode);
  if (!code) return;
  memoryCache.set(code, value);
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      `${AIRPORT_COORDS_CACHE_PREFIX}${code}`,
      JSON.stringify(value),
    );
  } catch {
    // Ignore storage quota/errors.
  }
};

const fetchCoordsFromNominatim = async (
  query: string,
): Promise<AirportCoords | null> => {
  // Nominatim is strict with public usage; retry softly on 429s.
  for (let attempt = 0; attempt < 3; attempt++) {
    const response = await fetch(
      `${VITE_NOMINATIM_BASE_URL}/search?format=json&q=${encodeURIComponent(query)}&limit=1&addressdetails=0`,
      nominatimFetchInit,
    );

    if (response.status === 429) {
      await sleep(600 * (attempt + 1));
      continue;
    }
    if (!response.ok) return null;

    const data = (await response.json()) as Array<{
      lat?: string;
      lon?: string;
      display_name?: string;
    }>;
    if (!Array.isArray(data) || data.length === 0) return null;

    const lat = Number.parseFloat(String(data[0]?.lat ?? ""));
    const lng = Number.parseFloat(String(data[0]?.lon ?? ""));
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;

    return {
      lat,
      lng,
      name: String(data[0]?.display_name ?? "").split(",")[0] || query,
    };
  }
  return null;
};

const fetchCoordsFromPhoton = async (query: string): Promise<AirportCoords | null> => {
  // Fallback public geocoder if Nominatim rate-limits.
  const response = await fetch(
    `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=1`,
  );
  if (!response.ok) return null;
  const data = (await response.json()) as {
    features?: Array<{
      geometry?: { coordinates?: number[] };
      properties?: { name?: string };
    }>;
  };
  const feature = data?.features?.[0];
  const coords = feature?.geometry?.coordinates;
  if (!Array.isArray(coords) || coords.length < 2) return null;
  const lng = Number(coords[0]);
  const lat = Number(coords[1]);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  return {
    lat,
    lng,
    name: String(feature?.properties?.name ?? query),
  };
};

export type CountryFromLocation = {
  country: string;
  countryCode: string;
};

/**
 * Browser GPS (with user consent) + Nominatim reverse geocode → country name and ISO code.
 * Returns null if geolocation is unavailable, denied, timed out, or reverse lookup fails.
 */
export async function getCountryFromBrowserLocation(): Promise<CountryFromLocation | null> {
  if (typeof navigator === "undefined" || !navigator.geolocation) {
    return null;
  }

  const position = await new Promise<GeolocationPosition>((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: false,
      maximumAge: 5 * 60 * 1000,
      timeout: 12_000,
    });
  }).catch(() => null);

  if (!position) return null;

  const { latitude, longitude } = position.coords;
  const url = `${VITE_NOMINATIM_BASE_URL}/reverse?format=json&lat=${encodeURIComponent(String(latitude))}&lon=${encodeURIComponent(String(longitude))}`;

  try {
    const response = await fetch(url, nominatimFetchInit);
    if (!response.ok) return null;
    const data = (await response.json()) as {
      address?: { country?: string; country_code?: string };
    };
    const country = data?.address?.country?.trim();
    const rawCode = data?.address?.country_code?.trim();
    if (!country && !rawCode) return null;
    const countryCode = rawCode ? rawCode.toUpperCase() : "";
    return {
      country: country || countryCode,
      countryCode,
    };
  } catch {
    return null;
  }
}

export const getAirportCoords = async (airportCode: string) => {
  const code = normalizeAirportCode(airportCode);
  if (!code) return { lat: 0, lng: 0, name: "" };

  const cached = readCachedAirportCoords(code);
  if (cached) return cached;

  const pending = inFlightRequests.get(code);
  if (pending) return pending;

  const task = (async (): Promise<AirportCoords> => {
    try {
      const query = `${code} airport`;
      // Prefer Photon first to avoid frequent Nominatim 429 rate-limits.
      const fromPhoton = await fetchCoordsFromPhoton(query);
      const fromNominatim = fromPhoton ? null : await fetchCoordsFromNominatim(query);
      const resolved =
        fromPhoton ?? fromNominatim ?? { lat: 0, lng: 0, name: code };
      if (resolved.lat !== 0 || resolved.lng !== 0) {
        writeCachedAirportCoords(code, resolved);
      }
      return resolved;
    } catch (error) {
      console.error("Geocoding failed:", error);
      return { lat: 0, lng: 0, name: code };
    } finally {
      inFlightRequests.delete(code);
    }
  })();

  inFlightRequests.set(code, task);
  return task;
};