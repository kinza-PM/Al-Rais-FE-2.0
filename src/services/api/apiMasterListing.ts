// services/api/apiMasterListing.ts
import { api, toApiError } from "../axios";

export async function getMasterListingData<TResp = any>(
    tableName: string,
    signal?: AbortSignal
): Promise<TResp> {
    const source = "getMasterListingData";
    try {
        
        return await api.get<TResp>("/getListingData", { tableName }, signal);
    } catch (err) {
        throw toApiError(source, err);
    }
}
