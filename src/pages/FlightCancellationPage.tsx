import React, { useEffect, useMemo, useState } from "react";
import { Checkbox, Select } from "antd";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Button from "../components/atoms/Button";
import Loader from "../components/atoms/Loader";
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

type ChargeDisplaySource = "api" | "fareRules" | "none";

function SectionCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-[16px] border border-[#C2CAD6] bg-white overflow-hidden">
      <div className="px-4 pt-4 pb-3">
        <h3 className="text-[18px] font-semibold text-[#0A0C0F]">{title}</h3>
        {subtitle && (
          <p className="mt-1 text-[12px] text-[#3D495C]">{subtitle}</p>
        )}
      </div>
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
    <button
      type="button"
      onClick={onClick}
      className={`w-full rounded-[10px] border px-4 py-4 text-center transition-all ${
        selected
          ? "border-[#EA0029] bg-[#FFB8C4]"
          : "border-[#E4E4E7] bg-white hover:border-[#EA0029]/50"
      }`}
    >
      <div className="text-[14px] font-semibold text-[#EA0029]">{title}</div>
      {subtitle && (
        <div className="mt-1 text-[13px] text-[#EA0029]">{subtitle}</div>
      )}
    </button>
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

const FlightCancellationPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const myBookingsSearch = location.state?.myBookingsSearch as string | undefined;

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
  const [refundDetailNotes, setRefundDetailNotes] = useState<string[]>([]);
  const [chargesResolved, setChargesResolved] = useState(false);

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
  }, [
    bookingPassengers,
    cancelAllPassengers,
    selectedPassengerKeys,
  ]);

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
      notes: string[] = [],
    ) => {
      setCurrency(parsed.currency);
      setSupplierCancellationCharge(parsed.supplierCancellationCharge);
      setAdminCancellationCharge(parsed.adminCancellationCharge);
      setTotalCancellationCharges(parsed.totalCancellationCharges);
      setIsSupplierRefundApplicable(parsed.isSupplierRefundApplicable);
      setChargeDisplaySource(source);
      setRefundDetailNotes(notes);
    };

    const applyFareRulesFallback = () => {
      const model = fareRulesFeeModel;
      const hasNumeric = Object.values(model.feeByPtc).some(
        (v) => typeof v === "number" && v > 0,
      );
      setCurrency(model.currency);
      setRefundDetailNotes(model.notes);
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

  /** Ticket value for the passenger(s) being cancelled minus charges (never negative). */
  const estimatedRefund = useMemo(
    () => Math.max(0, ticketValueForCancellation - displayedCharges.total),
    [ticketValueForCancellation, displayedCharges.total],
  );

  const partialSelectionOk =
    !cancelAllPassengers &&
    bookingPassengers.length > 1 &&
    selectedPassengerKeys.length > 0 &&
    selectedPassengerKeys.length < bookingPassengers.length;

  const canSubmit =
    !!cancelReasonId &&
    ack1 &&
    ack2 &&
    (cancelAllPassengers || partialSelectionOk);

  const handleConfirmCancellation = async () => {
    if (!bookingReferenceId || !supplierLocator || !issueDate) {
      toast.error("Missing cancellation details");
      return;
    }

    if (!cancelAllPassengers) {
      if (
        selectedPassengerKeys.length === 0 ||
        selectedPassengerKeys.length >= bookingPassengers.length
      ) {
        toast.error(
          "Select at least one passenger and leave at least one traveller on the booking.",
        );
        return;
      }
    }

    const flightSegments: unknown[] = [];

    const reasonLabel =
      (cancelReasonOptions ?? []).find((o) => o.value === cancelReasonId)
        ?.label ?? "";

    const body: FlightCancellationRequest = {
      bookingReferenceId,
      supplierLocator,
      issueDate,
      cancelAllPassengers,
      voidOnly: !cancelAllPassengers,
      doSupplierRefund: true,
      flightSegments,
      cancelreason: reasonLabel,
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
        navigate(buildMyBookingsUrl({ mode: "flights", status: "all" }));
      } else {
        toast.error(response?.meta?.statusMessage || "Cancellation failed");
      }
    } catch (error) {
      const err = extractErrorFromAxiosApiError(error);
      toast.error(err || "Cancellation failed");
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-10 px-4">
      <div className="mx-auto max-w-[650px]">
        <Button
          type="button"
          onClick={() =>
            navigate(
              myBookingsSearch
                ? `/my-bookings${myBookingsSearch}`
                : buildMyBookingsUrl({ mode: "flights", status: "all" }),
            )
          }
          className="mb-5 bg-transparent border-none p-0 text-[14px] font-semibold text-[#5383DA] hover:underline"
          overrideClasses
        >
          ← Back to My Bookings
        </Button>
        <SectionCard
          title="Select Items to Cancel"
          subtitle="You can cancel the entire trip or specific segments/passengers."
        >
          <div className="space-y-3">
            <CancelItemCard
              title="Cancel Entire Trip"
              subtitle={`${airlineName} • ${routeLabel}`}
              selected={true}
              onClick={() => {}}
            />
          </div>

          <div className="mt-5 flex items-start gap-2 text-[12px] text-[#3D495C]">
            <span className="mt-[2px] text-[#2351A3]">ⓘ</span>
            <p>
              Your current trip doesn't support cancellation of
              segments/passengers separately.
            </p>
          </div>

          <div className="mt-5">
            <label className="block text-[12px] text-[#3D495C] mb-2">
              Select a reason
            </label>
            <Select
              value={cancelReason}
              onChange={setCancelReason}
              placeholder="What’s your reason for cancellation?"
              className="w-full"
              options={cancelReasonOptions}
              size="large"
            />
          </div>
        </SectionCard>
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

  return (
    <>
      <Loader
        show={showDetailsLoader}
        label="Please wait while we fetch your details"
      />
      <div className="min-h-screen bg-[#F8FAFC] py-10 px-4">
        <div className="mx-auto max-w-[650px]">
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
                subtitle={`${airlineName} • ${routeLabel}`}
                selected={cancelAllPassengers}
                onClick={() => setCancelAllPassengers(true)}
              />
              {allowPartialCancellation && (
                <CancelItemCard
                  title="Cancel Selected Passengers"
                  subtitle="Choose who to remove from this booking"
                  selected={!cancelAllPassengers}
                  onClick={() => setCancelAllPassengers(false)}
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
                    className="flex flex-col gap-2 [&_.ant-checkbox-wrapper]:items-start [&_.ant-checkbox-wrapper]:mb-2"
                    options={passengerCheckboxOptions}
                    value={selectedPassengerKeys}
                    onChange={(vals) =>
                      setSelectedPassengerKeys(vals.map(String))
                    }
                  />
                  <p className="text-[11px] text-[#3D495C] mt-2">
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
              <Select
                value={cancelReasonId}
                onChange={(v) => setCancelReasonId(v)}
                placeholder="What’s your reason for cancellation?"
                className="w-full"
                options={cancelReasonOptions}
                loading={cancelReasonsLoading || cancelReasonsFetching}
                size="large"
              />
            </div>
          </SectionCard>

          <div className="mt-5">
            <SectionCard
              title="Refund Calculation"
              subtitle={
                chargeDisplaySource === "api"
                  ? `Live cancellation quote for ${airlineName}.`
                  : chargeDisplaySource === "fareRules"
                    ? `Estimate from fare rules (${airlineName}) — used when no live quote is available.`
                    : `Breakdown for ${airlineName}.`
              }
            >
              <div className="rounded-[12px] border border-[#E4E4E7] bg-[#F8FAFC] px-4 py-4 space-y-3">
                {/* {chargeDisplaySource === "fareRules" && (
                <p className="text-[12px] text-[#92400E] bg-[#FFFBEB] border border-[#FDE68A] rounded-lg px-3 py-2">
                  Showing penalty amounts parsed from your ticket&apos;s fare
                  rules. Times and conditions (e.g. hours before departure) may
                  change the actual fee; −1 in rule data means the airline sets
                  the amount outside automated pricing.
                </p>
              )} */}

                <div className="flex items-center justify-between text-[14px]">
                  <span className="text-[#3D495C]">
                    {allowPartialCancellation &&
                    !cancelAllPassengers &&
                    bookingPassengers.length > 1
                      ? "Ticket value (passengers you cancel)"
                      : "Original ticket price"}
                  </span>
                  <span className="font-medium text-[#0A0C0F]">
                    {displayedCharges.currency}{" "}
                    {!chargesResolved || isChargesLoading
                      ? "…"
                      : ticketValueForCancellation.toFixed(2)}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[14px]">
                  <span className="text-[#EA0029]">
                    Supplier cancellation charge
                  </span>
                  <span className="font-medium text-[#EA0029]">
                    - {displayedCharges.currency}{" "}
                    {!chargesResolved || isChargesLoading
                      ? "Loading..."
                      : displayedCharges.supplier.toFixed(2)}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[14px]">
                  <span className="text-[#EA0029]">
                    Admin cancellation charge
                  </span>
                  <span className="font-medium text-[#EA0029]">
                    - {displayedCharges.currency}{" "}
                    {!chargesResolved || isChargesLoading
                      ? "Loading..."
                      : displayedCharges.admin.toFixed(2)}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[14px]">
                  <span className="text-[#3D495C]">
                    Total cancellation charges
                  </span>
                  <span className="font-medium text-[#0A0C0F]">
                    {displayedCharges.currency}{" "}
                    {!chargesResolved || isChargesLoading
                      ? "Loading..."
                      : displayedCharges.total.toFixed(2)}
                  </span>
                </div>

                {!displayedCharges.refundApplicable && (
                  <p className="text-[12px] text-[#9A3412]">
                    Supplier refund may not apply for this fare; confirm with
                    support if unsure.
                  </p>
                )}

                <div className="h-px bg-[#E4E4E7]" />

                <div className="flex items-center justify-between text-[14px]">
                  <span className="text-[#3D495C]">Total estimated refund</span>
                  <span className="text-[18px] font-semibold text-[#0A0C0F]">
                    {displayedCharges.currency}{" "}
                    {!chargesResolved || isChargesLoading
                      ? "…"
                      : estimatedRefund.toFixed(2)}
                  </span>
                </div>

                {refundDetailNotes.length > 0 && (
                  <ul className="mt-2 space-y-1 text-[11px] text-[#64748B] list-disc pl-4">
                    {refundDetailNotes.map((line, i) => (
                      <li key={i}>{line}</li>
                    ))}
                  </ul>
                )}
              </div>
            </SectionCard>
          </div>

          <div className="mt-6 flex items-start gap-2 text-[12px] text-[#3D495C]">
            <span className="mt-[2px] text-[#2351A3]">ⓘ</span>
            <p>
              This action is irreversible. Once you click “Confirm
              Cancellation,” your seats will be released immediately and cannot
              be reclaimed at the same price.
            </p>
          </div>

          <div className="mt-6 space-y-5">
            <Checkbox
              checked={ack1}
              onChange={(e) => setAck1(e.target.checked)}
            >
              <span className="text-[14px] text-[#3D495C]">
                I confirm that I am the lead passenger or have the authority to
                cancel this booking.
              </span>
            </Checkbox>

            <Checkbox
              checked={ack2}
              onChange={(e) => setAck2(e.target.checked)}
            >
              <span className="text-[14px] text-[#3D495C]">
                I have read and agree to the{" "}
                <Link
                  to="/refund-cancellation-policy"
                  className="text-[#2351A3] hover:underline"
                  onClick={(e) => e.stopPropagation()}
                >
                  Cancellation & Refund Policy
                </Link>
              </span>
            </Checkbox>
          </div>

          <div className="mt-10 flex justify-center">
            <Button
              type="button"
              disabled={!canSubmit || isCancelling}
              className={`text-white text-[15px] font-semibold ${
                !canSubmit ? "opacity-50 cursor-not-allowed" : ""
              }`}
              style={{
                background:
                  "linear-gradient(90.59deg, #5383DA 0%, #2351A3 50%, #081326 100%)",
                width: "320px",
                height: "47px",
                borderRadius: "100px",
              }}
              overrideClasses
              onClick={handleConfirmCancellation}
            >
              {isCancelling ? "Cancelling..." : "Confirm Cancellation"}
            </Button>
          </div>

          <div className="mt-4 text-center text-[12px] text-[#3D495C]">
            {passengersLabel ? `Passengers: ${passengersLabel}` : ""}
          </div>
        </div>
      </div>
    </>
  );
};

export default FlightCancellationPage;
