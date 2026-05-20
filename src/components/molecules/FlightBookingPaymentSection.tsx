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
import {
  extractErrorFromAxiosApiError,
  extractMessageFromApiResponseBody,
} from "../../utils/apiErrorHanlder";
import {
  applyPassengersDefaultResidenceFromIssuing,
  // getAllowedCvvLengthsForCard,
  // getCardBrandFromNumber,
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
import LegalModal from "../common/LegalModal";
import FlightBookingReviewModal from "../common/FlightBookingReviewModal";
import { Checkbox } from "antd";

type PaymentMethod = "card" | "apple" | "google";

/** US states for billing "Select a state" when country is United States */
const US_STATE_NAMES = [
  "Alabama",
  "Alaska",
  "Arizona",
  "Arkansas",
  "California",
  "Colorado",
  "Connecticut",
  "Delaware",
  "District of Columbia",
  "Florida",
  "Georgia",
  "Hawaii",
  "Idaho",
  "Illinois",
  "Indiana",
  "Iowa",
  "Kansas",
  "Kentucky",
  "Louisiana",
  "Maine",
  "Maryland",
  "Massachusetts",
  "Michigan",
  "Minnesota",
  "Mississippi",
  "Missouri",
  "Montana",
  "Nebraska",
  "Nevada",
  "New Hampshire",
  "New Jersey",
  "New Mexico",
  "New York",
  "North Carolina",
  "North Dakota",
  "Ohio",
  "Oklahoma",
  "Oregon",
  "Pennsylvania",
  "Rhode Island",
  "South Carolina",
  "South Dakota",
  "Tennessee",
  "Texas",
  "Utah",
  "Vermont",
  "Virginia",
  "Washington",
  "West Virginia",
  "Wisconsin",
  "Wyoming",
] as const;

const US_STATE_SELECT_OPTIONS: Array<{
  id: string;
  value: string;
  label: string;
}> = US_STATE_NAMES.map((name) => ({
  id: name,
  value: name,
  label: name,
}));

const PAY_FIELD_LABEL =
  "mb-1.5 block text-[12px] font-medium leading-snug text-[#4B5563]";

function payInputClass(hasError: boolean): string {
  return [
    "h-11 w-full rounded-[10px] border bg-white px-3.5 text-[14px] text-[#111827] shadow-sm placeholder:text-[#9CA3AF] transition-colors",
    "hover:border-[#D1D5DB] focus:border-[#5383DA] focus:outline-none focus:ring-2 focus:ring-[#5383DA]/10",
    hasError
      ? "border-[#E65959] focus:border-[#E65959] focus:ring-red-500/10"
      : "border-[#E5E7EB]",
  ].join(" ");
}

/** Borderless trigger inside unified billing panel */
const PAY_DD_INLINE =
  "h-11 min-h-[44px] w-full rounded-none border-0 bg-transparent px-0 text-left text-[14px] text-[#111827] shadow-none ring-0 focus:ring-0 focus:ring-offset-0";

const toCents = (value: number | string) => {
  const raw =
    typeof value === "number"
      ? value
      : Number(
        String(value ?? "0")
          .trim()
          .replace(/,/g, ""),
      );
  if (!Number.isFinite(raw)) return 0;
  return Math.round((raw + Number.EPSILON) * 100);
};

const centsToAmount = (cents: number) => cents / 100;
const centsToAmountString = (cents: number) => (cents / 100).toFixed(2);

type FlightBookingPaymentSectionProps = {
  trip: any;
  fareRuleData?: any;
  // cities: Array<{ id: string; code: string; label: string; city: string }>;
  countries: CountryOption[];
  /** Latest passengers from book step — reservation state can lag; merge before POST. */
  bookingPassengers?: any[];
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
  ancillarySummary?: {
    totalAmount: number;
    currency: string;
    selectedCount: number;
    breakdown?: Array<{
      category: "baggage" | "meals" | "seats" | "other";
      label: string;
      amount: number;
      currency: string;
      ancillaryOfferId: string;
    }>;
  };
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
  fareRuleData,
  // cities,
  countries = [],
  bookingPassengers,
  reservation,
  onReservationChange,
  onNext,
  onFinalReservationFlightBookingSuccess,
  ancillarySummary,
}: FlightBookingPaymentSectionProps) {
  const [payMethod, setPayMethod] = useState<PaymentMethod>("card");
  const nonCardPaymentsDisabled = true;
  const [openPrice, setOpenPrice] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  //retrieve flight booking
  const [isPolling, setIsPolling] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [legalModal, setLegalModal] = useState<{
    isOpen: boolean;
    type: "terms" | "privacy";
  }>({ isOpen: false, type: "terms" });

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

  const [isTermsChecked, setIsTermsChecked] = useState(false);
  const [showTermsError, setShowTermsError] = useState(false);

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
  const baseTotalRaw = fare?.totalFare ?? fare?.total ?? null;
  const baseTotal = typeof baseTotalRaw === "number" ? baseTotalRaw : 0;
  const ancillaryTotal = Number(ancillarySummary?.totalAmount || 0);
  const total = centsToAmount(toCents(baseTotal) + toCents(ancillaryTotal));
  const flightSubtotal = centsToAmount(toCents(baseTotal));

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

  const isUnitedStates = useMemo(() => {
    const iso2 = selectedCountry?.iso2?.toUpperCase();
    const iso3 = String(address.countryCode ?? "").toUpperCase();
    return iso2 === "US" || iso3 === "USA" || iso3 === "840";
  }, [selectedCountry?.iso2, address.countryCode]);

  const billingFlagSrc = useMemo(() => {
    const iso2 = selectedCountry?.iso2?.trim();
    if (!iso2 || !/^[A-Za-z]{2}$/.test(iso2)) return null;
    return `https://flagcdn.com/24x18/${iso2.toLowerCase()}.png`;
  }, [selectedCountry?.iso2]);

  const { data: citiesData, isLoading: isCitiesLoading } = useCitiesOptions(
    selectedCountry?.label || "",
    !!selectedCountry?.label,
  );

  // const cardNumberDigits = useMemo(
  //   () => cardDetails.number.replace(/\D/g, ""),
  //   [cardDetails.number],
  // );
  // const cvvAllowedLengths = useMemo(
  //   () => getAllowedCvvLengthsForCard(cardNumberDigits),
  //   [cardNumberDigits],
  // );
  // const cvvPlaceholder = cvvAllowedLengths.includes(4) ? "0000" : "000";
  // const cardBrand = useMemo(
  //   () => getCardBrandFromNumber(cardNumberDigits),
  //   [cardNumberDigits],
  // );

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

    if (!isTermsChecked) {
      setShowTermsError(true);
      // return;
    }

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
        amount: centsToAmountString(
          toCents(reservation?.paymentDetails?.transactionAmount || 0),
        ),
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
        // console.log("threeDsResult", threeDsResult);
        const respMsg = String(
          threeDsResult?.response_message || "",
        ).toLowerCase();
        const acqMsg = String(
          threeDsResult?.acquirer_response_message || "",
        ).toLowerCase();

        if (
          respMsg.includes("success") &&
          (acqMsg.includes("success") || acqMsg.includes("approved"))
        ) {
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
        warningToast("Processing your booking, please wait...");
      }, 500);
      const basePassengers = bookingPassengers ?? reservation?.passengers ?? [];
      const reservationWithToken = {
        ...reservation,
        passengers: applyPassengersDefaultResidenceFromIssuing(basePassengers),
        paymentDetails: {
          ...(reservation?.paymentDetails || {}),
          cardInfo: tokenization,
        },
      };
      const response = await mutateAsync(reservationWithToken);

      if (!response?.meta?.success) {
        const msg =
          extractMessageFromApiResponseBody(response) || "Booking failed";
        toast.error(msg);
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
          }, 15000);
          // }, 110000);
          break;

        default: {
          const fallbackMsg =
            extractMessageFromApiResponseBody(response) ||
            `Unexpected booking status: ${statusMessage}`;
          toast.error(fallbackMsg);
        }
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
        const msg =
          extractMessageFromApiResponseBody(retrieveFlightResponse) ||
          "Failed to retrieve flight booking";
        toast.error(msg);
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
    if (!Number.isFinite(total)) return;
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
    if (isPending) return "Processing your booking, please wait...";
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
              ? "Processing your booking, please wait..."
              : retrieveFlightBookingPending || isPolling
                ? "Retrieving booking details…"
                : "Please wait while we are fetching records..."
        }
      />
      <div className="w-full max-w-[560px] lg:max-w-[600px]">
        <FlightSummaryCard
          title="Flight details"
          headerActionText="View all"
          onHeaderActionClick={() => setReviewOpen(true)}
          segments={segments}
          fare={priceFareFamily}
        />

        <FlightBookingReviewModal
          open={reviewOpen}
          onClose={() => setReviewOpen(false)}
          trip={trip}
          fareRuleData={fareRuleData}
          passengers={reservation?.passengers || []}
          countries={countries}
        />

        <div className="mt-8">
          <div className="grid grid-cols-3 gap-3 sm:flex sm:justify-center sm:gap-4">
            <Button
              type="button"
              onClick={() => setPayMethod("card")}
              aria-pressed={payMethod === "card"}
              className={[
                "flex min-h-[56px] w-full items-center justify-center rounded-[12px] border px-2 transition-all duration-200 sm:min-w-[140px] sm:flex-1 sm:max-w-[200px]",
                payMethod === "card"
                  ? "border-[#2351A3] bg-[#2351A3] text-white shadow-sm"
                  : "border-[#E4E4E7] bg-white text-[#0A0C0F] hover:border-[#2351A3]/40",
              ].join(" ")}
              overrideClasses
            >
              <span className="text-center text-[13px] font-semibold leading-tight sm:text-[14px]">
                Pay with card
              </span>
            </Button>

            <Button
              type="button"
              onClick={() => {
                if (!nonCardPaymentsDisabled) setPayMethod("apple");
              }}
              aria-pressed={payMethod === "apple"}
              disabled={nonCardPaymentsDisabled}
              className={[
                "flex min-h-[56px] w-full items-center justify-center rounded-[12px] border p-3 transition-all duration-200 sm:min-w-[140px] sm:flex-1 sm:max-w-[200px]",
                payMethod === "apple"
                  ? "border-[#2351A3] bg-[#2351A3] shadow-sm"
                  : nonCardPaymentsDisabled
                    ? "cursor-not-allowed border-[#E4E4E7] bg-[#F9FAFB] opacity-50"
                    : "border-[#E4E4E7] bg-white hover:border-[#2351A3]/40",
              ].join(" ")}
              overrideClasses
            >
              <img
                src={applePay}
                alt="Apple Pay"
                className={`h-7 w-auto max-w-full object-contain ${payMethod === "apple" ? "brightness-0 invert" : ""}`}
              />
            </Button>

            <Button
              type="button"
              onClick={() => {
                if (!nonCardPaymentsDisabled) setPayMethod("google");
              }}
              aria-pressed={payMethod === "google"}
              disabled={nonCardPaymentsDisabled}
              className={[
                "flex min-h-[56px] w-full items-center justify-center rounded-[12px] border p-3 transition-all duration-200 sm:min-w-[140px] sm:flex-1 sm:max-w-[200px]",
                payMethod === "google"
                  ? "border-[#2351A3] bg-[#2351A3] shadow-sm"
                  : nonCardPaymentsDisabled
                    ? "cursor-not-allowed border-[#E4E4E7] bg-[#F9FAFB] opacity-50"
                    : "border-[#E4E4E7] bg-white hover:border-[#2351A3]/40",
              ].join(" ")}
              overrideClasses
            >
              <img
                src={googlePay}
                alt="Google Pay"
                className={`h-7 w-auto max-w-full object-contain ${payMethod === "google" ? "brightness-0 invert" : ""}`}
              />
            </Button>
          </div>
        </div>

        {payMethod === "card" && (
          <div className="mt-8">
            <div className="rounded-[12px] border border-[#E5E7EB] bg-white px-5 py-6 shadow-[0_1px_3px_rgba(15,23,42,0.06)] sm:px-6 sm:py-7">
              <div>
                <h3 className="text-[17px] font-semibold tracking-tight text-[#111827]">
                  Payment details
                </h3>
                <div className="mt-2.5 flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-2 text-[13px] leading-snug text-[#4B5563]">
                    <img
                      alt=""
                      src={secureLockIcon}
                      className="h-4 w-4 shrink-0 opacity-80"
                    />
                    <span>Secure payment link</span>
                  </div>
                  <svg
                    className="h-4 w-4 shrink-0 text-[#5383DA]"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden
                  >
                    <path
                      d="M10 13a5 5 0 007.07.07l3-3a5 5 0 00-7.07-7.07l-1.41 1.41"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                    />
                    <path
                      d="M14 11a5 5 0 00-7.07-.07l-3 3a5 5 0 007.07 7.07l1.41-1.41"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
              </div>

              <div className="mt-7 space-y-5">
                <div
                  className={`relative w-full ${hasAttemptedValidation && validationErrors["customerInfo.emailAddress"] ? "pb-4" : ""}`}
                >
                  <TailwindCustomInput
                    type="email"
                    placeholder="Enter an email"
                    className={payInputClass(
                      !!(
                        hasAttemptedValidation &&
                        validationErrors["customerInfo.emailAddress"]
                      ),
                    )}
                    label="Email (Optional)"
                    labelClass={PAY_FIELD_LABEL}
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
                  <label className={PAY_FIELD_LABEL}>Card number</label>
                  <div className="relative">
                    <TailwindCustomInput
                      type="text"
                      placeholder="0000 0000 0000 0000"
                      className={`${payInputClass(
                        !!(
                          hasAttemptedValidation &&
                          validationErrors["card.number"]
                        ),
                      )} pr-[4.5rem]`}
                      name="number"
                      value={cardDetails.number}
                      onChange={handleCardFieldChange}
                      error={
                        hasAttemptedValidation
                          ? validationErrors["card.number"]
                          : null
                      }
                    />
                    <div className="pointer-events-none absolute inset-y-0 right-3.5 flex items-center gap-2.5">
                      <img
                        alt=""
                        src={visaIcon}
                        className="h-[18px] w-[28px] object-contain opacity-90"
                      />
                      <img
                        alt=""
                        src={masterCardIcon}
                        className="h-[18px] w-[28px] object-contain opacity-90"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div
                    className={`relative w-full ${hasAttemptedValidation && validationErrors["card.expiry"] ? "pb-4" : ""}`}
                  >
                    <TailwindCustomInput
                      type="text"
                      placeholder="MM/YY"
                      className={payInputClass(
                        !!(
                          hasAttemptedValidation &&
                          validationErrors["card.expiry"]
                        ),
                      )}
                      label="Expiry date"
                      labelClass={PAY_FIELD_LABEL}
                      name="expiry"
                      value={cardDetails.expiryDisplay}
                      onChange={handleCardFieldChange}
                      maxLength={5}
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
                      className={payInputClass(
                        !!(
                          hasAttemptedValidation &&
                          validationErrors["card.cvv"]
                        ),
                      )}
                      label="Security code"
                      labelClass={PAY_FIELD_LABEL}
                      name="cvv"
                      value={cardDetails.cvv}
                      onChange={handleCardFieldChange}
                      maxLength={4}
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
                    className={payInputClass(
                      !!(
                        hasAttemptedValidation &&
                        validationErrors["card.holderName"]
                      ),
                    )}
                    label="Cardholder name"
                    labelClass={PAY_FIELD_LABEL}
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

                <div className="overflow-hidden rounded-[10px] border border-[#E5E7EB] bg-white">
                  <div className="flex min-h-[52px] items-center gap-3 border-b border-[#E5E7EB] px-4 py-2.5 sm:px-4">
                    {billingFlagSrc ? (
                      <img
                        src={billingFlagSrc}
                        alt=""
                        width={28}
                        height={20}
                        className="h-5 w-7 shrink-0 rounded-[3px] object-cover shadow-sm"
                      />
                    ) : (
                      <span
                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#F3F4F6] text-[10px] font-medium text-[#9CA3AF]"
                        aria-hidden
                      >
                        —
                      </span>
                    )}
                    <div className="min-w-0 flex-1">
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
                        className={`${PAY_DD_INLINE} pl-0 pr-8 ${hasAttemptedValidation && validationErrors["address.countryCode"] ? "text-[#B91C1C]" : ""}`}
                      />
                    </div>
                  </div>

                  <div
                    className={`border-b border-[#E5E7EB] px-4 py-2.5 sm:px-4 ${hasAttemptedValidation && validationErrors["address.street.0"] ? "bg-red-50/40" : ""}`}
                  >
                    <TailwindCustomInput
                      type="text"
                      placeholder="Address line 1"
                      className="h-11 w-full border-0 bg-transparent px-0 text-[14px] text-[#111827] shadow-none placeholder:text-[#9CA3AF] ring-0 focus:border-0 focus:outline-none focus:ring-0"
                      label="Address line 1"
                      labelClass="sr-only"
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
                      error={
                        hasAttemptedValidation
                          ? validationErrors["address.street.0"]
                          : null
                      }
                    />
                  </div>

                  <div className="border-b border-[#E5E7EB] px-4 py-2 sm:px-4">
                    {isUnitedStates ? (
                      <CardOverlaySearchableDropdown
                        options={US_STATE_SELECT_OPTIONS}
                        value={String(
                          (address as { stateProvince?: string })
                            .stateProvince ?? "",
                        )}
                        onChange={(val) => {
                          onReservationChange(
                            "paymentDetails.address.stateProvince",
                            val,
                          );
                        }}
                        placeholder="Select a state"
                        className={`${PAY_DD_INLINE} pl-0 pr-8`}
                      />
                    ) : (
                      <TailwindCustomInput
                        type="text"
                        placeholder="State or province"
                        className="h-11 w-full border-0 bg-transparent px-0 text-[14px] text-[#111827] shadow-none placeholder:text-[#9CA3AF] ring-0 focus:border-0 focus:outline-none focus:ring-0"
                        label="State or province"
                        labelClass="sr-only"
                        name="paymentDetails.address.stateProvince"
                        value={String(
                          (address as { stateProvince?: string })
                            .stateProvince ?? "",
                        )}
                        onChange={(e) => {
                          onReservationChange(e);
                        }}
                      />
                    )}
                  </div>

                  <div className="grid grid-cols-2 divide-x divide-[#E5E7EB]">
                    <div
                      className={`px-4 py-3 sm:px-4 ${hasAttemptedValidation && validationErrors["address.cityName"] ? "bg-red-50/40" : ""}`}
                    >
                      <label className={PAY_FIELD_LABEL}>City</label>
                      <div className="mt-1">
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
                          placeholder="City"
                          error={
                            hasAttemptedValidation
                              ? validationErrors["address.cityName"]
                              : null
                          }
                          className={`${PAY_DD_INLINE} pl-0 pr-8 ${hasAttemptedValidation && validationErrors["address.cityName"] ? "text-[#B91C1C]" : ""}`}
                        />
                      </div>
                    </div>
                    <div
                      className={`px-4 py-3 sm:px-4 ${hasAttemptedValidation && validationErrors["address.postalCode"] ? "bg-red-50/40" : ""}`}
                    >
                      <TailwindCustomInput
                        type="text"
                        placeholder="Zip code"
                        className="mt-1 h-11 w-full border-0 bg-transparent px-0 text-[14px] text-[#111827] shadow-none placeholder:text-[#9CA3AF] ring-0 focus:border-0 focus:outline-none focus:ring-0"
                        label="Zip code"
                        labelClass={PAY_FIELD_LABEL}
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

                <div className="mt-2 space-y-1.5 border-t border-[#E5E7EB] pt-5 [font-variant-numeric:tabular-nums]">
                  <div className="flex items-center justify-between text-[15px]">
                    <span className="font-normal text-[#4B5563]">Subtotal</span>
                    <span className="font-semibold text-[#111827]">
                      {formatMoney(flightSubtotal, currency)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[15px] font-semibold text-[#111827]">
                      Total
                    </span>
                    <span className="text-[22px] font-bold text-[#111827]">
                      {total != null ? formatMoney(total, currency) : "—"}
                    </span>
                  </div>
                </div>

                <div className="-mx-1 mt-1">
                  <FLightPriceBreakdown
                    open={openPrice}
                    onToggleOpen={() => setOpenPrice((v) => !v)}
                    trip={trip.raw}
                    cardTone="review"
                    ancillarySummary={ancillarySummary}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {payMethod !== "card" && (
          <FLightPriceBreakdown
            open={openPrice}
            onToggleOpen={() => setOpenPrice((v) => !v)}
            trip={trip.raw}
            ancillarySummary={ancillarySummary}
          />
        )}

        <div className="mt-6">
          <Checkbox
            checked={isTermsChecked}
            onChange={(e) => {
              setIsTermsChecked(e.target.checked);
              if (e.target.checked) {
                setShowTermsError(false);
              }
            }}
            className="items-start [&_.ant-checkbox-inner]:w-5 [&_.ant-checkbox-inner]:h-5 [&_.ant-checkbox-inner]:rounded-lg [&_.ant-checkbox-inner]:border-[#A7C0EC] [&_.ant-checkbox-inner]:border [&_.ant-checkbox]:mt-[2px]"
          >
            <span className="font-medium text-sm leading-none tracking-normal align-middle">
              I agree to the{" "}
              <span
                className="cursor-pointer text-[#5383DA] hover:underline"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setLegalModal({ isOpen: true, type: "terms" });
                }}
              >
                Terms & Conditions
              </span>{" "}
              and Payment Rules and Regulations.
            </span>
          </Checkbox>
          {showTermsError && (
            <p className="mt-1 text-xs text-red-500">
              You must agree to the Terms & Conditions to proceed.
            </p>
          )}
        </div>

        <div className="mt-8 flex w-full flex-col items-stretch sm:items-center">
          <Button
            type="button"
            className={[
              "flex h-[52px] w-full items-center justify-center gap-3 rounded-lg bg-[#2351A3] px-6 text-[16px] font-semibold text-white shadow-sm transition-colors hover:bg-[#1c4594]",
              isPayButtonLoading ? "cursor-not-allowed opacity-90" : "",
            ].join(" ")}
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

          <div className="mt-6 flex w-full flex-col items-center gap-3">
            <p className="text-center text-[13px] text-[#3D495C]">
              Buy now, pay later with:
            </p>
            <div className="flex flex-wrap items-center justify-center gap-8 opacity-90">
              <img
                src={Tabby}
                alt="Tabby"
                className="h-6 w-auto max-w-[120px] object-contain"
              />
              <img
                src={Tamara}
                alt="Tamara"
                className="h-6 w-auto max-w-[120px] object-contain"
              />
            </div>
          </div>

          <div className="mt-8 text-center text-[12px] text-[#3D495C]">
            Secure payments by Al Rais Travel ·{" "}
            <button
              type="button"
              className="cursor-pointer hover:text-[#2351A3] hover:underline"
              onClick={() => setLegalModal({ isOpen: true, type: "privacy" })}
            >
              Privacy
            </button>
          </div>
        </div>
      </div>
      <LegalModal
        isOpen={legalModal.isOpen}
        onClose={() => setLegalModal((prev) => ({ ...prev, isOpen: false }))}
        type={legalModal.type}
      />
    </section>
  );
}
