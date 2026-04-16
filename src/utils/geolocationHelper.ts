import { VITE_NOMINATIM_BASE_URL } from "../config/publicEnv";

const nominatimFetchInit: RequestInit = {
  headers: {
    "User-Agent": "AlRaisTravelApp/1.0", // Nominatim policy; may be stripped in browser
    "Accept-Language": "en",
  },
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
    try {
        const query = `${airportCode} airport`;
        const response = await fetch(
            `${VITE_NOMINATIM_BASE_URL}/search?format=json&q=${encodeURIComponent(query)}&limit=1`,
            nominatimFetchInit,
        );

        const data = await response.json();

        if (data && data.length > 0) {
            return {
                lat: parseFloat(data[0].lat),
                lng: parseFloat(data[0].lon),
                name: data[0].display_name.split(',')[0]
            };
        }

        // Fallback to default coords
        return { lat: 0, lng: 0, name: airportCode };
    } catch (error) {
        console.error('Geocoding failed:', error);
        return { lat: 0, lng: 0, name: airportCode };
    }
};