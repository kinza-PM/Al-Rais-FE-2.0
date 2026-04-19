import { api, toApiError } from "../axios";

export type FlightCancellationChargesRequest = {
  bookingReferenceId: string;
  supplierLocator: string;
  issueDate: string;
};

export type FlightCancellationPassengerPayload = {
  passengerKey: string;
  ptc: string;
  passengerInfo: {
    nameTitle?: string;
    givenName?: string;
    middleName?: string;
    surname?: string;
  };
};

export type FlightCancellationRequest = {
  bookingReferenceId: string;
  supplierLocator: string;
  issueDate: string;
  cancelAllPassengers: boolean;
  voidOnly: boolean;
  doSupplierRefund: boolean;
  flightSegments: unknown[];
  passengers?: FlightCancellationPassengerPayload[];
  cancelReason?: string;
};

/**
 * Reads charge fields from the charges API body (`response.data`).
 * Backend shape may change — tweak here only; responses stay `any` at the boundary.
 */
export function parseFlightCancellationChargesResponse(
  response: any,
  currencyFallback: string,
) {
  const raw = response?.data;
  if (raw == null) {
    return {
      currency: currencyFallback,
      supplierCancellationCharge: 0,
      adminCancellationCharge: 0,
      totalCancellationCharges: 0,
      isSupplierRefundApplicable: true,
    };
  }

  if (
    typeof raw === "object" &&
    !Array.isArray(raw) &&
    Array.isArray(raw.cancellationCharge)
  ) {
    const rows = raw.cancellationCharge;
    const first = rows[0] ?? {};
    const sup = Number(first.supplierCancellationCharge ?? 0) || 0;
    const adm = Number(first.adminCancellationCharge ?? 0) || 0;
    const statedTotal = Number(first.totalCancellationCharges ?? 0) || 0;
    const totalCancellationCharges =
      statedTotal > 0 ? statedTotal : sup + adm;
    const refRaw = raw.isSupplierRefundApplicable;
    const isSupplierRefundApplicable =
      refRaw === true ||
      refRaw === "true" ||
      String(refRaw ?? "").toLowerCase().trim() === "true";

    return {
      currency: String(raw.currency ?? "").trim() || currencyFallback,
      supplierCancellationCharge: sup,
      adminCancellationCharge: adm,
      totalCancellationCharges,
      isSupplierRefundApplicable,
    };
  }

  if (Array.isArray(raw) && raw.length > 0) {
    const firstItem = raw[0];
    const sup = Number(firstItem?.nonRefundableCarrierFees ?? 0) || 0;
    const adm = Number(firstItem?.cancellationPenalty ?? 0) || 0;
    const statedTotal = Number(firstItem?.totalCancellationCharges ?? 0) || 0;
    const totalCancellationCharges =
      statedTotal > 0 ? statedTotal : sup + adm;

    return {
      currency: String(firstItem?.currency ?? "").trim() || currencyFallback,
      supplierCancellationCharge: sup,
      adminCancellationCharge: adm,
      totalCancellationCharges,
      isSupplierRefundApplicable: true,
    };
  }

  return {
    currency: currencyFallback,
    supplierCancellationCharge: 0,
    adminCancellationCharge: 0,
    totalCancellationCharges: 0,
    isSupplierRefundApplicable: true,
  };
}

export async function postFlightCancellationChargesData(
  body: FlightCancellationChargesRequest,
): Promise<any> {
  const source = "postFlightCancellationChargesData";

  try {
    return await api.post<any>("/flightCancellationCharge", body);
  } catch (err) {
    throw toApiError(source, err);
  }
}

export async function postFlightCancellationData(
  body: FlightCancellationRequest,
): Promise<any> {
  const source = "postFlightCancellationData";

  try {
    return await api.post<any>("/flightCancel", body);
  } catch (err) {
    throw toApiError(source, err);
  }
}
