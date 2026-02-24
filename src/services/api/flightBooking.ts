// services/api/flightSearch.ts
import { api, toApiError } from "../axios";

export type FlightInitialBooking = {
  offerId: string;
  journey: Array<any>;
  passengers: Array<any>;
  reservationType: string;
  paymentDetails: {
    paymentMode: string;
  };
};

export type FlightAncillaryBooking = {
  data: {
    offerId: string;
    selectedAncillaries: Array<{
      ancillaryOfferId: string;
      passengerKey: string;
      segmentKey: string;
    }>;
  };
};

export type FlightAncillarySearch = {
  offerId: string;
  seatMapRequested: boolean;
  otherAncillaryRequested: boolean;
  formOfPayment: string;
  travelType: string;
};

export type FlightFareRuleSearch = {
  offerId: string;
  searchKey: string;
};

export type FlightIngestView = {
  offerId: string;
};

export type UserProfileMyBooking = {
  status: string;
};

export type RetrieveFlightBooking = {
  offerId: string;
  searchKey: string;
};

export type FlightReservationBooking = {
  bookingReferenceId: string;
  offerId: string;
  customerInfo: {
    emailAddress: string;
  };
  passengers: Array<any>;
  paymentDetails: {
    paymentMode: string;
    transactionAmount: number;
    cardInfo: string;
    address: {
      label: string;
      street: Array<string>;
      postalCode: string;
      cityName: string;
      countryCode: string;
    };
  };
};

export type UploadImagePreSignedUrlRequest = {
  offerId: string;
  contentType: string;
};

export type UploadTicketRequest = {
  ticketImage: string;
  offerId: string;
};

export async function postInitialFlightProvBooking<TResp = any>(
  body: FlightInitialBooking,
): Promise<TResp> {
  const source = "postInitialFlightProvBooking";
  try {
    return await api.post<TResp>("/flightProvBooking", body);
  } catch (err) {
    throw toApiError(source, err);
  }
}

export async function postAncillaryBooking<TResp = any>(
  body: FlightAncillaryBooking,
): Promise<TResp> {
  const source = "postAncillaryBooking";
  try {
    return await api.post<TResp>("/bookAncillary", body);
  } catch (err) {
    throw toApiError(source, err);
  }
}

export async function postFlightFareRuleSearch<TResp = any>(
  body: FlightFareRuleSearch,
): Promise<TResp> {
  const source = "postFlightFareRuleSearch";
  try {
    return await api.post<TResp>("/fareRuleSearch", body);
  } catch (err) {
    throw toApiError(source, err);
  }
}

export async function postFlightIngestView<TResp = any>(
  body: FlightIngestView,
): Promise<TResp> {
  const source = "postFlightIngestView";
  try {
    return await api.post<TResp>("/ingestFlightsView", body);
  } catch (err) {
    throw toApiError(source, err);
  }
}

export async function postFlightReservationBooking<TResp = any>(
  body: FlightReservationBooking,
): Promise<TResp> {
  const source = "postFlightReservationBooking";
  try {
    return await api.post<TResp>("/reservationFlightBooking", body);
  } catch (err) {
    throw toApiError(source, err);
  }
}

export async function postRetrieveFlightBooking<TResp = any>(
  body: RetrieveFlightBooking,
): Promise<TResp> {
  const source = "postRetrieveFlightBooking";
  try {
    return await api.post<TResp>("/retrieveFlightBooking", body);
  } catch (err) {
    throw toApiError(source, err);
  }
}

export async function postFlightAncillarySearch<TResp = any>(
  body: FlightAncillarySearch,
): Promise<TResp> {
  const source = "postFlightAncillarySearch";
  try {
    return await api.post<TResp>("/ancillarySearch", body);
  } catch (err) {
    throw toApiError(source, err);
  }
}

export async function postMyBooking<TResp = any>(
  body: UserProfileMyBooking,
): Promise<TResp> {
  const source = "posMyBooking";
  try {
    return await api.post<TResp>("/myBooking", body);
  } catch (err) {
    throw toApiError(source, err);
  }
}

export async function postUploadImagePreSignedUrl<TResp = any>(
  body: UploadImagePreSignedUrlRequest,
): Promise<TResp> {
  const source = "postUploadImagePreSignedUrl";
  try {
    return await api.post<TResp>("/uploadImagePreSignedUrl", body);
  } catch (err) {
    throw toApiError(source, err);
  }
}

export async function postUploadTicket<TResp = any>(
  body: UploadTicketRequest,
): Promise<TResp> {
  const source = "postUploadTicket";
  try {
    return await api.post<TResp>("/uploadTicket", body);
  } catch (err) {
    throw toApiError(source, err);
  }
}
