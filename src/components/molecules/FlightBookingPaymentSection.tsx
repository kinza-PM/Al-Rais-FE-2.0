import cabinIcon from "../../assets/svgs/cabin.svg";
import baggageIcon from "../../assets/svgs/baggage.svg";
// import entertainmentIcon from "../../assets/svgs/entertainment.svg";
// import mealIcon from "../../assets/svgs/meals.svg";
// import portIcon from "../../assets/svgs/ports.svg";
// import wifiIcon from "../../assets/svgs/wifi.svg";
import durationIcon from "../../assets/svgs/duration.svg";
import refundableIcon from "../../assets/svgs/redundable.svg";
import SEAT_ICON from "../../assets/svgs/seat.svg";
import PLANE_ICON from "../../assets/svgs/plane.svg";
import applePay from "../../assets/images/ApplePay (1).png";
import googlePay from "../../assets/images/GooglePay.png";
import shareIcon from "../../assets/svgs/share.svg";
import secureLockIcon from "../../assets/svgs/secure-lock.svg";
import visaIcon from "../../assets/svgs/visa.svg";
import masterCardIcon from "../../assets/svgs/mastercard.svg";
// import arrownDownwardIcon from "../../assets/svgs/arrow-downwards.svg";
import EmirateLogo from "../../assets/images/emirates.png";
// import FlagUsa from "../../assets/images/Flag-usa.png";
// import FlagUae from "../../assets/svgs/Flag-uae.svg";
import Tabby from "../../assets/images/tabbycard.png";
import Tamara from "../../assets/images/tamara1.png";
import { useEffect, useMemo, useRef, useState } from "react";
import FLightPriceBreakdown from "../atoms/FlightPriceBreakdown";
import CardCollapseToggle from "../common/CardCollapseToggle";
import Button from "../atoms/Button";
import FlightSummaryCard from "../atoms/FlightSummaryCard";
import TailwindCustomInput from "../common/TailwindCustomInput";
import {
  buildFlightSegmentFromTrip,
  formatMoney,
  getPriceCabinClassForFlightSummary,
  warningToast,
} from "../../utils/helpers";
import {
  useFlightReservationBooking,
  useRetrieveFlightBooking,
} from "../../hooks/useFlightBooking";
import toast from "react-hot-toast";
import { extractErrorFromAxiosApiError } from "../../utils/apiErrorHanlder";
import {
  openBlankPopupAndCheckWebisteAllowPopup,
  // validateReservationFlightBookingData,
  validateReservationFlightBookingDataFields,
  waitFor3DSecurePaymentPopupReturnResponse,
  type FlightFinalReservedBooking,
} from "../../utils/flightBookingHelper";
import { usePayfortPayment } from "../../hooks/usePayment";
import { usePayFortTokenization } from "../../hooks/usePayFortTokenization";
import CardOverlaySearchableDropdown from "../common/CardOverlaySearchableDropdown";
import type { CountryOption } from "../../features/flights/types";
import Loader from "../atoms/Loader";
import { useCitiesOptions } from "../../hooks/masterListings/useQueryListing";

type PaymentMethod = "card" | "apple" | "google";

type FlightBookingPaymentSectionProps = {
  trip: any;
  // cities: Array<{ id: string; code: string; label: string; city: string }>;
  countries: CountryOption[];
  reservation?: any;
  onReservationChange: (
    eOrPath:
      | React.ChangeEvent<
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >
      | string,
    maybeValue?: any,
  ) => void;
  onNext?: () => void;
  onFinalReservationFlightBookingSuccess?: (
    data: FlightFinalReservedBooking,
  ) => void;
};

// function ChevronDown() {
//   return (
//     <img
//       alt="arrow-icon"
//       src={arrownDownwardIcon}
//       className="pointer-events-none absolute right-3 top-4"
//     />
//   );
// }

export default function FlightBookingPaymentSection({
  trip,
  // cities,
  countries = [],
  reservation,
  onReservationChange,
  onNext,
  onFinalReservationFlightBookingSuccess,
}: FlightBookingPaymentSectionProps) {
  const [payMethod, setPayMethod] = useState<PaymentMethod>("card");
  const [openAddress, setOpenAddress] = useState(true);
  const [openPrice, setOpenPrice] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  //retrieve flight booking
  const [isPolling, setIsPolling] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [cardDetails, setCardDetails] = useState({
    number: "",
    expiryDisplay: "",
    expiry: "",
    cvv: "",
    holderName: "",
  });
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});
  const [hasAttemptedValidation, setHasAttemptedValidation] = useState(false);

  const { mutateAsync, isPending } = useFlightReservationBooking();
  const {
    mutateAsync: retrieveFlightBookingMutateAsync,
    isPending: retrieveFlightBookingPending,
  } = useRetrieveFlightBooking();
  const { mutateAsync: paymentMutateAsync, isPending: paymentPending } =
    usePayfortPayment();

  const { initiateTokenization, isLoading: isTokenizing } =
    usePayFortTokenization();

  const assets = {
    EmirateLogo,
    cabinIcon,
    baggageIcon,
    mealIcon: refundableIcon,
    wifiIcon: durationIcon,
    portIcon: SEAT_ICON,
    entertainmentIcon: PLANE_ICON,
  };
  const segments = buildFlightSegmentFromTrip(trip, assets);
  const address = reservation?.paymentDetails?.address ?? {};

  const firstPrice = getPriceCabinClassForFlightSummary(trip);

  const fare = trip?.raw?.fare ?? trip?.raw?.financials?.fare ?? null;
  const currency = fare?.currencyCode ?? fare?.currency ?? "USD";
  const total = fare?.totalFare ?? fare?.total ?? null;

  const priceFareFamily = {
    label: "Fare family",
    value: firstPrice?.label ?? firstPrice?._priceClasses?.[0] ?? "Fare family",
  };

  const selectedCountry = useMemo(
    () =>
      countries.find(
        (c) => c.iso3 === reservation?.paymentDetails?.address?.countryCode,
      ),
    [countries, reservation?.paymentDetails?.address?.countryCode],
  );

  const { data: citiesData, isLoading: isCitiesLoading } = useCitiesOptions(
    selectedCountry?.label || "",
    !!selectedCountry?.label,
  );

  const handleCardFieldChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;

    if (name === "number") {
      const digits = value.replace(/\D/g, "").slice(0, 16);
      const formatted = digits.replace(/(.{4})/g, "$1 ").trim();

      setCardDetails((prev) => ({
        ...prev,
        number: formatted,
      }));
      clearFieldError("card.number");
      return;
    }
    if (name === "expiry") {
      const digits = value.replace(/\D/g, "").slice(0, 4);
      const mm = digits.slice(0, 2);
      const yy = digits.slice(2, 4);

      let display = mm;
      if (yy.length) display = `${mm}/${yy}`;

      const stored = yy.length === 2 && mm.length === 2 ? `${yy}${mm}` : "";

      setCardDetails((prev) => ({
        ...prev,
        expiryDisplay: display,
        expiry: stored,
      }));
      clearFieldError("card.expiry");
      return;
    }

    if (name === "cvv") {
      const digits = value.replace(/\D/g, "").slice(0, 4);
      setCardDetails((prev) => ({ ...prev, cvv: digits }));
      clearFieldError("card.cvv");
      return;
    }

    if (name === "holderName") {
      setCardDetails((prev) => ({ ...prev, [name]: value }));
      clearFieldError("card.holderName");
      return;
    }

    setCardDetails((prev) => ({ ...prev, [name]: value }));
  };

  // Helper to clear error for a specific field
  const clearFieldError = (fieldPath: string) => {
    if (hasAttemptedValidation && validationErrors[fieldPath]) {
      setValidationErrors((prev) => {
        const updated = { ...prev };
        delete updated[fieldPath];
        return updated;
      });
    }
  };

  const generatePayfortPaymentTokenization = async () => {
    //  const { valid, error } = validateReservationFlightBookingData(
    //   reservation,
    //   cardDetails,
    // );
    // if (!valid) {
    //   toast.error(error || "Validation failed.");
    //   return;
    // }
    setHasAttemptedValidation(true);
    const fieldErrors = validateReservationFlightBookingDataFields(
      reservation,
      cardDetails,
    );
    setValidationErrors(fieldErrors);

    if (Object.keys(fieldErrors).length > 0) {
      // Still check overall validation for backward compatibility
      // const { valid } = validateReservationFlightBookingData(
      //   reservation,
      //   cardDetails,
      // );
      // if (!valid) {
      //   return;
      // }
      return;
    }
    // console.log("cardDetails", cardDetails);
    // console.log("reservation", reservation);
    setIsProcessing(true);
    try {
      const cleanCardNumber = (cardDetails.number || "").replace(/\s+/g, "");
      const expiry = cardDetails.expiry || ""; // 'YYMM'
      const cvv = cardDetails.cvv || "";
      const cardHolder =
        cardDetails.holderName || reservation?.customerInfo?.name || "Customer";

      const payload = await initiateTokenization({
        cardNumber: cleanCardNumber,
        expiry,
        cvv,
        cardHolder,
      });
      if (payload?.response_message === "Success") {
        onReservationChange?.("paymentDetails.cardInfo", payload?.token_name);
        await handlePayfortFlightPayment(payload?.token_name);
        return;
      }
      toast.error(payload?.response_message || "Tokenization failed.");
    } catch (err: any) {
      console.error("Tokenize error (component):", err);
      toast.error(err?.message || "Tokenization failed.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePayfortFlightPayment = async (tokenization: string) => {
    let popup: Window | null = null;
    setIsProcessing(true);
    try {
      //check popup allows or not before actual payment
      try {
        popup = openBlankPopupAndCheckWebisteAllowPopup(
          "payfort3dsWindow",
          600,
          800,
        );
      } catch (err: any) {
        toast.error(err?.message || "Please allow popups for this site.");
        return;
      }

      const threeDsMessagePromise =
        waitFor3DSecurePaymentPopupReturnResponse(120000);

      const paymentPayload = {
        token_name: tokenization ?? null,
        amount: reservation?.paymentDetails?.transactionAmount,
        email: reservation?.customerInfo?.emailAddress,
      };
      const response = await paymentMutateAsync(paymentPayload);

      const threeDsUrl = response?.["3ds_url"];
      if (threeDsUrl) {
        try {
          popup!.location.href = threeDsUrl;
        } catch (err) {
          try {
            popup!.location.assign(threeDsUrl);
          } catch (_) {
            /* ignore */
          }
        }

        const threeDsResult = await threeDsMessagePromise;

        const respMsg = String(
          threeDsResult?.response_message || "",
        ).toLowerCase();
        const acqMsg = String(
          threeDsResult?.acquirer_response_message || "",
        ).toLowerCase();

        if (respMsg.includes("success") && acqMsg.includes("success")) {
          toast.success("Payment successful!");
          await handleReservationFlightBooking(tokenization);
        } else {
          toast.error(
            threeDsResult?.response_message || "3DS authentication failed",
          );
        }
      } else {
        if (
          String(response?.message || "")
            .toLowerCase()
            .includes("success")
        ) {
          toast.success("Payment successful!");
          await handleReservationFlightBooking(tokenization);
        } else {
          toast.error(response?.response_message || "Payment failed");
        }
      }
      return;
    } catch (error) {
      const err = extractErrorFromAxiosApiError(error);
      toast.error(err);
    } finally {
      // always cleanup/close popup if still open
      try {
        if (popup && !popup.closed) popup.close();
      } catch (_) { }
      setIsProcessing(false);
    }
  };

  const handleReservationFlightBooking = async (tokenization: string) => {
    try {
      setTimeout(() => {
        warningToast("Initializing reservation booking request...");
      }, 500);
      const reservationWithToken = {
        ...reservation,
        paymentDetails: {
          ...(reservation?.paymentDetails || {}),
          cardInfo: tokenization,
        },
      };
      const response = await mutateAsync(reservationWithToken);

      if (!response?.meta?.success) {
        toast.error("Booking failed");
        return;
      }

      const { statusMessage, actionType } = response.meta;
      const updated = response?.data?.[0];

      switch (statusMessage) {
        case "SUCCESS":
          handleBookingSuccess(updated, actionType);
          break;
        case "FETCH LATER":
          setIsPolling(true);
          timeoutRef.current = setTimeout(() => {
            retrieveFlightBooking(
              reservationWithToken.offerId,
              reservationWithToken.searchKey,
            );
          }, 110000);
          break;

        default:
          toast.error("Unknown response status");
      }
    } catch (error) {
      const err = extractErrorFromAxiosApiError(error);
      toast.error(err);
      setIsPolling(false);
    }
  };

  // Retrieve flight booking - separate function
  const retrieveFlightBooking = async (offerId: string, searchKey: string) => {
    try {
      const retrieveFlightResponse = await retrieveFlightBookingMutateAsync({
        offerId,
        searchKey,
      });
      if (
        retrieveFlightResponse?.meta?.success &&
        retrieveFlightResponse?.meta?.statusMessage === "SUCCESS"
      ) {
        handleBookingSuccess(
          retrieveFlightResponse?.data?.[0],
          "Flight booked successfully",
        );
      } else {
        toast.error("Failed to retrieve flight booking");
      }
    } catch (error) {
      const err = extractErrorFromAxiosApiError(error);
      toast.error(err);
    } finally {
      setIsPolling(false);
      timeoutRef.current = null;
    }
  };

  // Success handler - repeated logic ko extract kiya
  const handleBookingSuccess = (updated: any, successMessage?: string) => {
    if (successMessage) {
      toast.success(successMessage);
    }

    if (
      updated &&
      typeof onFinalReservationFlightBookingSuccess === "function"
    ) {
      onFinalReservationFlightBookingSuccess(updated);
    }

    if (typeof onNext === "function") {
      onNext();
    }
  };

  useEffect(() => {
    if (total === null) return;
    const existing = reservation?.paymentDetails?.transactionAmount;
    if (existing !== total) {
      onReservationChange?.("paymentDetails.transactionAmount", total);
    }
  }, [
    total,
    reservation?.paymentDetails?.transactionAmount,
    onReservationChange,
  ]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, []);

  const isPayButtonLoading =
    isProcessing ||
    isTokenizing ||
    paymentPending ||
    isPending ||
    retrieveFlightBookingPending ||
    isPolling;

  const getPayButtonText = () => {
    if (isTokenizing) return "Preparing secure payment…";
    if (paymentPending) return "Processing your payment…";
    if (isPending) return "Confirming your flight booking…";
    if (retrieveFlightBookingPending || isPolling)
      return "Retrieving booking details…";
    return "Pay";
  };

  return (
    <section className="mt-10 flex items-center justify-center px-4">
      <Loader
        show={
          isCitiesLoading ||
          isPending ||
          retrieveFlightBookingPending ||
          isPolling
        }
        label={
          isCitiesLoading
            ? "Loading cities..."
            : isPending
              ? "Confirming your flight booking…"
              : retrieveFlightBookingPending || isPolling
                ? "Retrieving booking details…"
                : "Please wait while we are fetching records..."
        }
      />
      <div className="w-full max-w-[550px]">
        <FlightSummaryCard
          title="Flight details"
          segments={segments}
          fare={priceFareFamily}
        />

        <div className="mt-6">
          <div className="flex items-center justify-center gap-[0.45rem]">
            {/* Pay with Card */}
            <Button
              type="button"
              onClick={() => setPayMethod("card")}
              aria-pressed={payMethod === "card"}
              className={[
                "flex items-center justify-center transition-all duration-200 flex-shrink-0",
                "w-[102px] h-[65px] rounded-[8px] border-[1.5px]",
                payMethod === "card"
                  ? "bg-[rgba(167,192,236,0.3)] text-[#2351A3] border-[#2351A3]"
                  : "bg-white text-[#0A0C0F] border-[#C2CAD6] hover:border-[#5383DA] hover:shadow-sm",
              ].join(" ")}
              overrideClasses
            >
              <span className="text-[12px] font-semibold text-center px-2">
                Pay with card
              </span>
            </Button>

            {/* Apple Pay */}
            <Button
              type="button"
              onClick={() => setPayMethod("apple")}
              aria-pressed={payMethod === "apple"}
              className={[
                "flex items-center justify-center transition-all duration-200 flex-shrink-0",
                "w-[102px] h-[65px] rounded-[8px] border-[1.5px] p-8",
                payMethod === "apple"
                  ? "bg-[rgba(167,192,236,0.3)] border-[#2351A3]"
                  : "bg-white border-[#C2CAD6] hover:border-[#5383DA] hover:shadow-sm",
              ].join(" ")}
              overrideClasses
            >
              <img
                src={applePay}
                alt="Apple Pay"
                className="h-auto w-full object-contain"
              />
            </Button>

            {/* Google Pay */}
            <Button
              type="button"
              onClick={() => setPayMethod("google")}
              aria-pressed={payMethod === "google"}
              className={[
                "flex items-center justify-center transition-all duration-200 flex-shrink-0",
                "w-[103px] h-[65px] rounded-[6px] border-[1.5px] p-8",
                payMethod === "google"
                  ? "bg-[rgba(167,192,236,0.3)] border-[#2351A3]"
                  : "bg-white border-[#C2CAD6] hover:border-[#5383DA] hover:shadow-sm",
              ].join(" ")}
              overrideClasses
            >
              <img
                src={googlePay}
                alt="Google Pay"
                className="h-auto w-full object-contain"
              />
            </Button>

            {/* Tabby */}
            <Button
              type="button"
              style={{ width: "103px", height: "65px" }}
              className="flex flex-col items-center justify-center gap-2 transition-all duration-200 flex-shrink-0 rounded-[6px] border-[1.5px] border-[#C2CAD6] bg-white hover:border-[#5383DA] hover:shadow-sm p-3 focus:outline-none"
              overrideClasses
            >
              <img
                src={Tabby}
                alt="Tabby"
                style={{ width: "40px", height: "16px" }}
                className="object-contain"
              />
              <span className="text-[9px] text-[#64748B] text-center">
                Buy now pay later
              </span>
            </Button>

            {/* Tamara */}
            <Button
              type="button"
              style={{ width: "103px", height: "65px" }}
              className="flex flex-col items-center justify-center gap-2 transition-all duration-200 flex-shrink-0 rounded-[6px] border-[1.5px] border-[#C2CAD6] bg-white hover:border-[#5383DA] hover:shadow-sm p-3 focus:outline-none"
              overrideClasses
            >
              <img
                src={Tamara}
                alt="Tamara"
                style={{ width: "40px", height: "16px" }}
                className="object-contain"
              />
              <span className="text-[9px] text-[#64748B] text-center">
                Buy now pay later
              </span>
            </Button>
          </div>
        </div>

        {payMethod === "card" && (
          <div className="mt-6">
            <div className="rounded-xl border border-[#E4E4E7] bg-white">
              <div className="px-3 py-3">
                <div>
                  <h3 className="text-[15px] font-medium text-[#0A0C0F]">
                    Payment details
                  </h3>
                  <div className="mt-2 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[13px] text-[#3D495C]">
                      <img
                        alt="lock-icon"
                        src={secureLockIcon}
                        className="h-3.5 w-3.5"
                      />
                      <span>Secure payment link</span>
                    </div>
                    <img alt="share-icon" src={shareIcon} className="h-3 w-3" />
                  </div>
                </div>
                <div className="mt-5 space-y-4">
                  <div
                    className={`relative w-full ${hasAttemptedValidation && validationErrors["customerInfo.emailAddress"] ? "pb-4" : ""}`}
                  >
                    <TailwindCustomInput
                      type="email"
                      placeholder="Enter an email"
                      className={`h-12 w-full rounded-2xl border ${hasAttemptedValidation && validationErrors["customerInfo.emailAddress"] ? "border-[#E65959]" : "border-[#C2CAD6]"} px-4 text-[14px] text-[#3D495C] placeholder:text-[#C2CAD6] focus:outline-none`}
                      label="Email"
                      name="customerInfo.emailAddress"
                      value={reservation?.customerInfo?.emailAddress ?? ""}
                      onChange={(e) => {
                        onReservationChange(e);
                        clearFieldError("customerInfo.emailAddress");
                      }}
                      error={
                        hasAttemptedValidation
                          ? validationErrors["customerInfo.emailAddress"]
                          : null
                      }
                    />
                  </div>

                  <div
                    className={`relative w-full ${hasAttemptedValidation && validationErrors["card.number"] ? "pb-4" : ""}`}
                  >
                    <label className="mb-1 block text-[12px] text-[#3D495C]">
                      Card number
                    </label>
                    <div className="relative">
                      <TailwindCustomInput
                        type="text"
                        placeholder="0000 0000 0000 0000"
                        className={`h-12 w-full rounded-2xl border ${hasAttemptedValidation && validationErrors["card.number"] ? "border-[#E65959]" : "border-[#C2CAD6]"} px-4 pr-20 text-[14px] ...`}
                        name="number"
                        value={cardDetails.number}
                        onChange={handleCardFieldChange}
                        error={
                          hasAttemptedValidation
                            ? validationErrors["card.number"]
                            : null
                        }
                      />
                      <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center gap-3">
                        <img
                          alt="visa-icon"
                          src={visaIcon}
                          className="w-4.5 h-4.5"
                        />
                        <img
                          alt="mastercard-icon"
                          src={masterCardIcon}
                          className="w-4.5 h-4.5"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-2 gap-3">
                    <div
                      className={`relative w-full ${hasAttemptedValidation && validationErrors["card.expiry"] ? "pb-4" : ""}`}
                    >
                      <TailwindCustomInput
                        type="text"
                        placeholder="MM/YY"
                        className={`h-12 w-full rounded-2xl border ${hasAttemptedValidation && validationErrors["card.expiry"] ? "border-[#E65959]" : "border-[#C2CAD6]"} px-4 text-[14px] ...`}
                        name="expiry"
                        value={cardDetails.expiryDisplay}
                        onChange={handleCardFieldChange}
                        error={
                          hasAttemptedValidation
                            ? validationErrors["card.expiry"]
                            : null
                        }
                      />
                    </div>
                    <div
                      className={`relative w-full ${hasAttemptedValidation && validationErrors["card.cvv"] ? "pb-4" : ""}`}
                    >
                      <TailwindCustomInput
                        type="text"
                        placeholder="000"
                        className={`h-12 w-full rounded-2xl border ${hasAttemptedValidation && validationErrors["card.cvv"] ? "border-[#E65959]" : "border-[#C2CAD6]"} px-4 text-[14px] ...`}
                        name="cvv"
                        value={cardDetails.cvv}
                        onChange={handleCardFieldChange}
                        error={
                          hasAttemptedValidation
                            ? validationErrors["card.cvv"]
                            : null
                        }
                      />
                    </div>
                  </div>

                  <div
                    className={`relative w-full ${hasAttemptedValidation && validationErrors["card.holderName"] ? "pb-4" : ""}`}
                  >
                    <TailwindCustomInput
                      type="text"
                      placeholder="Enter cardholder name"
                      className={`h-12 w-full rounded-2xl border ${hasAttemptedValidation && validationErrors["card.holderName"] ? "border-[#E65959]" : "border-[#C2CAD6]"} px-4 text-[14px] ...`}
                      label="Cardholder name"
                      name="holderName"
                      value={cardDetails.holderName}
                      onChange={handleCardFieldChange}
                      error={
                        hasAttemptedValidation
                          ? validationErrors["card.holderName"]
                          : null
                      }
                    />
                  </div>

                  <div className="rounded-xl border border-[#C2CAD6] overflow-hidden">
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => setOpenAddress((v) => !v)}
                      onKeyDown={(e) =>
                        (e.key === "Enter" || e.key === " ") &&
                        setOpenAddress((v) => !v)
                      }
                      className="flex h-12 w-full items-center justify-between bg-white px-3"
                    >
                      <span className="flex items-center gap-3 text-[15px] font-medium text-[#0A0C0F]">
                        {/* <img
                          src={FlagUae}
                          alt="usa-flag"
                          className="h-6 w-6 rounded-full"
                        /> */}
                        {/* <span>United Arab Emirates</span> */}
                        {selectedCountry?.label || "Select a country"}
                      </span>

                      <CardCollapseToggle
                        open={openAddress}
                        onClick={() => { }}
                        className="pointer-events-none"
                      />
                    </div>

                    {openAddress && (
                      <div className="border-t border-[#E4E4E7]" />
                    )}

                    <div
                      className={[
                        "grid transition-[grid-template-rows,opacity] duration-200 ease-out",
                        openAddress
                          ? "grid-rows-[1fr] opacity-100"
                          : "grid-rows-[0fr] opacity-0",
                      ].join(" ")}
                    >
                      <div className="overflow-hidden">
                        <div className="divide-y divide-[#E4E4E7]">
                          <div
                            className={`relative px-3 ${hasAttemptedValidation && validationErrors["address.street.0"] ? "border border-[#E65959]" : ""}`}
                          >
                            <TailwindCustomInput
                              type="text"
                              placeholder="Address line 1"
                              className={`h-11 w-full bg-transparent px-0 text-sm text-[#0A0C0F] placeholder:text-[#C2CAD6] focus:outline-none border-[#C2CAD6]`}
                              name="paymentDetails.address.street.0"
                              value={
                                Array.isArray(address.street)
                                  ? (address.street[0] ?? "")
                                  : ""
                              }
                              onChange={(e) => {
                                onReservationChange(e);
                                clearFieldError("address.street.0");
                              }}
                            />
                          </div>

                          <div className="relative">
                            <CardOverlaySearchableDropdown
                              options={
                                countries?.map((c) => ({
                                  id: c.iso2,
                                  value: c.iso3,
                                  label: c.label,
                                })) || []
                              }
                              value={address.countryCode ?? ""}
                              onChange={(val) => {
                                onReservationChange(
                                  "paymentDetails.address.countryCode",
                                  val,
                                );
                                clearFieldError("address.countryCode");
                              }}
                              error={
                                hasAttemptedValidation
                                  ? validationErrors["address.countryCode"]
                                  : null
                              }
                              placeholder="Select a country"
                              className={`h-11 w-full appearance-none bg-transparent pr-6 text-sm text-[#0A0C0F] focus:outline-none px-3`}
                            />
                          </div>

                          <div className="grid grid-cols-2">
                            <div className="relative">
                              <CardOverlaySearchableDropdown
                                options={citiesData.map((c, index) => ({
                                  id: `${index}-${c.value}`,
                                  value: c.value,
                                  label: c.label,
                                }))}
                                value={address.cityName ?? ""}
                                onChange={(val) => {
                                  onReservationChange(
                                    "paymentDetails.address.cityName",
                                    val,
                                  );
                                  clearFieldError("address.cityName");
                                }}
                                placeholder="Select a city"
                                error={
                                  hasAttemptedValidation
                                    ? validationErrors["address.cityName"]
                                    : null
                                }
                                className={`h-11 w-full appearance-none bg-transparent px-3 pr-8 text-sm text-[#0A0C0F] focus:outline-none`}
                              />
                            </div>
                            <div
                              className={`relative px-3 ${hasAttemptedValidation && validationErrors["address.postalCode"] ? "border border-[#E65959]" : "border-l border-[#E4E4E7]"}`}
                            >
                              <TailwindCustomInput
                                type="text"
                                placeholder="Zip code"
                                className={`h-11 w-full bg-transparent px-0 text-sm text-[#0A0C0F] placeholder:text-[#C2CAD6] focus:outline-none`}
                                name="paymentDetails.address.postalCode"
                                value={address.postalCode ?? ""}
                                onChange={(e) => {
                                  onReservationChange(e);
                                  clearFieldError("address.postalCode");
                                }}
                                error={
                                  hasAttemptedValidation
                                    ? validationErrors["address.postalCode"]
                                    : null
                                }
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 space-y-1 [font-variant-numeric:tabular-nums]">
                    {/* <div className="flex items-center justify-between text-[15px]">
                                            <span className="font-medium text-[#3D495C]">Subtotal</span>
                                            <span className="font-semibold text-[#0A0C0F] text-right">$852.45</span>
                                        </div> */}

                    <div className="flex items-center justify-between">
                      <span className="text-[15px] font-semibold text-[#3D495C]">
                        Total
                      </span>
                      <span className="text-[22px] font-bold text-[#0A0C0F] text-right">
                        {" "}
                        {total != null ? formatMoney(total, currency) : "—"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <FLightPriceBreakdown
          open={openPrice}
          onToggleOpen={() => setOpenPrice((v) => !v)}
          trip={trip.raw}
        />

        <div className="mt-16 px-5 flex flex-col items-center">
          <Button
            type="button"
            style={{
              background:
                "linear-gradient(90.59deg, #5383DA 0%, #2351A3 50%, #081326 100%)",
            }}
            className={`
    w-[252px]
    h-[47px]
    rounded-[100px]
    py-[14px]
    px-[40px]
    text-[#F2F2F3]
    text-[16px]
    font-semibold
    flex items-center justify-center gap-3
    transition-all duration-300
    ${isPayButtonLoading ? "cursor-not-allowed opacity-90" : ""}
  `}
            overrideClasses
            disabled={isPayButtonLoading}
            onClick={generatePayfortPaymentTokenization}
          >
            {isPayButtonLoading && (
              <svg
                className="h-5 w-5 animate-spin"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="white"
                  strokeWidth="3"
                />
                <path
                  className="opacity-90"
                  fill="white"
                  d="M22 12a10 10 0 00-10-10v3a7 7 0 017 7h3z"
                />
              </svg>
            )}

            <span>{getPayButtonText()}</span>
          </Button>

          <div className="mt-6 text-center text-[12px] text-[#3D495C]">
            Secure payments by Al Rais • Terms • Privacy
          </div>
        </div>
      </div>
    </section>
  );
}
