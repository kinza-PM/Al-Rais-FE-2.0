import React, { useEffect, useMemo, useState } from "react";
import { Checkbox, Select } from "antd";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Button from "../components/atoms/Button";
import { useHotelCancellationCharges } from "../hooks/useHotelSearch";
import { useHotelCancellation } from "../hooks/useHotelSearch";
import { extractErrorFromAxiosApiError } from "../utils/apiErrorHanlder";
import toast from "react-hot-toast";

const cancelReasonOptions = [
  { value: "change_of_plans", label: "Change of plans" },
  { value: "found_better_price", label: "Found a better price" },
  { value: "visa_issue", label: "Visa issue" },
  { value: "medical_reason", label: "Medical reason" },
  { value: "other", label: "Other" },
];

type CancelLocationState = {
  bookingReferenceId?: string;
  hotelName?: string;
  bookingKey?: string;
  cancellationDeadline?: string;
  totalPaid?: number;
  currency?: string;
};

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

function formatMoney(amount: number, currency: string) {
  return `${currency} ${Number(amount || 0).toFixed(2)}`;
}

const HotelCancellationPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = (location.state || {}) as CancelLocationState;

  const bookingReferenceId = (state.bookingReferenceId || "").trim();
  const hotelName = state.hotelName || "Hotel Booking";
  const bookingKey = state.bookingKey || "";
  const cancellationDeadline = state.cancellationDeadline;
  const totalPaidFromBooking =
    typeof state.totalPaid === "number" && state.totalPaid > 0
      ? state.totalPaid
      : undefined;
  const currencyFromBooking = state.currency?.trim() || "";

  const {
    mutateAsync: getCancellationChargesAsync,
    isPending: isCancellationChargesLoading,
  } = useHotelCancellationCharges();

  const { mutateAsync: cancelHotelAsync, isPending: isCancelling } =
    useHotelCancellation();

  const [cancelReason, setCancelReason] = useState<string | undefined>();
  const [ack1, setAck1] = useState(false);
  const [ack2, setAck2] = useState(false);
  const [ack3, setAck3] = useState(false);

  const [supplierCharge, setSupplierCharge] = useState(0);
  const [adminCharge, setAdminCharge] = useState(0);
  const [totalCancellationCharges, setTotalCancellationCharges] = useState(0);
  const [chargesCurrency, setChargesCurrency] = useState("AED");

  const displayCurrency = currencyFromBooking || chargesCurrency || "AED";

  useEffect(() => {
    const init = async () => {
      if (!bookingReferenceId) return;

      try {
        const response = await getCancellationChargesAsync({
          command: "cancellationCharges",
          bookingReferenceId,
        });

        const firstItem = response?.data?.[0];
        const firstCharge = firstItem?.cancellationCharge?.[0];

        setSupplierCharge(
          Number(firstCharge?.supplierCancellationCharge ?? 0) || 0,
        );
        setAdminCharge(Number(firstCharge?.adminCancellationCharge ?? 0) || 0);
        setTotalCancellationCharges(
          Number(firstCharge?.totalCancellationCharges ?? 0) || 0,
        );
        setChargesCurrency(firstItem?.currency || "AED");
      } catch (error) {
        const err = extractErrorFromAxiosApiError(error);
        toast.error(err || "Failed to fetch cancellation charges");
      }
    };

    init();
  }, [bookingReferenceId, getCancellationChargesAsync]);

  const estimatedRefundAmount = useMemo(() => {
    if (totalPaidFromBooking == null) return null;
    const fee = totalCancellationCharges || 0;
    return Math.max(0, totalPaidFromBooking - fee);
  }, [totalPaidFromBooking, totalCancellationCharges]);

  const canSubmit = !!cancelReason && ack1 && ack2 && ack3;

  const handleFinalizeCancellation = async () => {
    try {
      const response = await cancelHotelAsync({
        command: "cancel",
        bookingReferenceId,
        bookingKey,
      });

      if (response?.meta?.success) {
        toast.success("Booking cancelled successfully");
        navigate("/my-bookings");
      } else {
        toast.error(response?.meta?.statusMessage || "Cancellation failed");
      }
    } catch (error) {
      const err = extractErrorFromAxiosApiError(error);
      toast.error(err || "Cancellation failed");
    }
  };

  if (!bookingReferenceId) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] py-16 px-4">
        <div className="mx-auto max-w-[650px] rounded-[16px] border border-[#C2CAD6] bg-white px-6 py-10 text-center">
          <h1 className="text-[18px] font-semibold text-[#0A0C0F]">
            Unable to load cancellation
          </h1>
          <p className="mt-2 text-[14px] text-[#3D495C]">
            Open this page from{" "}
            <span className="font-medium text-[#0A0C0F]">My bookings</span> using
            Cancel booking so your reservation details are included.
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

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-10 px-4">
      <div className="mx-auto max-w-[650px]">
        <SectionCard
          title="Select items to cancel"
          subtitle="You can cancel the entire stay for this reservation."
        >
          <div className="space-y-3">
            <CancelItemCard
              title="Cancel entire stay"
              subtitle={hotelName}
              selected={true}
              onClick={() => {}}
            />
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
            title="Cancellation policy"
            subtitle="Rules for this booking depend on the rate and property. Review before you confirm."
          >
            <ul className="list-disc space-y-2 pl-5 text-[13px] text-[#3D495C]">
              {cancellationDeadline ? (
                <li>
                  <span className="font-semibold text-[#0A0C0F]">
                    Free cancellation window:{" "}
                  </span>
                  until {cancellationDeadline}. After that, charges may apply as
                  shown below.
                </li>
              ) : (
                <li>
                  Cancellation and prepayment rules follow the rate you booked.
                  Fees below reflect the supplier&apos;s current cancellation
                  quote for this reservation.
                </li>
              )}
              <li>
                Refunds are usually returned to your original payment method;
                timing depends on your bank (often several business days).
              </li>
            </ul>
            <Link
              to="/refund-cancellation-policy"
              className="mt-4 inline-block text-[13px] font-semibold text-[#2351A3] hover:underline"
            >
              Read full refund & cancellation policy
            </Link>
          </SectionCard>
        </div>

        <div className="mt-5">
          <SectionCard
            title="Price breakdown"
            subtitle="Charges and refund are based on the supplier quote for this cancellation."
          >
            <div className="space-y-3 rounded-[12px] border border-[#E4E4E7] bg-[#F8FAFC] px-4 py-4">
              {isCancellationChargesLoading ? (
                <p className="text-[14px] text-[#3D495C]">
                  Loading cancellation quote…
                </p>
              ) : (
                <>
                  {totalPaidFromBooking != null && (
                    <div className="flex items-center justify-between gap-4 text-[13px]">
                      <span className="text-[#3D495C]">Amount paid (booking)</span>
                      <span className="font-semibold text-[#0A0C0F]">
                        {formatMoney(totalPaidFromBooking, displayCurrency)}
                      </span>
                    </div>
                  )}
                  {supplierCharge > 0 && (
                    <div className="flex items-center justify-between gap-4 text-[13px]">
                      <span className="text-[#3D495C]">
                        Supplier cancellation charge
                      </span>
                      <span className="font-medium text-[#0A0C0F]">
                        {formatMoney(supplierCharge, displayCurrency)}
                      </span>
                    </div>
                  )}
                  {adminCharge > 0 && (
                    <div className="flex items-center justify-between gap-4 text-[13px]">
                      <span className="text-[#3D495C]">
                        Service / admin charge
                      </span>
                      <span className="font-medium text-[#0A0C0F]">
                        {formatMoney(adminCharge, displayCurrency)}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between gap-4 border-t border-[#E4E4E7] pt-3 text-[14px]">
                    <span className="font-semibold text-[#0A0C0F]">
                      Total cancellation charges
                    </span>
                    <span className="font-semibold text-[#EA0029]">
                      {formatMoney(totalCancellationCharges, displayCurrency)}
                    </span>
                  </div>
                  <div className="border-t border-[#E4E4E7] pt-3">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="text-[14px] font-semibold text-[#0A0C0F]">
                          Estimated refund
                        </div>
                        <p className="mt-1 text-[12px] text-[#3D495C]">
                          {estimatedRefundAmount != null
                            ? "Paid amount minus cancellation charges (estimate before final processing)."
                            : "Your final refund will be confirmed after cancellation. Total charges above still apply if shown."}
                        </p>
                      </div>
                      <div className="text-right text-[18px] font-semibold text-[#00B868]">
                        {estimatedRefundAmount != null
                          ? formatMoney(estimatedRefundAmount, displayCurrency)
                          : "—"}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </SectionCard>
        </div>

        <div className="mt-5">
          <SectionCard
            title="Refund method"
            subtitle="How you will receive your money after cancellation is approved."
          >
            <div className="w-full rounded-[12px] border border-[#2351A3] bg-[#EEF4FF] px-4 py-5 text-center">
              <div className="text-[15px] font-semibold text-[#2351A3]">
                Original payment method
              </div>
              <div className="mt-2 text-[13px] text-[#3D495C]">
                Refund will be credited to the card or account used for this
                booking.
              </div>
              <div className="mt-2 text-[12px] text-[#5383DA]">
                Typical processing: 7–10 business days after approval.
              </div>
            </div>
          </SectionCard>
        </div>

        <div className="mt-6 flex items-start gap-2 text-[12px] text-[#3D495C]">
          <span className="mt-[2px] text-[#2351A3]">ⓘ</span>
          <p>
            This action cannot be undone. After you confirm cancellation, the
            reservation is void and cannot be restored.
          </p>
        </div>

        <div className="mt-6 space-y-5">
          <Checkbox checked={ack1} onChange={(e) => setAck1(e.target.checked)}>
            <span className="text-[14px] text-[#3D495C]">
              I understand cancellation charges of{" "}
              {formatMoney(totalCancellationCharges, displayCurrency)}
              {estimatedRefundAmount != null
                ? ` and an estimated refund of ${formatMoney(estimatedRefundAmount, displayCurrency)}`
                : ""}
              .
            </span>
          </Checkbox>

          <Checkbox checked={ack2} onChange={(e) => setAck2(e.target.checked)}>
            <span className="text-[14px] text-[#3D495C]">
              I am authorized to cancel this reservation for all guests listed.
            </span>
          </Checkbox>

          <Checkbox checked={ack3} onChange={(e) => setAck3(e.target.checked)}>
            <span className="text-[14px] text-[#3D495C]">
              I have read and agree to the{" "}
              <Link
                to="/refund-cancellation-policy"
                className="text-[#2351A3] font-medium hover:underline"
              >
                cancellation & refund policy
              </Link>
              .
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
              width: "264px",
              height: "47px",
              borderRadius: "100px",
            }}
            overrideClasses
            onClick={handleFinalizeCancellation}
          >
            {isCancelling ? "Cancelling…" : "Confirm cancellation"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default HotelCancellationPage;
