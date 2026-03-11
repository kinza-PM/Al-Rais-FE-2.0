    import { api, toApiError } from "../axios";

export type HotelCancellationChargesRequest = {
  command: "cancellationCharges";
  bookingReferenceId: string;
};

export type HotelCancellationChargesResponse = {
  meta?: {
    success?: boolean;
    statusCode?: number;
    statusMessage?: string;
    actionType?: string;
    conversationId?: string;
  };
  commonData?: {
    productCode?: string;
    culture?: string;
  };
  data?: Array<{
    bookingStatus?: string;
    bookingReferenceId?: string;
    command?: string;
    currency?: string;
    cancellationCharge?: Array<{
      supplierCancellationCharge?: number;
      adminCancellationCharge?: number;
      totalCancellationCharges?: number;
    }>;
  }>;
  version?: string;
};

export type HotelCancellationRequest = {
  command: "cancel";
  bookingReferenceId: string;
};

export type HotelCancellationResponse = {
  meta?: {
    success?: boolean;
    statusCode?: number;
    statusMessage?: string;
    actionType?: string;
    conversationId?: string;
  };
  data?: any;
};

export async function postHotelCancellationChargesData<
  TResp = HotelCancellationChargesResponse,
>(body: HotelCancellationChargesRequest): Promise<TResp> {
  const source = "postHotelCancellationChargesData";
  try {
    return await api.post<TResp>("/getHotelCancellationCharges", body);
  } catch (err) {
    throw toApiError(source, err);
  }
}

export async function postHotelCancellationData<
  TResp = HotelCancellationResponse,
>(body: HotelCancellationRequest): Promise<TResp> {
  const source = "postHotelCancellationData";

  try {
    return await api.post<TResp>("/hotelCancellation", body);
  } catch (err) {
    throw toApiError(source, err);
  }
}