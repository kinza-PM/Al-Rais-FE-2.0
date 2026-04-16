import React, { useEffect, useMemo, useState } from "react";
import { Checkbox, Select } from "antd";
import { useLocation, useNavigate } from "react-router-dom";
import Button from "../components/atoms/Button";
import {
  useFlightCancellation,
  useFlightCancellationCharges,
} from "../hooks/useFlightCancellation";
import { extractErrorFromAxiosApiError } from "../utils/apiErrorHanlder";
import toast from "react-hot-toast";
import { buildMyBookingsUrl } from "../utils/myBookingsUrl";

const cancelReasonOptions = [
  { value: "change_of_plans", label: "Change of plans" },
  { value: "found_better_price", label: "Found a better price" },
  { value: "visa_issue", label: "Visa issue" },
  { value: "medical_reason", label: "Medical reason" },
  { value: "schedule_change", label: "Schedule change" },
  { value: "other", label: "Other" },
];

type RefundPreference = "original" | "voucher";

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

  const {
    mutateAsync: getFlightCancellationChargesAsync,
    isPending: isChargesLoading,
  } = useFlightCancellationCharges();

  const {
    mutateAsync: cancelFlightAsync,
    isPending: isCancelling,
  } = useFlightCancellation();

  const [cancelReason, setCancelReason] = useState<string | undefined>();
  const [refundPreference, setRefundPreference] =
    useState<RefundPreference>("voucher");
  const [ack1, setAck1] = useState(false);
  const [ack2, setAck2] = useState(false);

  const [currency, setCurrency] = useState("USD");
  const [carrierFee, setCarrierFee] = useState(0);
  const [cancellationPenalty, setCancellationPenalty] = useState(0);

  useEffect(() => {
    const init = async () => {
      if (!bookingReferenceId || !supplierLocator || !issueDate) return;

      try {
        const response = await getFlightCancellationChargesAsync({
          bookingReferenceId,
          supplierLocator,
          issueDate,
        });

        const firstItem = response?.data?.[0];

        setCurrency(firstItem?.currency || "USD");
        setCarrierFee(Number(firstItem?.nonRefundableCarrierFees || 0));
        setCancellationPenalty(Number(firstItem?.cancellationPenalty || 0));
      } catch (error) {
        const err = extractErrorFromAxiosApiError(error);
        toast.error(err || "Failed to fetch flight cancellation charges");
      }
    };

    init();
  }, [
    bookingReferenceId,
    supplierLocator,
    issueDate,
    getFlightCancellationChargesAsync,
  ]);

  const totalDeduction = useMemo(
    () => carrierFee + cancellationPenalty,
    [carrierFee, cancellationPenalty],
  );

  const estimatedRefund = useMemo(
    () => Math.max(0, originalTicketPrice - totalDeduction),
    [originalTicketPrice, totalDeduction],
  );

  const voucherRefund = useMemo(
    () => estimatedRefund + estimatedRefund * 0.05,
    [estimatedRefund],
  );

  const canSubmit = !!cancelReason && ack1 && ack2;

  const handleConfirmCancellation = async () => {
    if (!bookingReferenceId || !supplierLocator || !issueDate) {
      toast.error("Missing cancellation details");
      return;
    }

    try {
      const response = await cancelFlightAsync({
        bookingReferenceId,
        supplierLocator,
        issueDate,
        cancelReason: cancelReason || "",
        refundPreference,
      });

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

        <div className="mt-5">
          <SectionCard
            title="Refund Calculation"
            subtitle={`Based on your fare rules (${airlineName}), here is your breakdown:`}
          >
            <div className="rounded-[12px] border border-[#E4E4E7] bg-[#F8FAFC] px-4 py-4 space-y-3">
              <div className="flex items-center justify-between text-[14px]">
                <span className="text-[#3D495C]">Original Ticket Price</span>
                <span className="font-medium text-[#0A0C0F]">
                  {currency} {originalTicketPrice.toFixed(2)}
                </span>
              </div>

              <div className="flex items-center justify-between text-[14px]">
                <span className="text-[#EA0029]">Non-refundable Carrier Fees</span>
                <span className="font-medium text-[#EA0029]">
                  - {currency}{" "}
                  {isChargesLoading ? "Loading..." : carrierFee.toFixed(2)}
                </span>
              </div>

              <div className="flex items-center justify-between text-[14px]">
                <span className="text-[#EA0029]">Cancellation Penalty</span>
                <span className="font-medium text-[#EA0029]">
                  - {currency}{" "}
                  {isChargesLoading ? "Loading..." : cancellationPenalty.toFixed(2)}
                </span>
              </div>

              <div className="h-px bg-[#E4E4E7]" />

              <div className="flex items-center justify-between text-[14px]">
                <span className="text-[#3D495C]">Total Estimated Refund</span>
                <span className="text-[18px] font-semibold text-[#0A0C0F]">
                  {currency} {estimatedRefund.toFixed(2)}
                </span>
              </div>
            </div>
          </SectionCard>
        </div>

        <div className="mt-5">
          <SectionCard
            title="Refund Preference"
            subtitle="Please choose how you would like to receive your funds."
          >
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => setRefundPreference("original")}
                className={`w-full rounded-[12px] border px-4 py-5 text-center transition-all ${
                  refundPreference === "original"
                    ? "border-[#2351A3] bg-[#EEF4FF]"
                    : "border-[#E4E4E7] bg-white"
                }`}
              >
                <div className="text-[15px] font-semibold text-[#0A0C0F]">
                  Original Payment Method
                </div>
                <div className="mt-2 text-[13px] text-[#3D495C]">
                  Refund will be credited to your original payment method.
                </div>
                <div className="mt-2 text-[12px] text-[#5383DA]">
                  Estimated Processing Time: 7–10 Business Days.
                </div>
              </button>

              <button
                type="button"
                onClick={() => setRefundPreference("voucher")}
                className={`w-full rounded-[12px] border px-4 py-5 text-center transition-all ${
                  refundPreference === "voucher"
                    ? "border-[#2351A3] bg-[#EEF4FF]"
                    : "border-[#E4E4E7] bg-white"
                }`}
              >
                <div className="text-[15px] font-semibold text-[#2351A3]">
                  Travel Voucher (Fastest)
                </div>
                <div className="mt-2 text-[13px] text-[#2351A3]">
                  Receive {currency} {voucherRefund.toFixed(2)} (Original Refund +
                  5% Bonus)
                </div>
                <div className="mt-2 text-[12px] text-[#5383DA]">
                  Valid for 24 months. Issued via email within 2 hours.
                </div>
              </button>
            </div>
          </SectionCard>
        </div>

        <div className="mt-6 flex items-start gap-2 text-[12px] text-[#3D495C]">
          <span className="mt-[2px] text-[#2351A3]">ⓘ</span>
          <p>
            This action is irreversible. Once you click “Confirm Cancellation,”
            your seats will be released immediately and cannot be reclaimed at
            the same price.
          </p>
        </div>

        <div className="mt-6 space-y-5">
          <Checkbox checked={ack1} onChange={(e) => setAck1(e.target.checked)}>
            <span className="text-[14px] text-[#3D495C]">
              I confirm that I am the lead passenger or have the authority to
              cancel this booking.
            </span>
          </Checkbox>

          <Checkbox checked={ack2} onChange={(e) => setAck2(e.target.checked)}>
            <span className="text-[14px] text-[#3D495C]">
              I have read and agree to the{" "}
              <span className="text-[#2351A3]">Cancellation & Refund Policy</span>
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
            {isCancelling
              ? "Cancelling..."
              : "Confirm Cancellation & Process Refund"}
          </Button>
        </div>

        <div className="mt-4 text-center text-[12px] text-[#3D495C]">
          {passengersLabel ? `Passengers: ${passengersLabel}` : ""}
        </div>
      </div>
    </div>
  );
};

export default FlightCancellationPage;