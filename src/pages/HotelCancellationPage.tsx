import React, { useEffect, useState } from "react";
import { Checkbox, Select } from "antd";
import { useLocation, useNavigate } from "react-router-dom";
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

type CancelItemCardProps = {
  title: string;
  subtitle?: string;
  selected: boolean;
  onClick: () => void;
};

function CancelItemCard({
  title,
  subtitle,
  selected,
  onClick,
}: CancelItemCardProps) {
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

const HotelCancellationPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const bookingReferenceId = location.state?.bookingReferenceId || "";
  const hotelName = location.state?.hotelName || "Hotel Booking";
  const bookingKey = location.state?.bookingKey || "";

  const {
    mutateAsync: getCancellationChargesAsync,
    isPending: isCancellationChargesLoading,
  } = useHotelCancellationCharges();

  const {
  mutateAsync: cancelHotelAsync,
  isPending: isCancelling,
} = useHotelCancellation();

  const [cancelReason, setCancelReason] = useState<string | undefined>();
  const [ack1, setAck1] = useState(false);
  const [ack2, setAck2] = useState(false);
  const [ack3, setAck3] = useState(false);

  const [cancellationFee, setCancellationFee] = useState<number>(0);
  const [cancellationCurrency, setCancellationCurrency] = useState<string>("AED");

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

        setCancellationFee(firstCharge?.totalCancellationCharges || 0);
        setCancellationCurrency(firstItem?.currency || "AED");
      } catch (error) {
        const err = extractErrorFromAxiosApiError(error);
        toast.error(err || "Failed to fetch cancellation charges");
      }
    };

    init();
  }, [bookingReferenceId, getCancellationChargesAsync]);

  const canSubmit = !!cancelReason && ack1 && ack2 && ack3;

  const handleFinalizeCancellation = async () => {
  try {
    const response = await cancelHotelAsync({
      command: "cancel",
      bookingReferenceId,
      bookingKey
    });

    if (response?.meta?.success) {
      toast.success("Booking cancelled successfully");

      navigate("/my-bookings"); // go back to bookings page
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
        <SectionCard
          title="Select Items to Cancel"
          subtitle="You can cancel the entire stay for this reservation."
        >
          <div className="space-y-3">
            <CancelItemCard
              title="Cancel Entire Stay"
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
            title="Cancellation Policy & Refund Summary"
            subtitle="Cancellation and prepayment policies vary according to accommodation type."
          >
            <div className="rounded-[12px] border border-[#E4E4E7] bg-[#F8FAFC] px-4 py-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-[14px] font-semibold text-[#0A0C0F]">
                    Cancellation charges
                  </div>
                  <div className="mt-1 text-[13px] text-[#3D495C]">
                    Total charges applicable for cancelling this reservation
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[18px] font-semibold text-[#0A0C0F]">
                    {isCancellationChargesLoading
                      ? "Loading..."
                      : `${cancellationCurrency} ${Number(
                          cancellationFee || 0,
                        ).toFixed(2)}`}
                  </div>
                  <div className="text-[12px] text-[#EA0029] mt-1">
                    Cancellation fee:{" "}
                    {isCancellationChargesLoading
                      ? "Loading..."
                      : `${cancellationCurrency} ${Number(
                          cancellationFee || 0,
                        ).toFixed(2)}`}
                  </div>
                </div>
              </div>
            </div>
          </SectionCard>
        </div>

        <div className="mt-5">
          <SectionCard
            title="Refund Preference"
            subtitle="Please choose how you would like to receive your funds."
          >
            <button
              type="button"
              className="w-full rounded-[12px] border border-[#2351A3] bg-[#EEF4FF] px-4 py-5 text-center"
            >
              <div className="text-[15px] font-semibold text-[#2351A3]">
                Original Payment Method
              </div>
              <div className="mt-2 text-[13px] text-[#3D495C]">
                Refund will be credited to your original payment method.
              </div>
              <div className="mt-2 text-[12px] text-[#5383DA]">
                Estimated Processing Time: 7–10 Business Days.
              </div>
            </button>
          </SectionCard>
        </div>

        <div className="mt-6 flex items-start gap-2 text-[12px] text-[#3D495C]">
          <span className="mt-[2px] text-[#2351A3]">ⓘ</span>
          <p>
            This action is irreversible. Once you click “Finalize Cancellation,”
            the reservation will be cancelled immediately and cannot be restored.
          </p>
        </div>

        <div className="mt-6 space-y-5">
          <Checkbox checked={ack1} onChange={(e) => setAck1(e.target.checked)}>
            <span className="text-[14px] text-[#3D495C]">
              I understand that the cancellation fee of {cancellationCurrency}{" "}
              {Number(cancellationFee || 0).toFixed(2)} is non-refundable
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
    width: "264px",
    height: "47px",
    borderRadius: "100px",
  }}
  overrideClasses
  onClick={handleFinalizeCancellation}
>
  {isCancelling ? "Cancelling..." : "Finalize Cancellation"}
</Button>
        </div>
      </div>
    </div>
  );
};

export default HotelCancellationPage;