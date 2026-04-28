import React, { useMemo, useState } from "react";
import { Checkbox, Select } from "antd";
import { InfoCircleOutlined } from "@ant-design/icons";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Button from "../components/atoms/Button";
import { useActivitiesCancelBooking } from "../hooks/sightseeing/useActivitiesBooking";
import {
  buildActivitiesCancelBookingBody,
  isActivitiesCancelSuccessful,
} from "../services/api/activitiesSearch";
import { extractErrorFromAxiosApiError } from "../utils/apiErrorHanlder";
import { markSightseeingBookingCancelled } from "../utils/sightseeingLocalBookings";
import toast from "react-hot-toast";
import type { BookingStatus } from "../components/molecules/UserBookingsListing";
import { readSightseeingCardPreview } from "../features/sightseeing/sightseeingBooking";

const cancelReasonOptions = [
  { value: "change_of_plans", label: "Change of plans" },
  { value: "found_better_price", label: "Found a better price" },
  { value: "visa_issue", label: "Visa issue" },
  { value: "medical_reason", label: "Medical reason" },
  { value: "other", label: "Other" },
];

type CancelLocationState = {
  bookingReferenceId?: string;
  activityTitle?: string;
  bookingKey?: string;
  clientReference?: string;
  cancellationDeadline?: string;
  cancellationDeadlineDate?: string;
  totalPaid?: number;
  currency?: string;
  tourDateDisplay?: string;
  pickupTimeDisplay?: string;
  travellersSummary?: string;
  packageSummary?: string;
  activityDurationDisplay?: string;
  /** e.g. City, country under title */
  locationLine?: string;
  bookingStatus?: BookingStatus;
  activityCode?: string;
  /** Dynamic refund breakdown when supplier/API provides it */
  nonRefundableFees?: number;
  cancellationPenalty?: number;
};

function DetailField({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <div className="text-[11px] font-normal leading-tight text-[#64748B] mb-1">
        {label}
      </div>
      <div className="text-[13px] font-semibold text-[#0A0C0F] leading-snug break-words">
        {value}
      </div>
    </div>
  );
}

/** Figma: 576×… cards, radius 16px, 1.5px #C2CAD6 */
const FIGMA_CARD =
  "w-full max-w-[576px] mx-auto box-border rounded-[16px] border-[1.5px] border-solid border-[#C2CAD6] overflow-hidden";
const FIGMA_PAD_X = "px-[15px]";

function FigmaDivider() {
  return (
    <div
      className="h-px w-full shrink-0 bg-[#E4E4E7]"
      style={{ border: "none" }}
      aria-hidden
    />
  );
}

function StatusPill({ status }: { status: BookingStatus }) {
  if (status === "Cancelled") {
    return (
      <span
        className="inline-flex items-center justify-center px-3 text-[11px] font-semibold text-[#9A3412]"
        style={{
          background: "#FFEDD5",
          minHeight: "28px",
          borderRadius: "100px",
        }}
      >
        Cancelled
      </span>
    );
  }
  if (status === "Confirmed") {
    return (
      <span
        className="inline-flex items-center justify-center px-3 text-[11px] font-semibold text-[#065F46]"
        style={{
          background: "#D1FAE5",
          minHeight: "28px",
          borderRadius: "100px",
        }}
      >
        Confirmed
      </span>
    );
  }
  if (status === "Pending") {
    return (
      <span
        className="inline-flex max-w-[calc(100vw-2rem)] items-center justify-center whitespace-nowrap rounded-full bg-[#FFE4E6] px-4 py-2 text-center text-[12px] font-medium leading-none text-[#B91C1C]"
      >
        Pending payment
      </span>
    );
  }
  return (
    <span
      className="inline-flex items-center justify-center px-3 text-[11px] font-semibold text-[#3D495C]"
      style={{
        background: "#E4E4E7",
        minHeight: "28px",
        borderRadius: "100px",
      }}
    >
      Expired
    </span>
  );
}

function formatMoney(amount: number, currency: string) {
  const c = (currency || "AED").trim().toUpperCase();
  try {
    return new Intl.NumberFormat("en-AE", {
      style: "currency",
      currency: c.length === 3 ? c : "AED",
      maximumFractionDigits: 2,
    }).format(Number(amount || 0));
  } catch {
    return `${currency} ${Number(amount || 0).toFixed(2)}`;
  }
}

/** Figma refund rows: gray neutral labels except deductions (red); bold values */
function RefundCalcRow({
  label,
  valueText,
  variant,
}: {
  label: string;
  valueText: string;
  variant: "original" | "deduction" | "total";
}) {
  const labelClass =
    variant === "deduction"
      ? "text-[13px] font-medium leading-snug text-[#DC2626]"
      : variant === "total"
        ? "text-[13px] font-medium leading-snug text-[#64748B]"
        : "text-[13px] font-normal leading-snug text-[#64748B]";
  const valueClass =
    variant === "deduction"
      ? "text-right text-[13px] font-bold tabular-nums leading-snug text-[#DC2626]"
      : variant === "total"
        ? "text-right text-[15px] font-bold tabular-nums leading-snug text-[#0A0C0F]"
        : "text-right text-[13px] font-bold tabular-nums leading-snug text-[#0A0C0F]";
  return (
    <div className="flex items-start justify-between gap-4">
      <span className={`min-w-0 ${labelClass}`}>{label}</span>
      <span className={`shrink-0 ${valueClass}`}>{valueText}</span>
    </div>
  );
}

const SightseeingCancellationPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = (location.state || {}) as CancelLocationState;

  const bookingReferenceId = (state.bookingReferenceId || "").trim();
  const activityTitle = state.activityTitle || "Sightseeing activity";
  const bookingKey = state.bookingKey || "";
  const clientReference = state.clientReference || "";
  const cancellationDeadline = state.cancellationDeadline;
  const totalPaidFromBooking =
    typeof state.totalPaid === "number" && state.totalPaid > 0
      ? state.totalPaid
      : undefined;
  const currencyFromBooking = state.currency?.trim() || "AED";
  const tourDateDisplay = state.tourDateDisplay || "";
  const pickupTimeDisplay = (state.pickupTimeDisplay || "").trim();
  const travellersSummary = state.travellersSummary || "—";
  const packageSummary =
    state.packageSummary && state.packageSummary !== "—"
      ? state.packageSummary
      : "—";
  const activityCodeNav = (state.activityCode || "").trim();
  const cardPreview = activityCodeNav
    ? readSightseeingCardPreview(activityCodeNav)
    : undefined;
  const activityDuration =
    state.activityDurationDisplay?.trim() ||
    cardPreview?.durationLabel?.trim() ||
    "—";
  const locationLine = (state.locationLine || "").trim();
  const bookingStatus: BookingStatus = state.bookingStatus || "Confirmed";

  const { mutateAsync: cancelActivity, isPending: isCancelling } =
    useActivitiesCancelBooking();

  const [cancelReason, setCancelReason] = useState<string | undefined>();
  const [ackLead, setAckLead] = useState(false);
  const [ackPolicy, setAckPolicy] = useState(false);
  const [refundPreference, setRefundPreference] = useState<
    "original" | "voucher"
  >("original");

  const packageShortName = useMemo(() => {
    const p = packageSummary;
    if (!p || p === "—") return "your package";
    const idx = p.indexOf("(");
    const name = (idx > 0 ? p.slice(0, idx) : p).trim();
    return name || "your package";
  }, [packageSummary]);

  const pickupLine = useMemo(() => {
    const date =
      tourDateDisplay && tourDateDisplay !== "—" ? tourDateDisplay : null;
    const time =
      pickupTimeDisplay && pickupTimeDisplay !== "—" ? pickupTimeDisplay : null;
    const joined = [date, time].filter(Boolean).join(" • ");
    return joined || "—";
  }, [tourDateDisplay, pickupTimeDisplay]);

  const feesFromApi =
    typeof state.nonRefundableFees === "number" && state.nonRefundableFees >= 0
      ? state.nonRefundableFees
      : 0;
  const penaltyFromApi =
    typeof state.cancellationPenalty === "number" &&
    state.cancellationPenalty >= 0
      ? state.cancellationPenalty
      : 0;

  /** Dynamic breakdown: paid total from booking; fees/penalty from API when mapped */
  const refundLines = useMemo(() => {
    const hasKnownTotal =
      totalPaidFromBooking != null && totalPaidFromBooking > 0;
    const original = hasKnownTotal ? totalPaidFromBooking! : 0;
    const carrierFees = hasKnownTotal ? feesFromApi : 0;
    const penalty = hasKnownTotal ? penaltyFromApi : 0;
    const refund = hasKnownTotal
      ? Math.max(0, original - carrierFees - penalty)
      : 0;
    return {
      original,
      carrierFees,
      penalty,
      refund,
      hasKnownTotal,
    };
  }, [totalPaidFromBooking, feesFromApi, penaltyFromApi]);

  const canSubmit =
    !!cancelReason &&
    ackLead &&
    ackPolicy &&
    refundPreference === "original" &&
    !!bookingReferenceId;

  const handleFinalizeCancellation = async () => {
    if (!bookingReferenceId) return;
    if (refundPreference !== "original") {
      toast.error(
        "Travel voucher refunds are not available online yet. Please choose Original Payment Method.",
      );
      return;
    }
    try {
      const body = buildActivitiesCancelBookingBody({
        bookingReferenceId,
        bookingKey: bookingKey || undefined,
        clientReference: clientReference || undefined,
        cancellationReason: cancelReason,
      });

      const response = await cancelActivity(body);

      if (isActivitiesCancelSuccessful(response)) {
        markSightseeingBookingCancelled(bookingReferenceId);
        const cr = clientReference?.trim();
        if (cr && cr !== bookingReferenceId) {
          markSightseeingBookingCancelled(cr);
        }
        toast.success("Your sightseeing booking was cancelled.");
        navigate("/my-bookings", {
          replace: true,
          state: { mode: "Sightseeing" },
        });
        return;
      }

      const msg =
        (response && typeof response === "object"
          ? String(
              (response as Record<string, unknown>).message ??
                ((response as Record<string, unknown>).meta as Record<
                  string,
                  unknown
                >)?.statusMessage ??
                "",
            )
          : "") || "Cancellation could not be completed.";
      toast.error(msg.trim() || "Cancellation could not be completed.");
    } catch (error) {
      const err = extractErrorFromAxiosApiError(error);
      toast.error(err || "Cancellation failed.");
    }
  };

  if (!bookingReferenceId) {
    return (
      <div className="min-h-screen bg-[#F2F2F3] py-12 px-4 sm:py-16 font-[Inter,sans-serif]">
        <div className="mx-auto max-w-[576px] rounded-[16px] border-[1.5px] border-solid border-[#C2CAD6] bg-white px-5 py-10 text-center">
          <h1 className="text-[18px] font-semibold text-[#0A0C0F]">
            Unable to load cancellation
          </h1>
          <p className="mt-2 text-[14px] text-[#64748B] leading-relaxed">
            Open this page from{" "}
            <span className="font-medium text-[#0A0C0F]">My bookings</span> →{" "}
            <span className="font-medium text-[#0A0C0F]">Sightseeing</span>,
            then use{" "}
            <span className="font-medium text-[#0A0C0F]">Cancel booking</span>.
          </p>
          <Link
            to="/my-bookings"
            className="mt-6 inline-flex text-[14px] font-semibold text-[#2351A3] hover:underline"
          >
            Go to My bookings
          </Link>
        </div>
      </div>
    );
  }

  const voucherBonusPct = 0.05;
  const voucherDisplayAmount =
    refundLines.hasKnownTotal
      ? refundLines.refund * (1 + voucherBonusPct)
      : 0;

  return (
    <div className="min-h-screen bg-[#F2F2F3] py-6 px-4 pb-12 sm:py-10 font-[Inter,sans-serif]">
      <div className="mx-auto flex w-full max-w-[576px] flex-col gap-5">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="self-start text-[14px] font-semibold text-[#2351A3] hover:underline"
        >
          ← Back
        </button>

        {/* Sightseeing details — Figma: 576×259, #FFF, 1.5px #C2CAD6, inner 1px #E4E4E7 */}
        <div className={`${FIGMA_CARD} bg-white`}>
          <div className={`${FIGMA_PAD_X} pb-4 pt-5`}>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <h2 className="text-[16px] font-semibold text-[#0A0C0F] sm:text-[17px]">
                Sightseeing details
              </h2>
              <div className="shrink-0 sm:pt-0.5">
                <StatusPill status={bookingStatus} />
              </div>
            </div>
          </div>
          <FigmaDivider />
          <div className={`${FIGMA_PAD_X} py-4`}>
            <h3 className="text-[16px] font-bold leading-snug text-[#0A0C0F] sm:text-[17px]">
              {activityTitle}
            </h3>
            <p className="mt-1.5 text-[13px] leading-snug text-[#64748B]">
              {locationLine || "—"}
            </p>
          </div>
          <FigmaDivider />
          <div className={`${FIGMA_PAD_X} grid grid-cols-1 gap-5 py-4 sm:grid-cols-2`}>
            <DetailField label="Pickup date & time" value={pickupLine} />
            <DetailField label="Travelers" value={travellersSummary} />
          </div>
          <FigmaDivider />
          <div className={`${FIGMA_PAD_X} grid grid-cols-1 gap-5 py-4 sm:grid-cols-3`}>
            <DetailField label="Package" value={packageSummary} />
            <DetailField label="Activity time" value={activityDuration} />
            <DetailField
              label="Booking ref. number"
              value={bookingReferenceId}
            />
          </div>
        </div>

        {/* Select items to cancel — Figma: 576×250, bg #F2F2F3 */}
        <div
          className={`${FIGMA_CARD} min-h-[250px] bg-[#F2F2F3]`}
          style={{ boxSizing: "border-box" }}
        >
          <div className={`${FIGMA_PAD_X} pb-5 pt-5`}>
            <h2 className="text-[17px] font-bold text-[#0A0C0F]">
              Select Items to Cancel
            </h2>
            <button
              type="button"
              aria-pressed
              className="mt-4 box-border flex w-full min-h-[65px] items-center justify-center rounded-[8px] border-[1.5px] border-solid border-[#B80020] bg-[#FFB8C4] px-10 py-6 text-center text-[14px] font-semibold text-[#B80020] transition hover:opacity-95"
            >
              Cancel Entire Trip
            </button>
            <div className="mt-5 flex flex-col gap-2.5">
              <label
                htmlFor="sightseeing-cancel-reason"
                className="block text-[12px] font-medium text-[#64748B]"
              >
                Select a reason
              </label>
              <Select
                id="sightseeing-cancel-reason"
                value={cancelReason}
                onChange={setCancelReason}
                placeholder="What's your reason for cancellation?"
                className="w-full sightseeing-cancel-select"
                options={cancelReasonOptions}
                size="large"
              />
            </div>
          </div>
        </div>

        {/* Refund calculation — Figma: white, 215px min */}
        <div className={`${FIGMA_CARD} min-h-[215px] bg-white`}>
          <div className={`${FIGMA_PAD_X} pb-4 pt-5`}>
            <h2 className="text-[17px] font-bold text-[#0A0C0F]">
              Refund Calculation
            </h2>
            <p className="mt-1 text-[13px] leading-snug text-[#64748B]">
              Based on your package ({packageShortName}), here is your
              breakdown:
            </p>
            <div className="mt-5">
              <div className="flex flex-col gap-4">
                <RefundCalcRow
                  label="Original Ticket Price"
                  valueText={
                    refundLines.hasKnownTotal
                      ? formatMoney(
                          refundLines.original,
                          currencyFromBooking,
                        )
                      : "—"
                  }
                  variant="original"
                />
                <RefundCalcRow
                  label="Non-refundable Carrier Fees"
                  valueText={
                    refundLines.hasKnownTotal
                      ? `– ${formatMoney(
                          refundLines.carrierFees,
                          currencyFromBooking,
                        )}`
                      : "—"
                  }
                  variant="deduction"
                />
                <RefundCalcRow
                  label="Cancellation Penalty"
                  valueText={
                    refundLines.hasKnownTotal
                      ? `– ${formatMoney(
                          refundLines.penalty,
                          currencyFromBooking,
                        )}`
                      : "—"
                  }
                  variant="deduction"
                />
              </div>
              <div className="mt-4">
                <RefundCalcRow
                  label="Total Estimated Refund"
                  valueText={
                    refundLines.hasKnownTotal
                      ? formatMoney(
                          refundLines.refund,
                          currencyFromBooking,
                        )
                      : "—"
                  }
                  variant="total"
                />
              </div>
            </div>
            <p className="mt-3 text-[11px] leading-snug text-[#94A3B8]">
              Final refund is confirmed when the supplier processes your
              cancellation
              {cancellationDeadline
                ? ` (free cancellation noted until ${cancellationDeadline}).`
                : "."}
            </p>
          </div>
        </div>

        {/* Refund preference — Figma: 576×327, bg #F2F2F3 */}
        <div className={`${FIGMA_CARD} min-h-[327px] bg-[#F2F2F3]`}>
          <div className={`${FIGMA_PAD_X} pb-5 pt-5`}>
            <h2 className="text-[17px] font-bold text-[#0A0C0F]">
              Refund Preference
            </h2>
            <p className="mt-1 text-[13px] text-[#64748B]">
              Please choose how you would like to receive your funds.
            </p>
            <div className="mt-4">
              <FigmaDivider />
            </div>
            <div className="mt-4 flex flex-col gap-3">
              <button
                type="button"
                onClick={() => setRefundPreference("original")}
                className={`box-border flex min-h-[105px] w-full flex-col items-center justify-center gap-2 rounded-[8px] border-[1.5px] border-solid px-10 py-6 text-center transition ${
                  refundPreference === "original"
                    ? "border-[#2351A3] bg-white shadow-sm"
                    : "border-[#E4E4E7] bg-white hover:border-[#C2CAD6]"
                }`}
                style={{ textAlign: "center" }}
              >
                <div className="text-[15px] font-semibold text-[#0A0C0F]">
                  Original Payment Method
                </div>
                <p className="max-w-md text-[13px] leading-relaxed text-[#64748B]">
                  Refund will be credited to the card used for this booking.
                </p>
                <p className="text-[12px] leading-relaxed text-[#94A3B8]">
                  Estimated Processing Time: 7–10 Business Days.
                </p>
              </button>
              <button
                type="button"
                onClick={() => setRefundPreference("voucher")}
                className={`box-border flex min-h-[105px] w-full flex-col items-center justify-center gap-2 rounded-[8px] border-[1.5px] border-solid px-10 py-6 text-center transition ${
                  refundPreference === "voucher"
                    ? "border-[#2351A3]"
                    : "border-[#E4E4E7] bg-white hover:border-[#C2CAD6]"
                }`}
                style={
                  refundPreference === "voucher"
                    ? {
                        backgroundColor: "rgba(167, 192, 236, 0.3)",
                        borderColor: "rgb(35, 81, 163)",
                        textAlign: "center",
                      }
                    : {
                        backgroundColor: "#FFFFFF",
                        textAlign: "center",
                      }
                }
              >
                <div className="text-[15px] font-semibold text-[#2351A3]">
                  Travel Voucher (Fastest)
                </div>
                {refundLines.hasKnownTotal ? (
                  <>
                    <p className="max-w-md text-[13px] leading-relaxed text-[#2351A3]">
                      Receive{" "}
                      <span className="font-bold">
                        {formatMoney(
                          voucherDisplayAmount,
                          currencyFromBooking,
                        )}
                      </span>{" "}
                      (Original Refund + 5% Bonus).
                    </p>
                    <p className="max-w-md text-[13px] leading-relaxed text-[#3D495C]">
                      Valid for 24 months. Issued via email within 2 hours.
                    </p>
                  </>
                ) : (
                  <p className="max-w-md text-[13px] leading-relaxed text-[#2351A3]">
                    Bonus travel credit when available once a paid amount is on
                    file for this booking.
                  </p>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Irreversible notice */}
        <div className="mx-auto flex w-full max-w-[576px] items-start gap-3 rounded-[12px] border border-[#BFDBFE] bg-[#EFF6FF] px-4 py-3">
          <InfoCircleOutlined
            className="mt-0.5 shrink-0 text-[#2351A3]"
            style={{ fontSize: 18 }}
          />
          <p className="text-[13px] text-[#1E3A5F] leading-relaxed">
            This action is irreversible. Once you click &quot;Confirm
            Cancellation,&quot; your seats will be released immediately and
            cannot be reclaimed at the same price.
          </p>
        </div>

        {/* Confirmations */}
        <div
          className={`mx-auto box-border w-full max-w-[576px] space-y-4 rounded-[16px] border-[1.5px] border-solid border-[#C2CAD6] bg-white py-5 ${FIGMA_PAD_X}`}
        >
          <Checkbox checked={ackLead} onChange={(e) => setAckLead(e.target.checked)}>
            <span className="text-[13px] sm:text-[14px] text-[#3D495C] leading-snug">
              I confirm that I am the lead traveler or have the authority to
              cancel this booking.
            </span>
          </Checkbox>
          <Checkbox
            checked={ackPolicy}
            onChange={(e) => setAckPolicy(e.target.checked)}
          >
            <span className="text-[13px] sm:text-[14px] text-[#3D495C] leading-snug">
              I have read and agree to the{" "}
              <Link
                to="/refund-cancellation-policy"
                className="text-[#2351A3] font-semibold hover:underline"
              >
                Cancellation &amp; Refund Policy
              </Link>
              .
            </span>
          </Checkbox>
        </div>

        <div className="mx-auto flex w-full max-w-[576px] justify-center">
          <Button
            type="button"
            disabled={!canSubmit || isCancelling}
            className={`whitespace-normal text-center text-white ${
              !canSubmit ? "cursor-not-allowed opacity-50" : ""
            }`}
            style={{
              width: "min(100%, 412px)",
              height: "47px",
              minHeight: "47px",
              padding: "14px 40px",
              borderRadius: "100px",
              border: "none",
              background:
                "linear-gradient(90.59deg, #5383DA 0%, #2351A3 50%, #081326 100%)",
              fontFamily: "Inter, sans-serif",
              fontSize: "16px",
              fontWeight: 600,
              letterSpacing: "0.5px",
              lineHeight: "100%",
            }}
            overrideClasses
            onClick={handleFinalizeCancellation}
          >
            {isCancelling
              ? "Processing…"
              : "Confirm Cancellation & Process Refund"}
          </Button>
        </div>
      </div>

      <style>{`
        .sightseeing-cancel-select.ant-select .ant-select-selector {
          border-radius: 8px !important;
          min-height: 48px !important;
          align-items: center;
          border-width: 1.5px !important;
          border-color: #C2CAD6 !important;
          background: #FFFFFF !important;
          padding-inline-end: 40px !important;
        }
        .sightseeing-cancel-select.ant-select:hover .ant-select-selector {
          border-color: #2351A3 !important;
        }
        .sightseeing-cancel-select.ant-select:hover .ant-select-arrow {
          color: #2351A3 !important;
        }
        .sightseeing-cancel-select.ant-select.ant-select-focused .ant-select-arrow,
        .sightseeing-cancel-select.ant-select-open .ant-select-arrow {
          color: #2351A3 !important;
        }
        .sightseeing-cancel-select.ant-select .ant-select-arrow {
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          color: rgba(0, 0, 0, 0.25) !important;
          font-style: normal !important;
          line-height: 1 !important;
          text-align: center !important;
          text-transform: none !important;
          vertical-align: -0.125em !important;
          text-rendering: optimizeLegibility !important;
          -webkit-font-smoothing: antialiased !important;
          -moz-osx-font-smoothing: grayscale !important;
          position: absolute !important;
          top: 50% !important;
          margin-top: 0 !important;
          transform: translateY(-50%) !important;
          inset-inline-start: auto !important;
          inset-inline-end: 11px !important;
          width: 22px !important;
          height: 12px !important;
          font-size: 17px !important;
          pointer-events: none !important;
          transition: color 0.2s ease, opacity 0.3s ease !important;
        }
        .sightseeing-cancel-select.ant-select .ant-select-arrow .anticon {
          display: inline-flex !important;
          align-items: center !important;
          justify-content: center !important;
          font-size: 17px !important;
          line-height: 1 !important;
          width: 1em !important;
          height: 1em !important;
        }
        .sightseeing-cancel-select.ant-select .ant-select-arrow svg {
          width: 1em !important;
          height: 1em !important;
        }
      `}</style>
    </div>
  );
};

export default SightseeingCancellationPage;
