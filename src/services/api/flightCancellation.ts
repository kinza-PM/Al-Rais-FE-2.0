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
  cancelreason?: string;
  /** Offer id from booking (passed through for downstream supplier routing). */
  offerId?: string;
  /** Master listing id for the selected cancellation reason (`flight-cancel-reason`). */
  cancelId?: string;
};

/**
 * Reads charge fields from the charges API body (`response.data`).
 * Backend shape may change — tweak here only; responses stay `any` at the boundary.
 */
export function parseFlightCancellationChargesResponse(
  response: any,
  currencyFallback: string,
) {
  let raw = response?.data ?? response;
  if (
    raw &&
    typeof raw === "object" &&
    !Array.isArray((raw as any).cancellationCharge) &&
    (raw as any).data &&
    typeof (raw as any).data === "object"
  ) {
    raw = (raw as any).data;
  }
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

/** True when we should trust the charges API numerically / structurally vs falling back to fare rules. */
export function isApiCancellationChargesPayloadUsable(
  apiResponse: any,
  parsed: ReturnType<typeof parseFlightCancellationChargesResponse>,
): boolean {
  let inner = apiResponse?.data ?? apiResponse;
  if (
    inner &&
    typeof inner === "object" &&
    !Array.isArray((inner as any).cancellationCharge) &&
    (inner as any).data &&
    typeof (inner as any).data === "object"
  ) {
    inner = (inner as any).data;
  }
  if (
    Array.isArray(inner?.cancellationCharge) &&
    inner.cancellationCharge.length > 0
  ) {
    return true;
  }
  if (Array.isArray(inner) && inner.length > 0) return true;
  return (
    parsed.totalCancellationCharges > 0 ||
    parsed.supplierCancellationCharge > 0 ||
    parsed.adminCancellationCharge > 0
  );
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
