import applePay from "../../../assets/images/ApplePay (1).png";
import googlePay from "../../../assets/images/GooglePay.png";
import shareIcon from "../../../assets/svgs/share.svg";
import secureLockIcon from "../../../assets/svgs/secure-lock.svg";
import visaIcon from "../../../assets/svgs/visa.svg";
import masterCardIcon from "../../../assets/svgs/mastercard.svg";
import Tabby from "../../../assets/images/tabbycard.png";
import Tamara from "../../../assets/images/tamara1.png";
import React, { useState, useEffect } from "react";
import Button from "../../atoms/Button";
import TailwindCustomInput from "../../common/TailwindCustomInput";
import HotelPriceBreakdown from "../../atoms/HotelPriceBreakdown";
import { extractErrorFromAxiosApiError } from "../../../utils/apiErrorHanlder";
import toast from "react-hot-toast";
import {
  validateHotelReservationBookingDataFields,
  type HotelPaymentCardDetails,
} from "../../../utils/hotelBookingHelper";
import {
  openBlankPopupAndCheckWebisteAllowPopup,
  waitFor3DSecurePaymentPopupReturnResponse,
} from "../../../utils/flightBookingHelper";
import { usePayfortPayment } from "../../../hooks/usePayment";
import { usePayFortTokenization } from "../../../hooks/usePayFortTokenization";
import Loader from "../../atoms/Loader";
import type { SightseeingBookingSummary } from "../../../features/sightseeing/sightseeingBooking";

/** Set to true only for local testing without PayFort. */
const SIGHTSEEING_PAYMENT_BYPASS_FOR_TESTING = false;

type PaymentMethod = "card" | "apple" | "google";

type Props = {
  summary: SightseeingBookingSummary;
  /** Called after PayFort reports success; run supplier preConfirm + confirm here. */
  onPaid: () => Promise<void>;
  onBack?: () => void;
};

function formatMoney(currency: string, amount: number): string {
  const n = amount.toFixed(2);
  const c = currency.trim().toUpperCase();
  if (c === "USD") return `$${n}`;
  if (c === "EUR") return `€${n}`;
  if (c === "GBP") return `£${n}`;
  return `${currency.trim()} ${n}`;
}

export default function SightseeingBookingPaymentSection({
  summary,
  onPaid,
  onBack,
}: Props) {
  const totalPrice = summary.grandTotal;
  const currency = summary.currency || "USD";

  const [payMethod, setPayMethod] = useState<PaymentMethod>("card");
  const [email, setEmail] = useState<string>("");
  const [cardDetails, setCardDetails] = useState<HotelPaymentCardDetails>({
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
  const [isProcessing, setIsProcessing] = useState(false);
  const [showMinimumLoading, setShowMinimumLoading] = useState(false);
  const [isConfirmingBooking, setIsConfirmingBooking] = useState(false);
  const [openPrice, setOpenPrice] = useState(false);

  const { mutateAsync: paymentMutateAsync, isPending: paymentPending } =
    usePayfortPayment();
  const { initiateTokenization, isLoading: isTokenizing } =
    usePayFortTokenization();

  const clearFieldError = (fieldPath: string) => {
    if (hasAttemptedValidation && validationErrors[fieldPath]) {
      setValidationErrors((prev) => {
        const updated = { ...prev };
        delete updated[fieldPath];
        return updated;
      });
    }
  };

  const handleCardFieldChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;

    if (name === "number") {
      const digits = value.replace(/\D/g, "").slice(0, 16);
      const formatted = digits.replace(/(.{4})/g, "$1 ").trim();
      setCardDetails((prev: HotelPaymentCardDetails) => ({
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
      setCardDetails((prev: HotelPaymentCardDetails) => ({
        ...prev,
        expiryDisplay: display,
        expiry: stored,
      }));
      clearFieldError("card.expiry");
      return;
    }
    if (name === "cvv") {
      const digits = value.replace(/\D/g, "").slice(0, 4);
      setCardDetails((prev: HotelPaymentCardDetails) => ({
        ...prev,
        cvv: digits,
      }));
      clearFieldError("card.cvv");
      return;
    }
    if (name === "holderName") {
      setCardDetails((prev: HotelPaymentCardDetails) => ({
        ...prev,
        holderName: value,
      }));
      clearFieldError("card.holderName");
    }
  };

  const runAfterPaymentSuccess = async () => {
    setIsConfirmingBooking(true);
    try {
      await onPaid();
    } catch (err) {
      const msg = extractErrorFromAxiosApiError(err);
      toast.error(msg || "Could not complete your activity booking.");
    } finally {
      setIsConfirmingBooking(false);
    }
  };

  const handlePayfortPayment = async (
    tokenization: string,
    reservation: {
      paymentDetails: {
        paymentMode: string;
        transactionAmount?: number | null;
      };
      customerInfo: { emailAddress?: string };
    },
  ) => {
    let popup: Window | null = null;
    setIsProcessing(true);
    try {
      try {
        popup = openBlankPopupAndCheckWebisteAllowPopup(
          "payfort3dsWindowSightseeing",
          600,
          800,
        );
      } catch (err: unknown) {
        const m =
          err instanceof Error
            ? err.message
            : "Please allow popups for this site.";
        toast.error(m);
        return;
      }

      const threeDsMessagePromise =
        waitFor3DSecurePaymentPopupReturnResponse(120000);

      const paymentPayload = {
        token_name: tokenization ?? null,
        amount: String(
          reservation.paymentDetails.transactionAmount ?? totalPrice ?? 0,
        ),
        email: reservation.customerInfo.emailAddress || "",
      };

      const response = await paymentMutateAsync(paymentPayload);
      const threeDsUrl = response?.["3ds_url"];

      if (threeDsUrl) {
        try {
          popup!.location.href = threeDsUrl;
        } catch {
          try {
            popup!.location.assign(threeDsUrl);
          } catch {
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
          await runAfterPaymentSuccess();
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
          await runAfterPaymentSuccess();
        } else {
          toast.error(response?.response_message || "Payment failed");
        }
      }
    } catch (error) {
      const err = extractErrorFromAxiosApiError(error);
      toast.error(err);
    } finally {
      try {
        if (popup && !popup.closed) popup.close();
      } catch {
        /* ignore */
      }
      setIsProcessing(false);
    }
  };

  const startPayment = async () => {
    if (SIGHTSEEING_PAYMENT_BYPASS_FOR_TESTING) {
      toast.success("Testing mode: skipping payment.");
      await runAfterPaymentSuccess();
      return;
    }

    const reservation = {
      paymentDetails: {
        paymentMode: "CR",
        transactionAmount: totalPrice,
      },
      customerInfo: {
        emailAddress: email,
      },
    };

    setHasAttemptedValidation(true);
    const fieldErrors = validateHotelReservationBookingDataFields(
      reservation,
      cardDetails,
    );
    setValidationErrors(fieldErrors);
    if (Object.keys(fieldErrors).length > 0) return;

    if (payMethod !== "card") {
      toast.error("Please pay with card for sightseeing bookings.");
      return;
    }

    setIsProcessing(true);
    setShowMinimumLoading(true);
    try {
      const cleanCardNumber = (cardDetails.number || "").replace(/\s+/g, "");
      const expiry = cardDetails.expiry || "";
      const cvv = cardDetails.cvv || "";
      const cardHolder = cardDetails.holderName || "Customer";
      const payload = await initiateTokenization({
        cardNumber: cleanCardNumber,
        expiry,
        cvv,
        cardHolder,
      });
      if (payload?.response_message === "Success") {
        const token = payload?.token_name;
        await handlePayfortPayment(String(token ?? ""), reservation);
        return;
      }
      toast.error(payload?.response_message || "Tokenization failed.");
    } catch (err: unknown) {
      console.error("Sightseeing tokenize error:", err);
      toast.error(
        err instanceof Error ? err.message : "Tokenization failed.",
      );
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    if (!showMinimumLoading) return;
    const timer = setTimeout(() => setShowMinimumLoading(false), 1000);
    return () => clearTimeout(timer);
  }, [showMinimumLoading]);

  const isPayButtonLoading =
    isProcessing ||
    isTokenizing ||
    paymentPending ||
    showMinimumLoading ||
    isConfirmingBooking;

  const payLabel = () => {
    if (isConfirmingBooking) return "Confirming your booking";
    if (isTokenizing || showMinimumLoading) return "Preparing secure payment";
    if (paymentPending) return "Processing your payment";
    if (isProcessing) return "Please wait";
    return "Pay";
  };

  const pickupLine = [summary.pickupDateDisplay, summary.pickupTimeDisplay]
    .filter(Boolean)
    .join(" · ");

  return (
    <section className="mt-6 flex items-center justify-center px-4 pb-16">
      <Loader
        show={isConfirmingBooking}
        label="Confirming your sightseeing booking…"
      />
      <div className="w-full max-w-[550px] font-[Inter,sans-serif]">
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            className="mb-6 text-left text-[14px] font-medium text-[#2351A3] hover:underline"
          >
            ← Back to traveller details
          </button>
        ) : null}

        <div className="rounded-2xl border border-[#E4E4E7] bg-[#F8FAFC] p-5">
          <div className="flex gap-4">
            <div className="h-[100px] w-[120px] shrink-0 overflow-hidden rounded-xl bg-[#E8ECF0]">
              {summary.imageSrc ? (
                <img
                  src={summary.imageSrc}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : null}
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-[16px] font-bold leading-snug text-[#0A0C0F]">
                {summary.title}
              </h2>
              <p className="mt-2 text-[13px] text-[#64748B]">
                {summary.travellersSummary}
              </p>
              <p className="mt-1 text-[13px] text-[#64748B]">{pickupLine}</p>
              <p className="mt-2 text-[18px] font-bold text-[#2351A3]">
                {formatMoney(currency, totalPrice)}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <div className="flex flex-wrap items-center justify-center gap-[0.45rem]">
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
              <span className="px-2 text-center text-[12px] font-semibold">
                Pay with card
              </span>
            </Button>
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
            <Button
              type="button"
              className="flex h-[65px] w-[103px] flex-shrink-0 flex-col items-center justify-center gap-2 rounded-[6px] border-[1.5px] border-[#C2CAD6] bg-white p-3 transition-all duration-200 hover:border-[#5383DA] hover:shadow-sm focus:outline-none"
              overrideClasses
            >
              <img src={Tabby} alt="Tabby" className="h-4 w-10 object-contain" />
              <span className="text-center text-[9px] text-[#64748B]">
                Buy now pay later
              </span>
            </Button>
            <Button
              type="button"
              className="flex h-[65px] w-[103px] flex-shrink-0 flex-col items-center justify-center gap-2 rounded-[6px] border-[1.5px] border-[#C2CAD6] bg-white p-3 transition-all duration-200 hover:border-[#5383DA] hover:shadow-sm focus:outline-none"
              overrideClasses
            >
              <img
                src={Tamara}
                alt="Tamara"
                className="h-4 w-10 object-contain"
              />
              <span className="text-center text-[9px] text-[#64748B]">
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
                        alt=""
                        src={secureLockIcon}
                        className="h-3.5 w-3.5"
                      />
                      <span>Secure payment</span>
                    </div>
                    <img alt="" src={shareIcon} className="h-3 w-3" />
                  </div>
                </div>
                <div className="mt-5 space-y-4">
                  <TailwindCustomInput
                    type="email"
                    placeholder="Enter an email"
                    className={`h-12 w-full rounded-2xl border px-4 text-[14px] text-[#3D495C] placeholder:text-[#C2CAD6] focus:outline-none ${hasAttemptedValidation &&
                      validationErrors["customerInfo.emailAddress"]
                      ? "border-[#E65959]"
                      : "border-[#C2CAD6]"
                      }`}
                    label="Email"
                    name="customerInfo.emailAddress"
                    value={email}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      setEmail(e.target.value);
                      clearFieldError("customerInfo.emailAddress");
                    }}
                    error={
                      hasAttemptedValidation
                        ? validationErrors["customerInfo.emailAddress"]
                        : null
                    }
                  />
                  <div>
                    <label className="mb-1 block text-[12px] text-[#3D495C]">
                      Card number
                    </label>
                    <div className="relative">
                      <TailwindCustomInput
                        type="text"
                        placeholder="0000 0000 0000 0000"
                        className={`h-12 w-full rounded-2xl border px-4 pr-20 text-[14px] ${hasAttemptedValidation &&
                          validationErrors["card.number"]
                          ? "border-[#E65959]"
                          : "border-[#C2CAD6]"
                          }`}
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
                        <img alt="" src={visaIcon} className="h-4.5 w-4.5" />
                        <img
                          alt=""
                          src={masterCardIcon}
                          className="h-4.5 w-4.5"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <TailwindCustomInput
                      type="text"
                      placeholder="MM/YY"
                      className={`h-12 w-full rounded-2xl border px-4 text-[14px] ${hasAttemptedValidation &&
                        validationErrors["card.expiry"]
                        ? "border-[#E65959]"
                        : "border-[#C2CAD6]"
                        }`}
                      name="expiry"
                      value={cardDetails.expiryDisplay}
                      onChange={handleCardFieldChange}
                      error={
                        hasAttemptedValidation
                          ? validationErrors["card.expiry"]
                          : null
                      }
                    />
                    <TailwindCustomInput
                      type="text"
                      placeholder="000"
                      className={`h-12 w-full rounded-2xl border px-4 text-[14px] ${hasAttemptedValidation &&
                        validationErrors["card.cvv"]
                        ? "border-[#E65959]"
                        : "border-[#C2CAD6]"
                        }`}
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
                  <TailwindCustomInput
                    type="text"
                    placeholder="Enter cardholder name"
                    className={`h-12 w-full rounded-2xl border px-4 text-[14px] ${hasAttemptedValidation &&
                      validationErrors["card.holderName"]
                      ? "border-[#E65959]"
                      : "border-[#C2CAD6]"
                      }`}
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
                  <div className="mt-8 space-y-1 [font-variant-numeric:tabular-nums]">
                    <div className="flex items-center justify-between text-[15px]">
                      <span className="font-medium text-[#3D495C]">Total</span>
                      <span className="text-right text-[22px] font-bold text-[#0A0C0F]">
                        {formatMoney(currency, totalPrice)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <HotelPriceBreakdown open={openPrice}
          onToggleOpen={() => setOpenPrice((v) => !v)} totalPrice={totalPrice} currency={currency} />

        <div className="mt-16 flex flex-col items-center">
          <Button
            type="button"
            overrideClasses
            className={`flex h-[48px] min-w-[200px] items-center justify-center gap-3 rounded-[100px] px-8 py-[14px] text-[15px] font-semibold text-white transition-all duration-200 ${isPayButtonLoading
              ? "cursor-not-allowed opacity-95"
              : "hover:opacity-95 active:opacity-90"
              }`}
            style={{
              background:
                "linear-gradient(90.59deg, #5383DA 0%, #2351A3 50%, #081326 100%)",
            }}
            onClick={startPayment}
            disabled={isPayButtonLoading}
          >
            {payLabel()}
          </Button>
        </div>
      </div>
    </section>
  );
}
