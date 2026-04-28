const LISTING_USER_COUNTRY_KEY = "listing_user_country";

/** When geolocation is blocked or unavailable, airport listing uses empty `search` (no country default). */
const DEFAULT_LISTING_COUNTRY = "";

/** Persist lowercase country name (set after geolocation on landing). Used as default `search` for airport listing. */
export function setListingUserCountryFromLocation(countryName: string): void {
  if (typeof window === "undefined" || !window.localStorage) return;
  try {
    const v = countryName.trim().toLowerCase();
    if (v) localStorage.setItem(LISTING_USER_COUNTRY_KEY, v);
    else localStorage.removeItem(LISTING_USER_COUNTRY_KEY);
  } catch {
    /* ignore quota / private mode */
  }
}

/** Lowercase name for default listing `search` (e.g. airports); empty until geolocation succeeds and updates storage. */
export function getListingDefaultCountry(): string {
  if (typeof window === "undefined" || !window.localStorage) {
    return DEFAULT_LISTING_COUNTRY;
  }
  try {
    const v = localStorage.getItem(LISTING_USER_COUNTRY_KEY)?.trim().toLowerCase();
    if (v) return v;
  } catch {
    /* ignore */
  }
  return DEFAULT_LISTING_COUNTRY;
}
