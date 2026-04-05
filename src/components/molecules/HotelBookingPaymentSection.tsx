import applePay from "../../assets/images/ApplePay (1).png";
import googlePay from "../../assets/images/GooglePay.png";
import shareIcon from "../../assets/svgs/share.svg";
import secureLockIcon from "../../assets/svgs/secure-lock.svg";
import visaIcon from "../../assets/svgs/visa.svg";
import masterCardIcon from "../../assets/svgs/mastercard.svg";
import Tabby from "../../assets/images/tabbycard.png";
import Tamara from "../../assets/images/tamara1.png";
import { useState, useEffect } from "react";
// import CardCollapseToggle from "../common/CardCollapseToggle";
import Button from "../atoms/Button";
import TailwindCustomInput from "../common/TailwindCustomInput";
import HotelPriceBreakdown from "../atoms/HotelPriceBreakdown";
import HotelSummaryCard from "../atoms/HotelSummaryCard";
import { useHotelReservationBooking } from "../../hooks/useHotelBooking";
import { extractErrorFromAxiosApiError } from "../../utils/apiErrorHanlder";
import toast from "react-hot-toast";
import type { HotelBookingPayload } from "../../utils/hotelBookingHelper";
import {
  // validateHotelReservationBookingData,
  validateHotelReservationBookingDataFields,
  type HotelPaymentCardDetails,
} from "../../utils/hotelBookingHelper";
import {
  openBlankPopupAndCheckWebisteAllowPopup,
  waitFor3DSecurePaymentPopupReturnResponse,
} from "../../utils/flightBookingHelper";
import { usePayfortPayment } from "../../hooks/usePayment";
import { usePayFortTokenization } from "../../hooks/usePayFortTokenization";
import Loader from "../atoms/Loader";
import LegalModal from "../common/LegalModal";

/**
 * TESTING BYPASS: Set to true to skip payment and go directly to receipt.
 * REVERT: Set back to false before production.
 */
const HOTEL_PAYMENT_BYPASS_FOR_TESTING = false;

type PaymentMethod = "card" | "apple" | "google";

type HotelBookingPaymentSectionProps = {
  onNext?: (bookingResponse: any) => void;
  onEditPassengers?: () => void;
  hotelDetail?: any;
  bookingInfo?: any;
  selectedRooms?: any[];
  totalPrice?: number;
  currency?: string;
  hotelBookingPayload?: HotelBookingPayload | null;
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

export default function HotelBookingPaymentSection({
  onNext,
  onEditPassengers,
  hotelDetail,
  bookingInfo,
  selectedRooms = [],
  totalPrice = 0,
  currency = "AED",
  hotelBookingPayload,
}: HotelBookingPaymentSectionProps) {
  const [payMethod, setPayMethod] = useState<PaymentMethod>("card");
  // const [openAddress, setOpenAddress] = useState(true);
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
  const [legalModal, setLegalModal] = useState<{
    isOpen: boolean;
    type: "terms" | "privacy";
  }>({ isOpen: false, type: "terms" });

  const { mutateAsync, isPending } = useHotelReservationBooking();
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
      setCardDetails((prev) => ({ ...prev, holderName: value }));
      clearFieldError("card.holderName");
      return;
    }
  };

  const generatePayfortPaymentTokenization = async () => {
    if (!hotelBookingPayload) {
      console.log("Booking data missing.");
      return;
    }

    // TESTING BYPASS: Skip payment, show receipt immediately. REVERT: Set HOTEL_PAYMENT_BYPASS_FOR_TESTING to false.
    if (HOTEL_PAYMENT_BYPASS_FOR_TESTING) {
      const rooms = selectedRooms.map((sr) => sr?.room).filter(Boolean);
      const passengers = hotelBookingPayload.rooms?.flatMap((r: any) => r.passengers ?? []) ?? [];
      const mockResponse = {
        data: [
          {
            hotel: {
              rooms,
              checkInDate: bookingInfo?.checkIn ?? hotelBookingPayload?.stayDateRange?.checkIn,
              checkOutDate: bookingInfo?.checkOut ?? hotelBookingPayload?.stayDateRange?.checkOut,
              currency: currency ?? "AED",
              totalNet: totalPrice ?? 0,
            },
            passengers,
            bookingReferenceId: `TEST-${Date.now()}`,
          },
        ],
        meta: { success: true, actionType: "Booking confirmed (TEST)" },
      };
      toast.success("Testing mode: Receipt shown without payment.");
      onNext?.(mockResponse);
      return;
    }

    const reservation = {
      paymentDetails: {
        paymentMode: hotelBookingPayload.paymentDetails.paymentMode,
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

    if (Object.keys(fieldErrors).length > 0) {
      // const { valid, error } = validateHotelReservationBookingData(
      //   reservation,
      //   cardDetails,
      // );
      // if (!valid && error) {
      //   toast.error(error);
      //   return;
      // }
      return;
    }

    setIsProcessing(true);
    setShowMinimumLoading(true);
    try {
      const cleanCardNumber = (cardDetails.number || "").replace(/\s+/g, "");
      const expiry = cardDetails.expiry || ""; // YYMM
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
        await handlePayfortHotelPayment(token, reservation);
        return;
      }

      toast.error(payload?.response_message || "Tokenization failed.");
    } catch (err: any) {
      console.error("Hotel tokenize error:", err);
      toast.error(err?.message || "Tokenization failed.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePayfortHotelPayment = async (
    tokenization: string,
    reservation: {
      paymentDetails: {
        paymentMode: string;
        transactionAmount?: number | null;
      };
      customerInfo: { emailAddress?: string };
    },
  ) => {
    if (!hotelBookingPayload) return;

    let popup: Window | null = null;
    setIsProcessing(true);
    try {
      try {
        popup = openBlankPopupAndCheckWebisteAllowPopup(
          "payfort3dsWindowHotel",
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
          await handleHotelReservationBooking(tokenization, reservation);
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
          await handleHotelReservationBooking(tokenization, reservation);
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
      } catch (_) { }
      setIsProcessing(false);
    }
  };

  const handleHotelReservationBooking = async (
    tokenization: string,
    reservation: {
      paymentDetails: {
        paymentMode: string;
        transactionAmount?: number | null;
      };
      customerInfo: { emailAddress?: string };
    },
  ) => {
    if (!hotelBookingPayload) return;

    try {
      const reservationWithToken: HotelBookingPayload = {
        ...hotelBookingPayload,
        paymentDetails: {
          ...(hotelBookingPayload.paymentDetails || { paymentMode: "CR" }),
          cardInfo: tokenization,
          transactionAmount: reservation.paymentDetails.transactionAmount,
        },
        customerInfo: {
          ...(hotelBookingPayload.customerInfo || {}),
          emailAddress: reservation.customerInfo.emailAddress,
        },
      };

      const response = await mutateAsync(reservationWithToken);

      if (
        response?.meta?.success &&
        response?.meta?.statusMessage === "SUCCESS"
      ) {
        toast.success(response?.meta?.actionType || "Booking confirmed!");
        if (typeof onNext === "function") {
          onNext(response);
        }
      } else {
        toast.error((t) => (
          <div>
            <p>Booking failed. Please try again.</p>
            <button
              onClick={() => {
                toast.dismiss(t.id);
                if (typeof onEditPassengers === "function") onEditPassengers();
              }}
              className="mt-2 text-sm underline hover:no-underline"
            >
              Update passenger information?
            </button>
          </div>
        ));
      }
    } catch (error) {
      const err = extractErrorFromAxiosApiError(error);
      toast.error((t) => (
        <div>
          <p>{err}</p>
          <button
            onClick={() => {
              toast.dismiss(t.id);
              if (typeof onEditPassengers === "function") onEditPassengers();
            }}
            className="mt-2 text-sm underline hover:no-underline"
          >
            Update passenger information?
          </button>
        </div>
      ));
    }
  };

  useEffect(() => {
    if (!showMinimumLoading) return;
    const timer = setTimeout(() => setShowMinimumLoading(false), 1000);
    return () => clearTimeout(timer);
  }, [showMinimumLoading]);

  const isPayButtonLoading =
    isPending || isProcessing || isTokenizing || paymentPending || showMinimumLoading;

  const getPayButtonText = () => {
    if (isTokenizing || showMinimumLoading) return "Preparing secure payment";
    if (paymentPending) return "Processing your payment";
    if (isPending) return "Confirming your hotel booking";
    if (isProcessing) return "Please wait";
    return "Pay";
  };

  return (
    <section className="mt-10 flex items-center justify-center px-4">
      <Loader show={isPending} label="Confirming your hotel booking…" />
      <div className="w-full max-w-[550px]">
        <HotelSummaryCard
          paymentPage={true}
          hotelDetail={hotelDetail}
          bookingInfo={bookingInfo}
        />

        <div className="mt-6">
          <div className="flex flex-wrap items-center justify-center gap-[0.45rem]">
            {/* Pay with card */}
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
              className="flex flex-col items-center justify-center gap-2 transition-all duration-200 flex-shrink-0 w-[103px] h-[65px] rounded-[6px] border-[1.5px] border-[#C2CAD6] bg-white hover:border-[#5383DA] hover:shadow-sm p-3 focus:outline-none"
              overrideClasses
            >
              <img
                src={Tabby}
                alt="Tabby"
                className="w-10 h-4 object-contain"
              />
              <span className="text-[9px] text-[#64748B] text-center">
                Buy now pay later
              </span>
            </Button>

            {/* Tamara */}
            <Button
              type="button"
              className="flex flex-col items-center justify-center gap-2 transition-all duration-200 flex-shrink-0 w-[103px] h-[65px] rounded-[6px] border-[1.5px] border-[#C2CAD6] bg-white hover:border-[#5383DA] hover:shadow-sm p-3 focus:outline-none"
              overrideClasses
            >
              <img
                src={Tamara}
                alt="Tamara"
                className="w-10 h-4 object-contain"
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
                    onChange={(e) => {
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
                      className={`h-12 w-full rounded-2xl border px-4 text-[14px] ${hasAttemptedValidation && validationErrors["card.cvv"]
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

                  {/* <div className="rounded-xl border border-[#C2CAD6] overflow-hidden">
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
                        <img
                          src={FlagUae}
                          alt="usa-flag"
                          className="h-6 w-6 rounded-full"
                        />
                        <span>United Arab Emirates</span>
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
                          <div className="px-3">
                            <TailwindCustomInput
                              type="text"
                              placeholder="Address line 1"
                              className="h-11 w-full bg-transparent px-0 text-sm text-[#0A0C0F] placeholder:text-[#C2CAD6] focus:outline-none"
                            />
                          </div>

                          <div className="relative">
                            <select
                              defaultValue=""
                              className="h-11 w-full appearance-none bg-transparent pr-6 text-sm text-[#0A0C0F] focus:outline-none px-3"
                            >
                              <option value="" disabled>
                                Select a country
                              </option>
                              <option value="UAE">United Arab Emirates</option>
                            </select>

                            <ChevronDown />
                          </div>

                          <div className="grid grid-cols-2">
                            <div className="px-3 relative">
                              <select
                                defaultValue=""
                                className="h-11 w-full appearance-none bg-transparent pr-6 text-sm text-[#0A0C0F] focus:outline-none px-3"
                              >
                                <option value="" disabled>
                                  Select a city
                                </option>
                              </select>

                              <ChevronDown />
                            </div>
                            <div className="border-l border-[#E4E4E7] px-3">
                              <TailwindCustomInput
                                type="text"
                                placeholder="Zip code"
                                className="h-11 w-full bg-transparent px-0 text-sm text-[#0A0C0F] placeholder:text-[#C2CAD6] focus:outline-none"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div> */}

                  <div className="mt-8 space-y-1 [font-variant-numeric:tabular-nums]">
                    <div className="flex items-center justify-between text-[15px]">
                      <span className="font-medium text-[#3D495C]">
                        Subtotal
                      </span>
                      <span className="font-semibold text-[#0A0C0F] text-right">
                        {currency} {totalPrice.toFixed(2)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-[15px] font-semibold text-[#3D495C]">
                        Total
                      </span>
                      <span className="text-[22px] font-bold text-[#0A0C0F] text-right">
                        {currency} {totalPrice.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <HotelPriceBreakdown totalPrice={totalPrice} currency={currency} taxes={selectedRooms?.[0]?.room?.roomRate?.taxes || []} />

        <div className="mt-16 flex flex-col items-center">
          <Button
            type="button"
            overrideClasses
            className={`min-w-[200px] h-[48px] rounded-[100px] px-8 py-[14px] text-[15px] font-semibold text-white flex items-center justify-center gap-3 transition-all duration-200 ${isPayButtonLoading ? "opacity-95 cursor-not-allowed" : "hover:opacity-95 active:opacity-90"
              }`}
            style={{
              background: "linear-gradient(90.59deg, #5383DA 0%, #2351A3 50%, #081326 100%)",
            }}
            onClick={generatePayfortPaymentTokenization}
            disabled={isPayButtonLoading}
          >
            {isPayButtonLoading && (
              <svg
                className="h-5 w-5 flex-shrink-0 animate-spin"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden
              >
                <circle
                  className="opacity-30"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="3"
                />
                <path
                  className="opacity-100"
                  fill="currentColor"
                  d="M12 2a10 10 0 0 1 10 10h-3a7 7 0 0 0-7-7V2z"
                />
              </svg>
            )}
            <span className="tracking-tight">{getPayButtonText()}</span>
          </Button>

          <div className="mt-6 text-center text-[12px] text-[#3D495C]">
            Secure payments by Al Rais •{" "}
            <span
              className="cursor-pointer hover:text-[#2351A3] hover:underline"
              onClick={() => setLegalModal({ isOpen: true, type: "terms" })}
            >
              Terms
            </span>{" "}
            •{" "}
            <span
              className="cursor-pointer hover:text-[#2351A3] hover:underline"
              onClick={() => setLegalModal({ isOpen: true, type: "privacy" })}
            >
              Privacy
            </span>
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
