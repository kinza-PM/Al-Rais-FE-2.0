import { api, toApiError } from "../axios";

export type FlightCancellationChargesRequest = {
  bookingReferenceId: string;
  supplierLocator: string;
  issueDate: string;
};

export type FlightCancellationChargesResponse = {
  meta?: {
    success?: boolean;
    statusCode?: number;
    statusMessage?: string;
    actionType?: string;
    conversationId?: string;
  };
  data?: Array<{
    bookingReferenceId?: string;
    supplierLocator?: string;
    issueDate?: string;
    currency?: string;
    nonRefundableCarrierFees?: number;
    cancellationPenalty?: number;
    totalCancellationCharges?: number;
  }>;
};

export type FlightCancellationRequest = {
  bookingReferenceId: string;
  supplierLocator: string;
  issueDate: string;
  cancelReason?: string;
  refundPreference?: "original" | "voucher";
};

export type FlightCancellationResponse = {
  meta?: {
    success?: boolean;
    statusCode?: number;
    statusMessage?: string;
    actionType?: string;
    conversationId?: string;
  };
  data?: any;
};

export async function postFlightCancellationChargesData<
  TResp = FlightCancellationChargesResponse,
>(body: FlightCancellationChargesRequest): Promise<TResp> {
  const source = "postFlightCancellationChargesData";

  try {
    return await api.post<TResp>("/flightCancellationCharge", body);
  } catch (err) {
    throw toApiError(source, err);
  }
}

export async function postFlightCancellationData<
  TResp = FlightCancellationResponse,
>(body: FlightCancellationRequest): Promise<TResp> {
  const source = "postFlightCancellationData";

  try {
    return await api.post<TResp>("/flightCancellation", body);
  } catch (err) {
    throw toApiError(source, err);
  }
}