import { VITE_NOMINATIM_BASE_URL } from "../config/publicEnv";

export const getAirportCoords = async (airportCode: string) => {
    try {
        const query = `${airportCode} airport`;
        const response = await fetch(
            `${VITE_NOMINATIM_BASE_URL}/search?format=json&q=${encodeURIComponent(query)}&limit=1`,
            {
                headers: {
                    'User-Agent': 'FlightBookingApp/1.0' // Required by Nominatim
                }
            }
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