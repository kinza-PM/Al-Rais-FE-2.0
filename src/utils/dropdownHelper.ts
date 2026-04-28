// utils/hotelHelpers.ts (or helpers/hotelHelpers.ts)

export interface DropdownOption {
  id: string;
  value: string;
  label: string;
  countryCode?: string;
}

// export interface CityOption {
//   id: string;
//   value: string;
//   label: string;
// }

/**
 * Extract unique countries from airport/location data
 */
// export const getUniqueCountries = (data: any[]): CountryOption[] => {
//   if (!data || !Array.isArray(data)) return [];

//   const uniqueCountries = new Map();
//   data.forEach((item: any) => {
//     if (item.country && !uniqueCountries.has(item.country)) {
//       uniqueCountries.set(item.country, {
//         id: item.countryCode || item.country,
//         value: item.country,
//         label: item.country,
//         countryCode: item.countryCode,
//       });
//     }
//   });

//   return Array.from(uniqueCountries.values());
// };

// /**
//  * Extract unique cities for a specific country
//  */
// export const getCitiesByCountry = (
//   data: any[],
//   selectedCountry: string
// ): CityOption[] => {
//   if (!data || !Array.isArray(data) || !selectedCountry) return [];

//   const uniqueCities = new Map();
//   data
//     .filter((item: any) => item.country === selectedCountry)
//     .forEach((item: any) => {
//       if (item.city && !uniqueCities.has(item.city)) {
//         uniqueCities.set(item.city, {
//           id: item.code || item.city,
//           value: item.city,
//           label: item.city,
//         });
//       }
//     });

//   return Array.from(uniqueCities.values());
// };

/**
 * Get nationality options (country name and country code)
 * Format: "COUNTRY,CODE" as value, "COUNTRY" as label
 */
export const getNationalityOptions = (data: any[]): DropdownOption[] => {
  if (!data || !Array.isArray(data)) return [];

  const uniqueCountries = new Map();
  data.forEach((item: any) => {
    if (
      item.country &&
      item.countryCode &&
      !uniqueCountries.has(item.country)
    ) {
      uniqueCountries.set(item.country, {
        id: item.countryCode,
        value: `${item.country},${item.countryCode}`,
        label: item.country,
        countryCode: item.countryCode,
      });
    }
  });

  return Array.from(uniqueCountries.values());
};
