import { api, toApiError } from "../axios";

export async function getMasterListingData<TResp = any>(
  tableName: string,
  signal?: AbortSignal,
  nextToken?: string | null
): Promise<TResp> {
  const source = "getMasterListingData";
  try {
    // api.get already returns TResp (your wrapper returns res.data)
    return await api.get<TResp>(
      "/getListingData",
      {
        tableName,
        ...(nextToken ? { nextToken } : {}),
      },
      signal
    );
    // return await api.get<TResp>("/getListingData", { tableName }, signal);
  } catch (err) {
    throw toApiError(source, err);
  }
}
