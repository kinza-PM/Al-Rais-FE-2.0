// services/api/flightSearch.ts
import { api, toApiError } from "../axios";

export type FlightPayment = {
    token_name: string;
    amount: string;
    email: string;
};

export async function postPayfortPayment<TResp = any>(
    body: FlightPayment
): Promise<TResp> {
    const source = "postPayfortPayment";
    try {
        return await api.post<TResp>("/pay", body);
    } catch (err) {
        throw toApiError(source, err);
    }
}
