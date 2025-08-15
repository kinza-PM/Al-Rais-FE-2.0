export type TripType = 'oneway' | 'roundtrip' | 'multicity';
export type PaxKey = "adults" | "kids" | "infants" | "seniors";

export interface FlightTypeItem {
    id: string;
    name: string;       // e.g. "one way", "Round Trip", "Multi Cities"
    status: number;     // 1 = active
    createdAt: number;
    updatedAt: number;
}

export interface FlightTypesResponse {
    items: FlightTypeItem[];
    nextToken: string | null;
}

export interface FlightTypeOption {
    id: string;
    label: string;      // Original label to show in UI
    key: TripType;      // Normalized key to use in code
}

export interface CountryItem {
    id: string;
    city: string;        // e.g., "Dubai"
    cityCode: string;    // e.g., "DXB"
    country: string;     // e.g., "UAE"
    countryCode: string; // e.g., "UE"
    status: number;
    createdAt: number;
    updatedAt: number;
}

export interface CountriesResponse {
    items: CountryItem[];
    nextToken: string | null;
}

export interface CountryOption {
    id: string;
    label: string;      // e.g. "Dubai (DXB), UAE"
    code: string;       // "DXB"
    city: string;       // "Dubai"
    country: string;    // "UAE"
}

export interface PassengerItem {
    id: string;
    category: "Adults" | "Children" | "Infants" | "Seniors";
    status: number;
    createdAt: number;
    updatedAt: number;
}

export interface PassengersResponse {
    items: PassengerItem[];
    nextToken: string | null;
}


export interface PassengerCategoryOption {
    key: PaxKey;                 // "adults" | "kids" | "infants" | "seniors"
    title: string;               // e.g. "Adults"
}

export type PassengerSchema = PassengerCategoryOption[];

export interface CabinClassItem {
    id: string;
    category: string;   // e.g., "Economy", "Business Class"
    status: number;
    createdAt: number;
    updatedAt: number;
}

export interface CabinClassesResponse {
    items: CabinClassItem[];
    nextToken: string | null;
}

export interface CabinClassOption {
    id: string;    // from API
    label: string; // category text to show
}