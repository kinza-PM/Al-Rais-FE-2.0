import { useMemo, useState } from "react";
import Button from "../../atoms/Button";
import ShareTicketModal from "../../atoms/ShareTicketModal";
import { generateMultiPagePDF } from "../../../utils/pdfGenerator";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import type { SightseeingBookingSummary } from "../../../features/sightseeing/sightseeingBooking";
import type { SightseeingProtectionChoice } from "./SightseeingGetProtectionSection";

type Props = {
  summary: SightseeingBookingSummary;
  bookingReference: string;
  clientReference: string;
  leadTravelerDisplayName: string;
  protectionChoice: SightseeingProtectionChoice;
};

function formatMoney(currency: string, amount: number): string {
  const n = amount.toFixed(2);
  const c = currency.trim().toUpperCase();
  if (c === "USD") return `$${n}`;
  if (c === "EUR") return `€${n}`;
  if (c === "GBP") return `£${n}`;
  return `${currency.trim()} ${n}`;
}

export default function SightseeingBookingETicketSection({
  summary,
  bookingReference,
  clientReference,
  leadTravelerDisplayName,
  protectionChoice,
}: Props) {
  const navigate = useNavigate();
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);

  const pickupLine = useMemo(
    () =>
      [summary.pickupDateDisplay, summary.pickupTimeDisplay]
        .filter(Boolean)
        .join(" · "),
    [summary.pickupDateDisplay, summary.pickupTimeDisplay],
  );

  const shareUrl = useMemo(() => {
    if (typeof window === "undefined" || !bookingReference) return "";
    return `${window.location.origin}/my-bookings?ref=${encodeURIComponent(bookingReference)}`;
  }, [bookingReference]);

  const protectionLine =
    protectionChoice === "damage"
      ? "Rental car damage protection was added to this booking."
      : "No add-on protection was selected for this booking.";

  const handleDownloadPDF = async () => {
    try {
      setIsGeneratingPDF(true);
      await generateMultiPagePDF(
        ["#sightseeing-ticket-content-clone"],
        "sightseeing-ticket-pdf",
        `sightseeing-ticket-${bookingReference || "booking"}.pdf`,
      );
      toast.success("PDF downloaded successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate PDF. Please try again.");
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const NotchDivider = () => (
    <div className="relative mt-7 mb-10">
      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2">
        <div
          className="border-t border-dashed border-[#E4E4E7]"
          style={{ borderWidth: 1, marginTop: -10 }}
        />
      </div>
      <span
        className="pointer-events-none absolute left-0 top-1/2 -translate-y-1/2"
        style={{ transform: "translate(-9px, -50%)" }}
      >
        <svg
          width="9.14"
          height="20"
          viewBox="0 0 10 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M0.5 0.512695C5.51429 0.772696 9.5 4.92101 9.5 10C9.5 15.079 5.51426 19.2263 0.5 19.4863V0.512695Z"
            fill="#FFFFFF"
          />
          <path
            d="M0.5 0.512695C5.51429 0.772696 9.5 4.92101 9.5 10C9.5 15.079 4.48574 19.2263 0.5 19.4863"
            fill="none"
            stroke="#C2CAD6"
            strokeWidth="1"
          />
        </svg>
      </span>
      <span
        className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2"
        style={{ transform: "translate(9px, -50%)" }}
      >
        <svg
          width="9.14"
          height="20"
          viewBox="0 0 10 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M9.5 0.512695C4.48571 0.772696 0.5 4.92101 0.5 10C0.5 15.079 4.48574 19.2263 9.5 19.4863V0.512695Z"
            fill="#FFFFFF"
            stroke="#C2CAD6"
            strokeWidth="1"
          />
        </svg>
      </span>
    </div>
  );

  const TicketContent = () => (
    <>
      {summary.imageSrc ? (
        <div className="relative h-48 overflow-hidden rounded-2xl">
          <img
            src={summary.imageSrc}
            alt=""
            className="h-full w-full object-cover"
          />
        </div>
      ) : null}

      <div className="mt-8 flex flex-col items-center justify-center text-center text-[#0A0C0F]">
        <h2 className="text-lg font-bold">Your experience is booked!</h2>
        <h5 className="mt-3 text-sm">
          Confirmation:{" "}
          <span className="font-semibold">
            {bookingReference || "—"}
          </span>
        </h5>
        <p className="mb-3 mt-5 text-xs text-[#3D495C]">
          We&apos;ve sent a receipt to the email used at payment.
        </p>
        {clientReference ? (
          <p className="text-[11px] text-[#98A4B3]">
            Reference: {clientReference}
          </p>
        ) : null}
      </div>

      <NotchDivider />

      <div>
        <h3 className="text-base font-bold text-[#0A0C0F]">{summary.title}</h3>
        <p className="mt-1 text-xs text-[#3D495C]">{summary.categoryLabel}</p>
      </div>

      <NotchDivider />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <p className="text-[13px] text-[#3D495C]">Pickup date &amp; time</p>
          <p className="mt-1 text-[15px] font-medium text-[#0A0C0F]">
            {pickupLine || "—"}
          </p>
        </div>
        <div>
          <p className="text-[13px] text-[#3D495C]">Package</p>
          <p className="mt-1 text-[15px] font-medium text-[#0A0C0F]">
            {summary.packageSummary}
          </p>
        </div>
      </div>

      <NotchDivider />

      <div className="flex flex-wrap items-start justify-between gap-6">
        <div className="min-w-0">
          <div className="text-[13px] text-[#3D495C]">Lead guest</div>
          <div className="mt-1 break-words text-[15px] font-medium text-[#0A0C0F]">
            {leadTravelerDisplayName || "—"}
          </div>
        </div>
        <div className="shrink-0">
          <div className="text-[13px] text-[#3D495C]">Travellers</div>
          <div className="mt-1 text-[15px] font-medium text-[#0A0C0F]">
            {summary.travellersSummary}
          </div>
        </div>
      </div>

      <NotchDivider />

      <div className="text-[13px] text-[#64748B]">{protectionLine}</div>

      <NotchDivider />

      <div className="flex items-center justify-between">
        <span className="text-xs text-[#3D495C]">Total paid</span>
        <span className="text-[15px] font-semibold text-[#0A0C0F]">
          {formatMoney(summary.currency, summary.grandTotal)}
        </span>
      </div>
    </>
  );

  return (
    <section className="mt-8 flex items-center justify-center px-4 pb-16 font-[Inter,sans-serif]">
      <div className="w-full max-w-[560px]">
        <div
          className="rounded-[16px] border bg-[#FFFFFF] px-2 pt-6 pb-6"
          style={{ borderWidth: 1, borderColor: "#C2CAD6" }}
        >
          <TicketContent />
          <NotchDivider />
          <div className="grid w-full grid-cols-3 gap-2 px-2 sm:gap-3 sm:px-4">
            <Button
              type="button"
              overrideClasses
              onClick={handleDownloadPDF}
              disabled={isGeneratingPDF}
              className="flex min-h-[44px] w-full min-w-0 items-center justify-center border-0 px-2 text-center text-[11px] font-semibold leading-tight text-[#F2F2F3] sm:min-h-[46px] sm:text-[12px]"
              style={{
                borderRadius: 100,
                background:
                  "linear-gradient(90.59deg, #5383DA 0%, #2351A3 50%, #081326 100%)",
              }}
            >
              {isGeneratingPDF ? "Generating…" : "Download PDF"}
            </Button>
            <Button
              type="button"
              overrideClasses
              onClick={() => setShareModalOpen(true)}
              disabled={!bookingReference}
              className="flex min-h-[44px] w-full items-center justify-center border border-[#2351A3] bg-white px-2 text-[11px] font-semibold text-[#2351A3] sm:text-[13px]"
              style={{ borderRadius: 100 }}
            >
              Share
            </Button>
            <Button
              type="button"
              overrideClasses
              onClick={() => navigate("/my-bookings")}
              className="flex min-h-[44px] w-full items-center justify-center border border-[#C2CAD6] bg-[#F8FAFC] px-2 text-[11px] font-semibold text-[#2351A3] sm:text-[12px]"
              style={{ borderRadius: 100 }}
            >
              My bookings
            </Button>
          </div>
        </div>

        {shareModalOpen ? (
          <ShareTicketModal
            closeModal={() => setShareModalOpen(false)}
            mode="hotel"
            bookingRef={bookingReference}
            cardTitle={summary.title}
            cardSubtitle="Sightseeing activity"
            shareUrl={shareUrl || (typeof window !== "undefined" ? window.location.href : "")}
            title="Share confirmation"
            description="Share your confirmation and experience details with companions."
            showPrint={false}
          />
        ) : null}

        <div
          id="sightseeing-ticket-pdf"
          aria-hidden
          style={{
            position: "absolute",
            left: "-20000px",
            top: 0,
            width: "576px",
            overflow: "visible",
            pointerEvents: "none",
            zIndex: -1,
          }}
        >
          <div
            id="sightseeing-ticket-content-clone"
            className="rounded-[16px] border bg-[#FFFFFF] px-2 pt-6 pb-6"
            style={{ borderWidth: 1, borderColor: "#C2CAD6" }}
          >
            <TicketContent />
          </div>
        </div>
      </div>
    </section>
  );
}
