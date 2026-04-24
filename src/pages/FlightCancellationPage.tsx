import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Checkbox, Input } from "antd";
import type { CheckboxChangeEvent } from "antd/es/checkbox";
import { Link, useLocation, useNavigate } from "react-router-dom";
import cabinIcon from "../assets/svgs/cabin.svg";
import baggageIcon from "../assets/svgs/baggage.svg";
import durationIcon from "../assets/svgs/duration.svg";
import refundableIcon from "../assets/svgs/redundable.svg";
import InfoPrimary from "../assets/svgs/info-primary.svg";
import SEAT_ICON from "../assets/svgs/seat.svg";
import PLANE_ICON from "../assets/svgs/plane.svg";
import EmirateLogo from "../assets/images/emirates.png";
import Button from "../components/atoms/Button";
import FlightSummaryCard from "../components/atoms/FlightSummaryCard";
import Loader from "../components/atoms/Loader";
import ConfirmationModal from "../components/common/ConfirmationModal";
import SearchableDropdown from "../components/common/SearchableDropdown";
import {
  useFlightCancellation,
  useFlightCancellationCharges,
} from "../hooks/useFlightCancellation";
import { useFlightCancelReasonOptions } from "../hooks/masterListings/listing";
import { extractErrorFromAxiosApiError } from "../utils/apiErrorHanlder";
import toast from "react-hot-toast";
import { buildMyBookingsUrl } from "../utils/myBookingsUrl";
import {
  isApiCancellationChargesPayloadUsable,
  parseFlightCancellationChargesResponse,
  type FlightCancellationRequest,
} from "../services/api/flightCancellation";
import {
  buildFareRulesCancellationFeeModel,
  sumCancellationFeesForPassengers,
} from "../utils/flightCancellationFareRulesEstimate";
import {
  buildFlightSegmentFromTrip,
  getPriceCabinClassForFlightSummary,
} from "../utils/helpers";

type ChargeDisplaySource = "api" | "fareRules" | "none";

type OtherReasonTextAreaRef = React.ComponentRef<typeof Input.TextArea>;

function SectionCard({
  title,
  subtitle,
  children,
  backgroundColor = "#F2F2F3",
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  backgroundColor?: string;
}) {
  return (
    <div
      className={`rounded-[16px] border-[1.5px] border-[#C2CAD6] bg-[${backgroundColor}]`}
    >
      <div className="px-4 pt-4 pb-3">
        <h3 className="text-[18px] font-semibold text-[#0A0C0F]">{title}</h3>
        {subtitle && (
          <p className="mt-1 text-[12px] text-[#3D495C]">{subtitle}</p>
        )}
      </div>
      <div className="border border-[#E4E4E7] mb-4"></div>
      <div className="px-4 pb-4">{children}</div>
    </div>
  );
}

function CancelItemCard({
  title,
  subtitle,
  selected,
  onClick,
}: {
  title: string;
  subtitle?: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <Button
      type="button"
      onClick={onClick}
      className={`w-full rounded-[10px] border-[1.5px] px-4 py-6 text-center transition-all ${
        selected
          ? "border-[#B80020] bg-[#FFB8C4]"
          : "border-[#E4E4E7] bg-white hover:border-[#EA0029]/50"
      }`}
      overrideClasses
    >
      <div className="text-[14px] font-semibold text-[#B80020]">{title}</div>
      {subtitle && (
        <div className="mt-1 text-[13px] text-[#B80020]">{subtitle}</div>
      )}
    </Button>
  );
}

function SummaryAmountRow({
  label,
  value,
  valueClassName = "font-medium text-[#0A0C0F] text-[16px]",
}: {
  label: React.ReactNode;
  value: React.ReactNode;
  valueClassName?: string;
}) {
  return (
    <div className="flex items-center justify-between text-[12px]">
      <span className="text-[#3D495C]">{label}</span>
      <span className={valueClassName}>{value}</span>
    </div>
  );
}

function AcknowledgementCheckbox({
  checked,
  onChange,
  children,
  error,
}: {
  checked: boolean;
  onChange: (event: CheckboxChangeEvent) => void;
  children: React.ReactNode;
  error?: string;
}) {
  return (
    <div className="px-1 py-1">
      <Checkbox
        className="[&_.ant-checkbox-inner]:!border-[#A7C0EC] [&_.ant-checkbox-inner]:!border-[1.5px] [&_.ant-checkbox-inner]:!rounded-[4px]"
        checked={checked}
        onChange={onChange}
      >
        <span className="text-[16px] text-[#3D495C] font-medium">
          {children}
        </span>
      </Checkbox>
      {error && (
        <p className="mt-1 text-[12px] text-[#E65959]" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

function passengerLabel(p: any): string {
  const info = p?.passengerInfo;
  if (!info) return "Passenger";
  const t = info.nameTitle || "";
  const g = info.givenName || "";
  const s = info.surname || "";
  return `${t} ${g} ${s}`.trim() || "Passenger";
}

/** Stable string key for checkbox group + API row lookup if passengerKey is missing. */
function passengerRowKey(p: any, index: number): string {
  const raw = p?.passengerKey;
  if (raw !== undefined && raw !== null && String(raw).trim() !== "") {
    return String(raw);
  }
  return `pax-${index}`;
}

function isOtherCancelReasonLabel(label: string | undefined): boolean {
  return (
    String(label ?? "")
      .trim()
      .toLowerCase() === "other"
  );
}

const FlightCancellationPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const bookingReferenceId = location.state?.bookingReferenceId || "";
  const supplierLocator = location.state?.supplierLocator || "";
  const issueDate = location.state?.issueDate || "";
  const airlineName = location.state?.airlineName || "Airline";
  const routeLabel = location.state?.routeLabel || "Flight booking";
  const passengersLabel = location.state?.passengersLabel || "";
  const originalTicketPrice = Number(location.state?.totalAmount || 0);
  const fareCurrencyFallback = location.state?.currencyCode || "USD";
  const bookingPassengers: any[] = Array.isArray(
    location.state?.bookingPassengers,
  )
    ? location.state.bookingPassengers
    : [];

  const fareRulesDetails = location.state?.fareRulesDetails ?? null;
  const offerId = String(
    location.state?.offerId ?? location.state?.bookingId ?? "",
  ).trim();
  const tripForSummary = location.state?.tripForSummary ?? null;
  const displayBookingRef =
    String(location.state?.displayBookingRef ?? "").trim() ||
    bookingReferenceId ||
    supplierLocator ||
    "";

  const allowPartialCancellation = bookingPassengers.length > 1;

  const {
    mutateAsync: getFlightCancellationChargesAsync,
    isPending: isChargesLoading,
  } = useFlightCancellationCharges();

  const { mutateAsync: cancelFlightAsync, isPending: isCancelling } =
    useFlightCancellation();

  const {
    data: cancelReasonOptions,
    isLoading: cancelReasonsLoading,
    isFetching: cancelReasonsFetching,
  } = useFlightCancelReasonOptions();

  /** Selected master-listing row id (`flight-cancel-reason`); Select option `value`. */
  const [cancelReasonId, setCancelReasonId] = useState<string | undefined>();
  const [cancelReasonDetail, setCancelReasonDetail] = useState("");
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});
  const [hasAttemptedValidation, setHasAttemptedValidation] = useState(false);
  const [ack1, setAck1] = useState(false);
  const [ack2, setAck2] = useState(false);

  const [cancelAllPassengers, setCancelAllPassengers] = useState(true);
  const [selectedPassengerKeys, setSelectedPassengerKeys] = useState<string[]>(
    [],
  );

  const [currency, setCurrency] = useState(fareCurrencyFallback);
  const [supplierCancellationCharge, setSupplierCancellationCharge] =
    useState(0);
  const [adminCancellationCharge, setAdminCancellationCharge] = useState(0);
  const [totalCancellationCharges, setTotalCancellationCharges] = useState(0);
  const [isSupplierRefundApplicable, setIsSupplierRefundApplicable] =
    useState(true);

  const [chargeDisplaySource, setChargeDisplaySource] =
    useState<ChargeDisplaySource>("none");
  // const [refundDetailNotes, setRefundDetailNotes] = useState<string[]>([]);
  const [chargesResolved, setChargesResolved] = useState(false);
  const [showCancellationSuccessModal, setShowCancellationSuccessModal] =
    useState(false);

  const fareRulesFeeModel = useMemo(
    () =>
      buildFareRulesCancellationFeeModel(
        fareRulesDetails,
        fareCurrencyFallback,
      ),
    [fareRulesDetails, fareCurrencyFallback],
  );

  const cancellingPassengers = useMemo(() => {
    if (bookingPassengers.length === 0) {
      return cancelAllPassengers ? [{ ptc: "ADT" }] : [];
    }
    if (cancelAllPassengers) return bookingPassengers;
    return bookingPassengers.filter((p, idx) =>
      selectedPassengerKeys.includes(passengerRowKey(p, idx)),
    );
  }, [bookingPassengers, cancelAllPassengers, selectedPassengerKeys]);

  const displayedCharges = useMemo(() => {
    if (!chargesResolved || isChargesLoading) {
      return {
        supplier: 0,
        admin: 0,
        total: 0,
        currency: fareCurrencyFallback,
        refundApplicable: true,
      };
    }

    if (chargeDisplaySource === "fareRules") {
      const total = sumCancellationFeesForPassengers(
        cancellingPassengers,
        fareRulesFeeModel,
      );
      const hasNumeric = Object.values(fareRulesFeeModel.feeByPtc).some(
        (v) => typeof v === "number" && v > 0,
      );
      const refundApplicable =
        total > 0 || fareRulesFeeModel.hasNegOne || hasNumeric;
      return {
        supplier: total,
        admin: 0,
        total,
        currency: fareRulesFeeModel.currency,
        refundApplicable,
      };
    }

    if (chargeDisplaySource === "api") {
      let ratio = 1;
      if (!cancelAllPassengers && bookingPassengers.length > 1) {
        ratio = cancellingPassengers.length / bookingPassengers.length;
      }
      return {
        supplier: supplierCancellationCharge * ratio,
        admin: adminCancellationCharge * ratio,
        total: totalCancellationCharges * ratio,
        currency,
        refundApplicable: isSupplierRefundApplicable,
      };
    }

    return {
      supplier: 0,
      admin: 0,
      total: 0,
      currency: fareCurrencyFallback,
      refundApplicable: true,
    };
  }, [
    chargesResolved,
    isChargesLoading,
    chargeDisplaySource,
    cancellingPassengers,
    fareRulesFeeModel,
    cancelAllPassengers,
    bookingPassengers.length,
    supplierCancellationCharge,
    adminCancellationCharge,
    totalCancellationCharges,
    currency,
    isSupplierRefundApplicable,
    fareCurrencyFallback,
  ]);

  const ticketValueForCancellation = useMemo(() => {
    const nTotal = Math.max(bookingPassengers.length, 1);
    const nCancel = cancelAllPassengers
      ? bookingPassengers.length > 0
        ? bookingPassengers.length
        : 1
      : cancellingPassengers.length;
    return originalTicketPrice * (nCancel / nTotal);
  }, [
    originalTicketPrice,
    bookingPassengers.length,
    cancelAllPassengers,
    cancellingPassengers.length,
  ]);

  useEffect(() => {
    let alive = true;

    const applyParsed = (
      parsed: ReturnType<typeof parseFlightCancellationChargesResponse>,
      source: ChargeDisplaySource,
      // notes: string[] = [],
    ) => {
      setCurrency(parsed.currency);
      setSupplierCancellationCharge(parsed.supplierCancellationCharge);
      setAdminCancellationCharge(parsed.adminCancellationCharge);
      setTotalCancellationCharges(parsed.totalCancellationCharges);
      setIsSupplierRefundApplicable(parsed.isSupplierRefundApplicable);
      setChargeDisplaySource(source);
      // setRefundDetailNotes(notes);
    };

    const applyFareRulesFallback = () => {
      const model = fareRulesFeeModel;
      const hasNumeric = Object.values(model.feeByPtc).some(
        (v) => typeof v === "number" && v > 0,
      );
      setCurrency(model.currency);
      // setRefundDetailNotes(model.notes);
      setChargeDisplaySource(
        hasNumeric || model.hasNegOne || model.notes.length > 0
          ? "fareRules"
          : "none",
      );
      setSupplierCancellationCharge(0);
      setAdminCancellationCharge(0);
      setTotalCancellationCharges(0);
      setIsSupplierRefundApplicable(hasNumeric || model.hasNegOne);
    };

    const finish = () => {
      if (alive) setChargesResolved(true);
    };

    if (!bookingReferenceId || !supplierLocator || !issueDate) {
      applyFareRulesFallback();
      finish();
      return () => {
        alive = false;
      };
    }

    (async () => {
      try {
        const response = await getFlightCancellationChargesAsync({
          bookingReferenceId,
          supplierLocator,
          issueDate,
        });
        if (!alive) return;
        const parsed = parseFlightCancellationChargesResponse(
          response,
          fareCurrencyFallback,
        );
        if (isApiCancellationChargesPayloadUsable(response, parsed)) {
          applyParsed(parsed, "api");
          finish();
          return;
        }
      } catch {
        /* fall back to fare rules */
      }
      if (!alive) return;
      applyFareRulesFallback();
      finish();
    })();

    return () => {
      alive = false;
    };
  }, [
    bookingReferenceId,
    supplierLocator,
    issueDate,
    getFlightCancellationChargesAsync,
    fareCurrencyFallback,
    fareRulesDetails,
    fareRulesFeeModel,
  ]);

  useEffect(() => {
    if (!allowPartialCancellation) {
      setCancelAllPassengers(true);
    }
  }, [allowPartialCancellation]);

  useEffect(() => {
    setCancelReasonDetail("");
  }, [cancelReasonId]);

  const clearFieldError = useCallback(
    (fieldPath: string) => {
      setValidationErrors((prev) => {
        if (!hasAttemptedValidation || !prev[fieldPath]) return prev;
        const next = { ...prev };
        delete next[fieldPath];
        return next;
      });
    },
    [hasAttemptedValidation],
  );

  const selectedCancelReasonOption = useMemo(
    () => (cancelReasonOptions ?? []).find((o) => o.value === cancelReasonId),
    [cancelReasonOptions, cancelReasonId],
  );
  const cancelReasonDropdownOptions = useMemo(
    () =>
      (cancelReasonOptions ?? []).map((option) => ({
        id: String(option.value),
        value: String(option.value),
        label: option.label,
      })),
    [cancelReasonOptions],
  );

  const isOtherReasonSelected = useMemo(
    () => isOtherCancelReasonLabel(selectedCancelReasonOption?.label),
    [selectedCancelReasonOption?.label],
  );

  const otherReasonTextAreaRef = useRef<OtherReasonTextAreaRef>(null);

  /** Ant Design theme sets `resize: vertical` on the textarea; override with `!important`. */
  useLayoutEffect(() => {
    if (!isOtherReasonSelected) return;
    const apply = () => {
      otherReasonTextAreaRef.current?.resizableTextArea?.textArea?.style.setProperty(
        "resize",
        "none",
        "important",
      );
    };
    apply();
    const t = window.setTimeout(apply, 0);
    return () => clearTimeout(t);
  }, [isOtherReasonSelected]);

  /** Ticket value for the passenger(s) being cancelled minus charges (never negative). */
  const estimatedRefund = useMemo(
    () => Math.max(0, ticketValueForCancellation - displayedCharges.total),
    [ticketValueForCancellation, displayedCharges.total],
  );

  const handleConfirmCancellation = async () => {
    setHasAttemptedValidation(true);

    const errors: Record<string, string> = {};

    if (!bookingReferenceId || !supplierLocator || !issueDate) {
      errors.session =
        "Missing cancellation details. Open cancellation again from your booking.";
    }

    if (!cancelAllPassengers) {
      if (
        selectedPassengerKeys.length === 0 ||
        selectedPassengerKeys.length >= bookingPassengers.length
      ) {
        errors.passengers =
          "Select at least one passenger to cancel and leave at least one traveller on the booking.";
      }
    }

    if (!cancelReasonId) {
      errors.cancelReason = "Please select a cancellation reason.";
    }

    if (isOtherReasonSelected && !cancelReasonDetail.trim()) {
      errors.otherReason = "Please describe your reason for cancelling.";
    }

    if (!ack1) {
      errors.ack1 = "Please confirm you are authorised to cancel this booking.";
    }
    if (!ack2) {
      errors.ack2 =
        "Please confirm you agree to the Cancellation & Refund Policy.";
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    setValidationErrors({});

    const flightSegments: unknown[] = [];

    const reasonLabel = selectedCancelReasonOption?.label ?? "";
    const trimmedDetail = cancelReasonDetail.trim();
    /** Master listing reason text (e.g. `"Other"`); detail for Other goes in `otherCancelReason`. */
    const cancelreason = reasonLabel;

    const body: FlightCancellationRequest = {
      bookingReferenceId,
      supplierLocator,
      issueDate,
      cancelAllPassengers,
      voidOnly: !cancelAllPassengers,
      doSupplierRefund: true,
      flightSegments,
      cancelreason,
      ...(isOtherReasonSelected && trimmedDetail
        ? { otherCancelReason: trimmedDetail }
        : {}),
      ...(offerId ? { offerId } : {}),
      ...(cancelReasonId ? { cancelId: cancelReasonId } : {}),
    };

    if (!cancelAllPassengers) {
      const selected = bookingPassengers.filter((p, idx) =>
        selectedPassengerKeys.includes(passengerRowKey(p, idx)),
      );
      body.passengers = selected.map((p) => {
        const info = p.passengerInfo || {};
        return {
          passengerKey: p.passengerKey,
          ptc: p.ptc || "ADT",
          passengerInfo: {
            nameTitle: info.nameTitle,
            givenName: info.givenName,
            middleName: info.middleName,
            surname: info.surname,
          },
        };
      });
    }

    try {
      const response = await cancelFlightAsync(body);

      if (response?.meta?.success) {
        toast.success("Flight cancelled successfully");
        setShowCancellationSuccessModal(true);
      } else {
        toast.error(
          response?.meta?.statusMessage?.trim() || "Cancellation failed.",
        );
      }
    } catch (error) {
      const err = extractErrorFromAxiosApiError(error);
      toast.error(err || "Cancellation failed.");
    }
  };

  const handleSuccessModalClose = useCallback(() => {
    setShowCancellationSuccessModal(false);
    navigate(buildMyBookingsUrl({ mode: "flights", status: "cancelled" }));
  }, [navigate]);

  const showDetailsLoader =
    !chargesResolved ||
    isChargesLoading ||
    cancelReasonsLoading ||
    cancelReasonsFetching;

  const passengerCheckboxOptions = useMemo(
    () =>
      bookingPassengers.map((p, idx) => {
        const kind =
          p.ptc === "CHD" ? "Child" : p.ptc === "INF" ? "Infant" : "Adult";
        return {
          value: passengerRowKey(p, idx),
          label: (
            <span className="text-[14px] text-[#0A0C0F]">
              {passengerLabel(p)}{" "}
              <span className="text-[#3D495C]">({kind})</span>
            </span>
          ),
        };
      }),
    [bookingPassengers],
  );

  const summaryCardAssets = useMemo(
    () => ({
      EmirateLogo,
      cabinIcon,
      baggageIcon,
      mealIcon: refundableIcon,
      wifiIcon: durationIcon,
      portIcon: SEAT_ICON,
      entertainmentIcon: PLANE_ICON,
    }),
    [],
  );

  const cancellationSummarySegments = useMemo(() => {
    if (tripForSummary) {
      const built = buildFlightSegmentFromTrip(
        tripForSummary,
        summaryCardAssets,
      );
      if (built.length > 0) return built;
    }
    if (routeLabel && airlineName) {
      return [
        {
          route: routeLabel,
          airlineLogo: "",
          airlineName,
          flightMeta: routeLabel,
          dep: { time: "—", date: "—" },
          arr: { time: "—", date: "—" },
          durationLabel: "—",
        },
      ];
    }
    return [];
  }, [tripForSummary, summaryCardAssets, routeLabel, airlineName]);

  const cancellationSummaryFare = useMemo(() => {
    if (!tripForSummary) return undefined;
    const firstPrice = getPriceCabinClassForFlightSummary(tripForSummary);
    const value = firstPrice?.label ?? firstPrice?._priceClasses?.[0];
    if (!value) return undefined;
    return {
      label: "Fare family",
      value,
    };
  }, [tripForSummary]);

  return (
    <>
      <Loader
        show={showDetailsLoader}
        label="Please wait while we fetch your details"
      />
      <div className="min-h-screen bg-[#F8FAFC] py-10 px-4">
        <div className="mx-auto max-w-[650px]">
          {hasAttemptedValidation && validationErrors.session && (
            <div
              className="mb-4 rounded-[12px] border border-[#E65959] bg-[#FEF2F2] px-4 py-3 text-[13px] text-[#E65959]"
              role="alert"
            >
              {validationErrors.session}
            </div>
          )}

          {cancellationSummarySegments.length > 0 && (
            <div className="mb-5">
              <FlightSummaryCard
                variant="cancellation"
                title="Flight details"
                statusPill="Confirmed"
                segments={cancellationSummarySegments}
                fare={cancellationSummaryFare}
                footerPassengers={
                  passengersLabel ? { value: passengersLabel } : undefined
                }
                footerBookingRef={
                  displayBookingRef ? { value: displayBookingRef } : undefined
                }
              />
            </div>
          )}

          <SectionCard
            title="Select Items to Cancel"
            subtitle={
              allowPartialCancellation
                ? "Cancel the entire trip or only specific passengers."
                : "Cancel this booking."
            }
          >
            <div className="space-y-3">
              <CancelItemCard
                title="Cancel Entire Trip"
                // subtitle={`${airlineName} • ${routeLabel}`}
                selected={cancelAllPassengers}
                onClick={() => {
                  setCancelAllPassengers(true);
                  clearFieldError("passengers");
                }}
              />
              {allowPartialCancellation && (
                <CancelItemCard
                  title="Cancel Selected Passengers"
                  subtitle="Choose who to remove from this booking"
                  selected={!cancelAllPassengers}
                  onClick={() => {
                    setCancelAllPassengers(false);
                    clearFieldError("passengers");
                  }}
                />
              )}
            </div>

            {!cancelAllPassengers &&
              allowPartialCancellation &&
              passengerCheckboxOptions.length > 0 && (
                <div className="mt-5 space-y-2">
                  <span className="block text-[12px] text-[#3D495C] mb-2">
                    Passengers to cancel
                  </span>
                  <Checkbox.Group
                    className={`flex flex-col gap-2 rounded-[10px] p-2 [&_.ant-checkbox-wrapper]:items-start [&_.ant-checkbox-wrapper]:mb-2`}
                    options={passengerCheckboxOptions}
                    value={selectedPassengerKeys}
                    onChange={(vals) => {
                      setSelectedPassengerKeys(vals.map(String));
                      clearFieldError("passengers");
                    }}
                  />
                  {hasAttemptedValidation && validationErrors.passengers && (
                    <p className="text-[12px] text-[#E65959]" role="alert">
                      {validationErrors.passengers}
                    </p>
                  )}
                  <p className="text-[11px] text-[#CE6C22] mt-2">
                    You cannot cancel every passenger here — use “Cancel Entire
                    Trip” to void the whole booking, or leave at least one
                    passenger active.
                  </p>
                </div>
              )}

            <div className="mt-5">
              <label className="block text-[12px] text-[#3D495C] mb-2">
                Select a reason
              </label>
              <div
                className={
                  hasAttemptedValidation && validationErrors.cancelReason
                    ? "pb-3 [&_button]:!bg-white"
                    : "[&_button]:!bg-white"
                }
              >
                <SearchableDropdown
                  value={cancelReasonId ?? ""}
                  onChange={(v) => {
                    setCancelReasonId(v || undefined);
                    clearFieldError("cancelReason");
                    clearFieldError("otherReason");
                  }}
                  placeholder="What’s your reason for cancellation?"
                  options={cancelReasonDropdownOptions}
                  loading={cancelReasonsLoading || cancelReasonsFetching}
                  searchPlaceholder="Search reason..."
                  error={
                    hasAttemptedValidation
                      ? validationErrors.cancelReason
                      : null
                  }
                />
              </div>
              {isOtherReasonSelected && (
                <div className="mt-3">
                  <label className="block text-[12px] text-[#3D495C] mb-2">
                    Please specify your reason (required)
                  </label>
                  <Input.TextArea
                    ref={otherReasonTextAreaRef}
                    value={cancelReasonDetail}
                    onChange={(e) => {
                      setCancelReasonDetail(e.target.value);
                      clearFieldError("otherReason");
                    }}
                    placeholder="Describe why you are cancelling…"
                    rows={4}
                    className="w-full !bg-white"
                    maxLength={2000}
                    status={
                      hasAttemptedValidation && validationErrors.otherReason
                        ? "error"
                        : undefined
                    }
                  />
                  {hasAttemptedValidation && validationErrors.otherReason && (
                    <p className="mt-1 text-[12px] text-[#E65959]" role="alert">
                      {validationErrors.otherReason}
                    </p>
                  )}
                </div>
              )}
            </div>
          </SectionCard>

          <div className="mt-5">
            <SectionCard
              backgroundColor="#FFFFFF"
              title="Refund Calculation"
              subtitle={
                chargeDisplaySource === "api"
                  ? `Live cancellation quote for ${airlineName}.`
                  : chargeDisplaySource === "fareRules"
                    ? `Estimate from fare rules (${airlineName}) — used when no live quote is available.`
                    : `Breakdown for ${airlineName}.`
              }
            >
              <div className="rounded-[12px] space-y-3">
                <SummaryAmountRow
                  label={
                    allowPartialCancellation &&
                    !cancelAllPassengers &&
                    bookingPassengers.length > 1
                      ? "Ticket value (passengers you cancel)"
                      : "Original ticket price"
                  }
                  value={`${displayedCharges.currency} ${
                    !chargesResolved || isChargesLoading
                      ? "…"
                      : ticketValueForCancellation.toFixed(2)
                  }`}
                />

                <SummaryAmountRow
                  label={
                    <span className="text-[#EA0029]">
                      Supplier cancellation charge
                    </span>
                  }
                  value={`- ${displayedCharges.currency} ${
                    !chargesResolved || isChargesLoading
                      ? "Loading..."
                      : displayedCharges.supplier.toFixed(2)
                  }`}
                  valueClassName="font-medium text-[#EA0029] text-[16px]"
                />

                <SummaryAmountRow
                  label={
                    <span className="text-[#EA0029]">
                      Admin cancellation charge
                    </span>
                  }
                  value={`- ${displayedCharges.currency} ${
                    !chargesResolved || isChargesLoading
                      ? "Loading..."
                      : displayedCharges.admin.toFixed(2)
                  }`}
                  valueClassName="font-medium text-[#EA0029] text-[16px]"
                />

                <SummaryAmountRow
                  label="Total cancellation charges"
                  value={`${displayedCharges.currency} ${
                    !chargesResolved || isChargesLoading
                      ? "Loading..."
                      : displayedCharges.total.toFixed(2)
                  }`}
                />

                {!displayedCharges.refundApplicable && (
                  <p className="text-[12px] text-[#9A3412]">
                    Supplier refund may not apply for this fare; confirm with
                    support if unsure.
                  </p>
                )}

                {/* <div className="h-px bg-[#E4E4E7]" /> */}

                <SummaryAmountRow
                  label="Total estimated refund"
                  value={`${displayedCharges.currency} ${
                    !chargesResolved || isChargesLoading
                      ? "…"
                      : estimatedRefund.toFixed(2)
                  }`}
                  valueClassName="text-[16px] font-semibold text-[#0A0C0F]"
                />

                {/* {refundDetailNotes.length > 0 && (
                  <ul className="mt-2 space-y-1 text-[11px] text-[#64748B] list-disc pl-4">
                    {refundDetailNotes.map((line, i) => (
                      <li key={i}>{line}</li>
                    ))}
                  </ul>
                )} */}
              </div>
            </SectionCard>
          </div>

          <div className="mt-6 flex items-center gap-2 text-[12px] text-[#3D495C] px-16">
            <span className="mt-[2px]">
              <img alt="info" src={InfoPrimary} className="w-7 h-7" />
            </span>
            <p>
              This action is irreversible. Once you click "Confirm
              Cancellation," your seats will be released immediately and cannot
              be reclaimed at the same price.
            </p>
          </div>

          <div className="mt-6 space-y-5">
            <AcknowledgementCheckbox
              checked={ack1}
              onChange={(e) => {
                setAck1(e.target.checked);
                clearFieldError("ack1");
              }}
              error={hasAttemptedValidation ? validationErrors.ack1 : undefined}
            >
              I confirm that I am the lead passenger or have the authority to
              cancel this booking.
            </AcknowledgementCheckbox>

            <AcknowledgementCheckbox
              checked={ack2}
              onChange={(e) => {
                setAck2(e.target.checked);
                clearFieldError("ack2");
              }}
              error={hasAttemptedValidation ? validationErrors.ack2 : undefined}
            >
              I have read and agree to the{" "}
              <Link
                to="/refund-cancellation-policy"
                className="text-[#2351A3] hover:underline"
                onClick={(e) => e.stopPropagation()}
              >
                Cancellation & Refund Policy
              </Link>
            </AcknowledgementCheckbox>
          </div>

          <div className="mt-10 flex justify-center">
            <Button
              type="button"
              disabled={isCancelling}
              className="box-border inline-flex w-[min(100%,450px)] shrink-0 items-center justify-center gap-2 whitespace-nowrap text-[15px] font-semibold text-white"
              style={{
                background:
                  "linear-gradient(90.59deg, #5383DA 0%, #2351A3 50%, #081326 100%)",
                height: "47px",
                borderRadius: "100px",
              }}
              overrideClasses
              onClick={handleConfirmCancellation}
            >
              {isCancelling
                ? "Cancelling…"
                : "Confirm Cancellation & Process Refund"}
            </Button>
          </div>

          <div className="mt-6">
            {/* {passengersLabel ? `Passengers: ${passengersLabel}` : ""} */}
            <div className="text-[18px] text-[#0A0C0F] font-bold">
              Contact Us:
            </div>
            <p className="text-[18px] mt-1 text-[#0A0C0F]">
              If you have any questions about this page, check FAQs or please
              contact us{" "}
              <Link
                to="/customer-support"
                className="text-[#2351A3] hover:underline cursor-pointer"
                onClick={(e) => e.stopPropagation()}
              >
                here
              </Link>
              .
            </p>
          </div>
        </div>
      </div>
      <ConfirmationModal
        open={showCancellationSuccessModal}
        title="Cancellation Confirmed"
        subtitle=""
        description="Your ticket has been cancelled successfully."
        note="Any applicable refund will be processed according to the airline rules and your payment method timeline."
        noteVariant="error"
        confirmText="OK"
        showCancelButton={false}
        onConfirm={handleSuccessModalClose}
        onCancel={handleSuccessModalClose}
      />
    </>
  );
};

export default FlightCancellationPage;
