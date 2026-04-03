import React, { useCallback, useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import {
  buildActivitiesPreConfirmBody,
  mergeActivitiesConfirmBodyFromPreConfirm,
} from "../services/api/activitiesSearch";
import {
  useActivitiesConfirmBooking,
  useActivitiesPreConfirmBooking,
} from "../hooks/sightseeing/useActivitiesBooking";
import { appendLocalSightseeingBooking } from "../utils/sightseeingLocalBookings";
import { SightseeingFreeCancellationBanner } from "../components/molecules/sightseeing/SightseeingFreeCancellationBanner";
import { SightseeingBookingAdultTravelersSection } from "../components/molecules/sightseeing/SightseeingBookingAdultTravelersSection";
import {
  SightseeingGetProtectionSection,
  type SightseeingProtectionChoice,
} from "../components/molecules/sightseeing/SightseeingGetProtectionSection";
import SightseeingBookingPaymentSection from "../components/molecules/sightseeing/SightseeingBookingPaymentSection";
import SightseeingBookingETicketSection from "../components/molecules/sightseeing/SightseeingBookingETicketSection";
import LoginModal from "../components/common/LoginModal";
import { useAuth } from "../features/auth/hooks/useAuth";
import {
  buildActivityBookingHolderFromLeadTraveler,
  createEmptyAdultTravelerForm,
  extractActivityBookingReference,
  isoDateOnly,
  newSightseeingClientReference,
  validateLeadTravelerForActivityBooking,
  type SightseeingAdultTravelerForm,
  type SightseeingBookingPageState,
  type SightseeingBookingSummary,
} from "../features/sightseeing/sightseeingBooking";

function ClockMetaIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <circle cx="12" cy="12" r="9" stroke="#64748B" strokeWidth="1.5" />
      <path
        d="M12 7v6l4 2"
        stroke="#64748B"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function PeopleMetaIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"
        stroke="#64748B"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="9" cy="7" r="4" stroke="#64748B" strokeWidth="1.5" />
      <path
        d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"
        stroke="#64748B"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SummaryRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: () => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-[#E4E4E7] py-4 last:border-b-0">
      <div className="min-w-0">
        <p className="text-[12px] font-medium text-[#64748B]">{label}</p>
        <p className="mt-1 text-[15px] font-bold text-[#0A0C0F]">{value}</p>
      </div>
      <button
        type="button"
        onClick={onChange}
        className="shrink-0 text-[15px] font-semibold text-[#2563EB] hover:underline"
      >
        Change
      </button>
    </div>
  );
}

const STEPS = ["Travellers", "Payment", "Ticket"] as const;

const SightseeingBookingPage: React.FC = () => {
  const { activityCode: rawCode } = useParams<{ activityCode: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const pageState = location.state as SightseeingBookingPageState | null;

  const activityCode = rawCode ? decodeURIComponent(rawCode) : "";

  const summary: SightseeingBookingSummary | undefined = pageState?.summary;
  const returnState = pageState?.returnState;

  const adultCount = summary?.draft?.adults ?? 0;

  const [travelers, setTravelers] = useState<SightseeingAdultTravelerForm[]>(
    () =>
      adultCount > 0
        ? Array.from({ length: adultCount }, () =>
            createEmptyAdultTravelerForm(),
          )
        : [],
  );

  const [currentStep, setCurrentStep] = useState(0);
  const [checkoutProtection, setCheckoutProtection] =
    useState<SightseeingProtectionChoice | null>(null);
  const [ticketSnapshot, setTicketSnapshot] = useState<{
    bookingRef: string;
    clientReference: string;
  } | null>(null);

  const preConfirmMutation = useActivitiesPreConfirmBooking();
  const confirmMutation = useActivitiesConfirmBooking();

  useEffect(() => {
    if (adultCount < 1) return;
    setTravelers((prev) => {
      if (prev.length === adultCount) return prev;
      if (prev.length < adultCount) {
        return [
          ...prev,
          ...Array.from(
            { length: adultCount - prev.length },
            () => createEmptyAdultTravelerForm(),
          ),
        ];
      }
      return prev.slice(0, adultCount);
    });
  }, [adultCount]);

  const handleChange = useCallback(() => {
    if (!activityCode) return;
    navigate(`/sightseeing-detail/${encodeURIComponent(activityCode)}`, {
      state: {
        ...returnState,
        draft: summary?.draft,
      },
    });
  }, [activityCode, navigate, returnState, summary?.draft]);

  const patchTraveler = useCallback(
    (i: number, patch: Partial<SightseeingAdultTravelerForm>) => {
      setTravelers((prev) =>
        prev.map((t, j) => (j === i ? { ...t, ...patch } : t)),
      );
    },
    [],
  );

  const onContinueToPayment = useCallback(
    (protection: SightseeingProtectionChoice) => {
      if (!summary) return;

      const leadErr = validateLeadTravelerForActivityBooking(travelers[0]);
      if (leadErr) {
        toast.error(leadErr);
        return;
      }

      const rateKey = summary.draft.selectedRateKey?.trim() ?? "";
      if (!rateKey) {
        toast.error(
          "No activity rate selected. Go back and choose a package, then try again.",
        );
        return;
      }

      const tourDate = isoDateOnly(summary.draft.selectedTourDate);
      if (!tourDate) {
        toast.error("Pickup date is missing. Go back and select a date.");
        return;
      }

      setCheckoutProtection(protection);
      setCurrentStep(1);
    },
    [summary, travelers],
  );

  const completeSupplierBookingAfterPayment = useCallback(async () => {
    if (!summary || !checkoutProtection) {
      throw new Error("Booking summary is incomplete. Please start again.");
    }

    const leadErr = validateLeadTravelerForActivityBooking(travelers[0]);
    if (leadErr) {
      throw new Error(leadErr);
    }

    const rateKey = summary.draft.selectedRateKey?.trim() ?? "";
    if (!rateKey) {
      throw new Error("No activity rate selected.");
    }

    const tourDate = isoDateOnly(summary.draft.selectedTourDate);
    if (!tourDate) {
      throw new Error("Pickup date is missing.");
    }

    const holder = buildActivityBookingHolderFromLeadTraveler(travelers[0]!);
    const clientReference = newSightseeingClientReference();
    const baseBody = buildActivitiesPreConfirmBody({
      clientReference,
      rateKey,
      from: tourDate,
      to: tourDate,
      holder,
    });

    const pre = await preConfirmMutation.mutateAsync(baseBody);
    const confirmBody = mergeActivitiesConfirmBodyFromPreConfirm(
      baseBody,
      pre,
    );
    const confirmed = await confirmMutation.mutateAsync(confirmBody);
    const ref =
      extractActivityBookingReference(confirmed) ??
      extractActivityBookingReference(pre);
    const bookingRefForList = (ref ?? clientReference).trim();

    appendLocalSightseeingBooking({
      id: `local-${clientReference}`,
      status: "Confirmed",
      activityTitle: summary.title,
      activityCode: summary.activityCode,
      tourDateIso: tourDate,
      pickupTimeDisplay: summary.pickupTimeDisplay,
      travellersSummary: summary.travellersSummary,
      packageSummary: summary.packageSummary,
      bookingRef: bookingRefForList,
      clientReference,
      currency: summary.currency,
      grandTotal: summary.grandTotal,
    });

    const prot =
      checkoutProtection === "damage"
        ? "Rental Car Damage Protection selected."
        : "Continuing without protection.";
    toast.success(`Booking confirmed. ${prot}`);

    setTicketSnapshot({
      bookingRef: bookingRefForList,
      clientReference,
    });
    setCurrentStep(2);
  }, [
    summary,
    checkoutProtection,
    travelers,
    preConfirmMutation,
    confirmMutation,
  ]);

  if (!summary || summary.activityCode !== activityCode) {
    return (
      <div className="min-h-screen bg-white px-6 py-16 font-[Inter,sans-serif]">
        <div className="mx-auto max-w-lg text-center">
          <h1 className="text-[20px] font-bold text-[#0A0C0F]">
            Booking summary unavailable
          </h1>
          <p className="mt-3 text-[15px] text-[#64748B]">
            Start again from an activity to see your booking details.
          </p>
          <Link
            to="/search-sightseeing"
            className="mt-6 inline-block text-[15px] font-semibold text-[#2563EB] hover:underline"
          >
            Browse sightseeing
          </Link>
        </div>
      </div>
    );
  }

  const pickupLine = [summary.pickupDateDisplay, summary.pickupTimeDisplay]
    .filter(Boolean)
    .join(" • ");

  const lead = travelers[0];
  const leadTravelerDisplayName = lead?.fullName?.trim() || "—";

  const stepProgress =
    STEPS.length > 1 ? (currentStep / (STEPS.length - 1)) * 100 : 0;

  return (
    <div className="min-h-screen bg-white pb-16 font-[Inter,sans-serif]">
      {!isAuthenticated ? <LoginModal showModal /> : null}

      <div className="mx-auto w-full max-w-[640px] px-6 pt-10 sm:px-8">
        {currentStep < 2 ? (
          <button
            type="button"
            onClick={() => {
              if (currentStep === 1) {
                setCurrentStep(0);
                return;
              }
              handleChange();
            }}
            className="mb-8 text-left text-[14px] font-medium text-[#2351A3] hover:underline"
          >
            {currentStep === 1 ? "← Back to travellers" : "← Back to activity"}
          </button>
        ) : null}

        <div className="mb-8">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#E8ECF0]">
            <div
              className="h-full rounded-full bg-[#2351A3] transition-[width] duration-300"
              style={{ width: `${stepProgress}%` }}
            />
          </div>
          <div className="mt-3 flex justify-between text-[11px] font-medium text-[#64748B]">
            {STEPS.map((label, i) => (
              <span
                key={label}
                className={
                  i === currentStep ? "font-bold text-[#2351A3]" : undefined
                }
              >
                {i + 1}. {label}
              </span>
            ))}
          </div>
        </div>

        {currentStep === 0 ? (
          <>
            <h1 className="text-[22px] font-bold tracking-tight text-[#0A0C0F] sm:text-[26px]">
              Booking summary
            </h1>
            <p className="mt-2 text-[14px] text-[#64748B]">
              Add traveller details, then continue to secure payment.
            </p>

            <div
              className="mt-8 w-full max-w-[576px] rounded-[16px] border border-[#E4E4E7] bg-[#F2F2F3] p-[10px]"
              style={{ minHeight: 445 }}
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                <div className="h-[143px] w-full shrink-0 overflow-hidden rounded-[16px] bg-[#D9D9D9] sm:w-[190px]">
                  {summary.imageSrc ? (
                    <img
                      src={summary.imageSrc}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : null}
                </div>
                <div className="min-w-0 flex-1 pt-1 sm:pt-0">
                  <h2 className="text-[15px] font-bold leading-snug text-[#0A0C0F] sm:text-[16px]">
                    {summary.title}
                  </h2>
                  <span className="mt-2 inline-block max-w-full truncate rounded-full bg-[#B9D1F9] px-3 py-1.5 text-[12px] font-semibold leading-tight text-[#345995] sm:text-[13px]">
                    {summary.categoryLabel}
                  </span>
                  <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-[13px] font-medium text-[#64748B] sm:text-[14px]">
                    <span className="inline-flex items-center gap-2">
                      <ClockMetaIcon className="shrink-0" />
                      {summary.durationLabel}
                    </span>
                    <span className="inline-flex items-center gap-2">
                      <PeopleMetaIcon className="shrink-0" />
                      {summary.groupLabel}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-2 px-1 sm:px-2">
                <SummaryRow
                  label="Package"
                  value={summary.packageSummary}
                  onChange={handleChange}
                />
                <SummaryRow
                  label="Travelers"
                  value={summary.travellersSummary}
                  onChange={handleChange}
                />
                <SummaryRow
                  label="Pickup date & time"
                  value={pickupLine || "—"}
                  onChange={handleChange}
                />
                <SummaryRow
                  label="Enhancements"
                  value={summary.enhancementsSummary}
                  onChange={handleChange}
                />
              </div>
            </div>

            <SightseeingFreeCancellationBanner className="mt-4 max-w-[576px]" />

            {adultCount >= 1 && travelers.length > 0 ? (
              <>
                <SightseeingBookingAdultTravelersSection
                  adultCount={adultCount}
                  travelers={travelers}
                  onPatchTraveler={patchTraveler}
                />
                <SightseeingGetProtectionSection
                  onReserve={onContinueToPayment}
                  reserveDisabled={false}
                  reserveLabel="Continue to payment"
                />
              </>
            ) : null}
          </>
        ) : null}

        {currentStep === 1 && checkoutProtection ? (
          <SightseeingBookingPaymentSection
            summary={summary}
            onPaid={completeSupplierBookingAfterPayment}
            onBack={() => setCurrentStep(0)}
          />
        ) : null}

        {currentStep === 2 && ticketSnapshot && checkoutProtection ? (
          <SightseeingBookingETicketSection
            summary={summary}
            bookingReference={ticketSnapshot.bookingRef}
            clientReference={ticketSnapshot.clientReference}
            leadTravelerDisplayName={leadTravelerDisplayName}
            protectionChoice={checkoutProtection}
          />
        ) : null}
      </div>
    </div>
  );
};

export default SightseeingBookingPage;
