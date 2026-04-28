import { api, toApiError } from "../axios";

export type PassengerCacheRequest =
  | { type: "fetch" }
  | { type: "add"; passengers: Array<any> };

export async function postPassengerCache<TResp = any>(
  body: PassengerCacheRequest,
): Promise<TResp> {
  const source = "postPassengerCache";
  try {
    return await api.post<TResp>("/fetchAddPassengerCache", body as any);
  } catch (err) {
    throw toApiError(source, err);
  }
}

