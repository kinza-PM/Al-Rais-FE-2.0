import HotelSummaryCard from "../atoms/HotelSummaryCard";
import HotelPriceBreakdown from "../atoms/HotelPriceBreakdown";
import HotelFareRule from "../atoms/HotelFareRule";
import Button from "../atoms/Button";
import React from "react";
import type { HotelBookingPayload } from "../../utils/hotelBookingHelper";
import { formatDate } from "../../utils/helpers";
import { Checkbox } from "antd";
import { useState } from "react";
import LegalModal from "../common/LegalModal";

const CardShell = ({
  title,
  right,
  children,
}: {
  title: string;
  right?: React.ReactNode;
  children: React.ReactNode;
}) => (
  <div className="rounded-2xl border border-[#E4E4E7] bg-white shadow-sm">
    <div className="flex items-center justify-between px-4 py-3 border-b border-[#E4E4E7]">
      <h3 className="text-[15px] font-medium text-[#0A0C0F]">{title}</h3>
      {right}
    </div>
    {children}
  </div>
);

const HeaderActions = ({
  onEdit,
  editLabel = "Edit",
}: {
  onEdit: () => void;
  editLabel?: string;
}) => (
  <Button
    type="button"
    onClick={onEdit}
    className="text-sm font-medium text-[#5383DA] hover:underline"
    overrideClasses
  >
    {editLabel}
  </Button>
);

type HotelBookingReviewSectionProps = {
  onNext?: () => void;
  onPrevious?: () => void;
  hotelDetail?: any;
  bookingInfo?: any;
  selectedRooms?: any[];
  totalPrice?: number;
  currency?: string;
  hotelBookingPayload?: HotelBookingPayload | null;
};

export default function HotelBookingReviewSection({
  onNext,
  onPrevious,
  hotelDetail,
  bookingInfo,
  selectedRooms = [],
  totalPrice = 0,
  currency = "AED",
  hotelBookingPayload,
}: HotelBookingReviewSectionProps) {
  const [isTermsChecked, setIsTermsChecked] = useState(false);
  const [showTermsError, setShowTermsError] = useState(false);
  const [isCancellationChecked, setIsCancellationChecked] = useState(false);
  const [showCancellationError, setShowCancellationError] = useState(false);
  const [legalModal, setLegalModal] = useState<{
    isOpen: boolean;
    type: "terms" | "privacy" | "cancellation";
  }>({ isOpen: false, type: "terms" });

  const roomsFromPayload = hotelBookingPayload?.rooms ?? [];
  const flatPassengers = roomsFromPayload.flatMap((room, roomIdx) =>
    (room.passengers ?? []).map((passenger, pIdx) => ({
      roomIndex: roomIdx,
      passengerIndex: pIdx,
      passenger,
    })),
  );

  const formatTitle = (value?: string) => {
    if (!value) return "—";
    const lower = value.toString().toLowerCase();
    return lower.charAt(0).toUpperCase() + lower.slice(1);
  };

  const arrivalLabel = (() => {
    const date = bookingInfo?.checkIn;
    const time = bookingInfo?.checkInTime;
    if (!date && !time) return "—";
    if (date && time) return `${time}, ${formatDate(date)}`;
    if (date) return formatDate(date);
    return time || "—";
  })();

  const continueToPayment = () => {
    let hasError = false;

    if (!isTermsChecked) {
      setShowTermsError(true);
      hasError = true;
    }
    if (!isCancellationChecked) {
      setShowCancellationError(true);
      hasError = true;
    }
    if (hasError) return;

    if (typeof onNext === "function") {
      onNext();
    }
  }

  return (
    <section className="mx-auto max-w-full px-10 flight-booking-section">
      <div className="grid gap-4 md:grid-cols-[2fr_1fr] flight-booking-grid">
        <div className="space-y-4">
          {flatPassengers.map(({ passenger: p }, idx) => {
            const fullName = `${p.passengerInfo?.givenName || ""} ${p.passengerInfo?.surname || ""
              }`.trim();
            const email =
              p.contact?.contactsProvided?.[0]?.emailAddress?.[0] || "—";
            const phoneObj = p.contact?.contactsProvided?.[0]?.phone?.[0] ?? {};
            const rawCode =
              phoneObj.areaCode !== undefined ? String(phoneObj.areaCode) : "";
            const rawNumber =
              phoneObj.phoneNumber !== undefined
                ? String(phoneObj.phoneNumber)
                : "";
            const phone =
              rawCode || rawNumber ? `${rawCode} ${rawNumber}`.trim() : "—";

            return (
              <CardShell
                key={p.passengerKey || idx}
                title={`Contact person ${String(idx + 1).padStart(
                  2,
                  "0",
                )} details`}
                right={
                  onPrevious ? (
                    <HeaderActions onEdit={onPrevious} editLabel="Edit" />
                  ) : undefined
                }
              >
                <div className="px-4 py-3">
                  <dl className="grid grid-cols-2 gap-y-2">
                    <dt className="text-xs text-[#3D495C]">Title</dt>
                    <dd className="text-right">
                      <span className="text-sm text-[#0A0C0F] font-medium">
                        {formatTitle(p.passengerInfo?.nameTitle)}
                      </span>
                    </dd>

                    <dt className="text-xs text-[#3D495C]">Full Name</dt>
                    <dd className="text-right">
                      <span className="text-sm text-[#0A0C0F] font-medium">
                        {fullName || "—"}
                      </span>
                    </dd>

                    <dt className="text-xs text-[#3D495C]">Email</dt>
                    <dd className="text-right">
                      <span className="text-sm text-[#0A0C0F] font-medium">
                        {email}
                      </span>
                    </dd>

                    <dt className="text-xs text-[#3D495C]">Phone</dt>
                    <dd className="text-right">{phone}</dd>
                  </dl>
                </div>
              </CardShell>
            );
          })}

          {flatPassengers.length > 0 && (
            <CardShell
              title="Guests details"
              right={
                onPrevious ? (
                  <HeaderActions onEdit={onPrevious} editLabel="Edit" />
                ) : undefined
              }
            >
              <div className="px-4 py-3">
                <dl className="grid grid-cols-2 gap-y-2">
                  {flatPassengers.map(({ passenger: p }, idx) => {
                    const fullName = `${p.passengerInfo?.givenName || ""} ${p.passengerInfo?.surname || ""
                      }`.trim();
                    const ptc = (p.ptc || "").toUpperCase();
                    const ageGroup = ptc === "CHD" ? "Child" : "Adult";

                    return (
                      <React.Fragment key={p.passengerKey || idx}>
                        <dt className="text-xs text-[#3D495C]">
                          Full name and age group
                        </dt>
                        <dd className="text-right">
                          <span className="text-sm text-[#0A0C0F] font-medium">
                            {fullName || "—"} ({ageGroup})
                          </span>
                        </dd>
                      </React.Fragment>
                    );
                  })}
                </dl>
              </div>
            </CardShell>
          )}

          {selectedRooms.length > 0 && (
            <CardShell
              title="Your rooms"
            // right={
            //   <HeaderActions onEdit={onPrevious ?? (() => {})} editLabel="View all details" />
            // }
            >
              <div className="px-4 py-3 space-y-5">
                {selectedRooms.map((selectedRoom, index) => {
                  const room = selectedRoom?.room;
                  const ratePlan = room?.ratePlan;
                  const roomRate = room?.roomRate;
                  const isNonRefundable =
                    ratePlan?.cancelPolicyIndicator === "Non-Refundable";
                  const cancellationCost =
                    roomRate?.netAmount && isNonRefundable
                      ? `${roomRate.currency || currency} ${(
                        roomRate.netAmount * (selectedRoom.count || 1)
                      ).toFixed(2)}`
                      : "Free cancellation";

                  const totalGuests =
                    (bookingInfo?.adults ?? 0) + (bookingInfo?.children ?? 0);

                  return (
                    <div
                      key={selectedRoom.roomKey || index}
                      className="border-b border-[#E4E4E7] pb-4 last:border-b-0 last:pb-0"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <h4 className="text-base font-semibold text-[#0A0C0F]">
                            {room?.roomTypeName || "Room"} •{" "}
                            {ratePlan?.meal || "Room only"}
                          </h4>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-x-8 gap-y-3">
                        <div className="flex-[1.5] min-w-[140px]">
                          <div className="text-[#3D495C] text-xs">
                            Room option
                          </div>
                          <div className="text-[#0A0C0F] text-sm font-medium">
                            {ratePlan?.meal || "Room only"}
                          </div>
                        </div>

                        <div className="flex-1 min-w-[140px]">
                          <div className="text-[#3D495C] text-xs">
                            Max no. of guests/room
                          </div>
                          <div className="text-[#0A0C0F] text-sm font-medium">
                            {totalGuests > 0
                              ? `${totalGuests
                                .toString()
                                .padStart(2, "0")} guest${totalGuests > 1 ? "s" : ""
                              }`
                              : "—"}
                          </div>
                        </div>

                        <div className="flex-1 min-w-[120px]">
                          <div className="text-[#3D495C] text-xs">Rooms</div>
                          <div className="text-[#0A0C0F] text-sm font-medium">
                            {selectedRoom.count || 1}
                          </div>
                        </div>

                        <div className="flex-1 min-w-[140px]">
                          <div className="text-[#3D495C] text-xs">
                            Cancellation cost
                          </div>
                          <div className="text-[#0A0C0F] text-sm font-semibold">
                            {cancellationCost}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardShell>
          )}

          {/* <CardShell
            title="Enhancements"
            right={<HeaderActions onEdit={() => {}} editLabel="Change" />}
          >
            <div className="px-4 py-3">
              <div className="flex items-center gap-3 flex-1">
                <div className="w-12 h-12 rounded-xl bg-[#A7C0EC] flex items-center justify-center flex-shrink-0">
                  <AirportShuttleIcon />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-[#0A0C0F]">
                    Airport shuttle (Free)
                  </h4>
                </div>
              </div>
            </div>
          </CardShell>

          <CardShell
            title="Your arrival time"
            right={<HeaderActions onEdit={() => {}} editLabel="Edit" />}
          >
            <div className="px-4 py-3">
              <dl className="grid grid-cols-2 gap-y-2">
                <dt className="text-xs text-[#3D495C]">Time and date</dt>
                <dd className="text-right">
                  <span className="text-sm text-[#0A0C0F] font-medium">
                    9:30 PM, 27th August 2025
                  </span>
                </dd>
              </dl>
            </div>
          </CardShell> */}

          <CardShell
            title="Your arrival time"
          // right={<HeaderActions onEdit={() => {}} editLabel="Edit" />}
          >
            <div className="px-4 py-3">
              <dl className="grid grid-cols-2 gap-y-2">
                <dt className="text-xs text-[#3D495C]">Time and date</dt>
                <dd className="text-right">
                  <span className="text-sm text-[#0A0C0F] font-medium">
                    {arrivalLabel}
                  </span>
                </dd>
              </dl>
            </div>
          </CardShell>
        </div>

        {/* RIGHT: Trip details */}
        <div>
          <HotelSummaryCard
            hotelDetail={hotelDetail}
            bookingInfo={bookingInfo}
          />
          <HotelFareRule
            selectedRooms={selectedRooms}
            totalPrice={totalPrice}
            currency={currency}
            hotelDetail={hotelDetail}
          />
          <HotelPriceBreakdown totalPrice={totalPrice} currency={currency} taxes={selectedRooms?.[0]?.room?.roomRate?.taxes || []} />
          <div className="mt-2">
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
                  className="text-[#5383DA] cursor-pointer hover:underline"
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
              <p className="text-red-500 text-xs mt-1">
                You must agree to the Terms & Conditions to proceed.
              </p>
            )}
          </div>

          <div className="mt-2">
            <Checkbox
              checked={isCancellationChecked}
              onChange={(e) => {
                setIsCancellationChecked(e.target.checked);
                if (e.target.checked) {
                  setShowCancellationError(false);
                }
              }}
              className="items-start [&_.ant-checkbox-inner]:w-5 [&_.ant-checkbox-inner]:h-5 [&_.ant-checkbox-inner]:rounded-lg [&_.ant-checkbox-inner]:border-[#A7C0EC] [&_.ant-checkbox-inner]:border [&_.ant-checkbox]:mt-[2px]"
            >
              <span className="font-medium text-sm leading-none tracking-normal align-middle">
                I have read and agree to the{" "}
                <span
                  className="text-[#5383DA] cursor-pointer hover:underline"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setLegalModal({ isOpen: true, type: "cancellation" });
                  }}
                >
                  Cancellation Policy
                </span>.
              </span>
            </Checkbox>
            {showCancellationError && (
              <p className="text-red-500 text-xs mt-1">
                You must agree to the Cancellation Policy to proceed.
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="mt-5 flex justify-center w-full">
        <Button
          type="button"
          overrideClasses
          className="w-[252px] h-[47px] rounded-[100px] px-10 py-[14px] text-[15px] font-semibold text-white hover:opacity-95 active:opacity-90 transition-opacity flex items-center justify-center"
          style={{
            background: "linear-gradient(90.59deg, #5383DA 0%, #2351A3 50%, #081326 100%)",
          }}
          onClick={() => continueToPayment()}
        >
          Continue to payment
        </Button>
      </div>

      <LegalModal
        isOpen={legalModal.isOpen}
        onClose={() => setLegalModal((prev) => ({ ...prev, isOpen: false }))}
        type={legalModal.type}
      />
    </section>
  );
}
