export type TripType = "oneway" | "roundtrip" | "multicity";
export type PaxKey = "adults" | "kids" | "infants" | "seniors";

export interface FlightTypeItem {
  id: string;
  name: string; // e.g. "one way", "Round Trip", "Multi Cities"
  status: number; // 1 = active
  createdAt: number;
  updatedAt: number;
}

export interface FlightTypesResponse {
  items: FlightTypeItem[];
  nextToken: string | null;
}

export interface FlightTypeOption {
  id: string;
  label: string; // Original label to show in UI
  key: TripType; // Normalized key to use in code
}

export interface AirportItem {
  // id: string;
  // city: string;        // e.g., "Dubai"
  // cityCode: string;    // e.g., "DXB"
  // country: string;     // e.g., "UAE"
  // countryCode: string; // e.g., "UE"
  // status: number;
  // createdAt: number;
  // updatedAt: number;
  airportName: string;
  city: string; // e.g., "Dubai"
  country: string; // e.g., "UAE"
  countryCode: string; // e.g., "UE"
  iataCode: string;
}

export interface AirportsResponse {
  items: AirportItem[];
  nextToken: string | null;
}

export interface AirportOption {
  id: string;
  label: string; // e.g. "Dubai (DXB), UAE"
  code: string; // "DXB"
  city: string; // "Dubai"
  country: string; // "UAE"
}

export interface PassengerItem {
  id: string;
  category: "Adults" | "Children" | "Infants" | "Seniors";
  status: number;
  createdAt: number;
  updatedAt: number;
  ptc: string;
}

export interface PassengersResponse {
  items: PassengerItem[];
  nextToken: string | null;
}

export interface PassengerCategoryOption {
  key: PaxKey;
  title: string;
  ptc: string;
}

export type PassengerSchema = PassengerCategoryOption[];

export interface CabinClassItem {
  id: string;
  category: string; // e.g., "Economy", "Business Class"
  status: number;
  createdAt: number;
  updatedAt: number;
}

export interface CabinClassesResponse {
  items: CabinClassItem[];
  nextToken: string | null;
}

export interface CabinClassOption {
  id: string; // from API
  label: string; // category text to show
}

export interface PriceSortItem {
  id: string;
  category: string;
  value: string;
  status: number;
  createdAt: number;
  updatedAt: number;
}

export interface PriceSortResponse {
  items: PriceSortItem[];
  nextToken: string | null;
}

// AntD Select-options shape
export interface PriceSortOption {
  value: string; // id
  label: string; // category
}

export interface NumberStopsItem {
  id: string;
  category: string;
  status: number;
  createdAt: number;
  updatedAt: number;
}
export interface NumberStopsResponse {
  items: NumberStopsItem[];
  nextToken: string | null;
}
export interface NumberStopsOption {
  label: string;
  value: string;
}

export interface TransitHoursItem {
  id: string;
  category: string;
  status: number;
  createdAt: number;
  updatedAt: number;
}
export interface TransitHoursResponse {
  items: TransitHoursItem[];
  nextToken: string | null;
}
export interface TransitHoursOption {
  label: string;
  value: string;
}

export interface BaggageItem {
  id: string;
  category: string;
  status: number;
  createdAt: number;
  updatedAt: number;
}
export interface BaggageResponse {
  items: BaggageItem[];
  nextToken: string | null;
}

export interface BaggageOption {
  label: string;
  value: string;
}

export interface AirlineItem {
  id: string;
  name: string;
  code: string;
  status: number;
  createdAt: number;
  updatedAt: number;
}

export interface AirlinesResponse {
  items: AirlineItem[];
  nextToken: string | null;
}

export interface AirlineOption {
  id: string;
  label: string;
  code: string;
}

export interface CountryItem {
  iso2: string;
  iso3: string;
  country: string;
  cities: string[];
}

export interface CountriesResponse {
  error: boolean;
  msg: string;
  data: CountryItem[];
}

export interface CountryOption {
  iso2: string;
  iso3: string;
  label: string; // country name
}

export interface CitiesResponse {
  error: boolean;
  msg: string;
  data: string[]; // Array of city names
}

export interface CityOption {
  value: string; // city name
  label: string; // city name (for display)
}
