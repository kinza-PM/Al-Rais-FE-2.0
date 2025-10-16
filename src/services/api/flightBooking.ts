// services/api/flightSearch.ts
import { api, toApiError } from "../axios";

export type FlightInitialBooking = {
    offerId: string;
    journey: Array<any>;
    passengers: Array<any>;
    reservationType: string;
    paymentDetails: {
        paymentMode: string;
    }
};

export type FlightFareRuleSearch = {
    offerId: string;
}

export async function postInitialFlightProvBooking<TResp = any>(
    body: FlightInitialBooking
): Promise<TResp> {
    const source = "postInitialFlightProvBooking";
    try {
        return await api.post<TResp>("/flightProvBooking", body);
    } catch (err) {
        throw toApiError(source, err);
    }
}

export async function postFlightFareRuleSearch<TResp = any>(
    body: FlightFareRuleSearch
): Promise<TResp> {
    const source = "postFlightFareRuleSearch";
    try {
        return await api.post<TResp>("/fareRuleSearch", body);
    } catch (err) {
        throw toApiError(source, err);
    }
}
