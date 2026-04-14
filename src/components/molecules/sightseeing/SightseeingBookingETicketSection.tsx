import { useMemo, useState } from "react";
import Button from "../../atoms/Button";
import ShareTicketModal from "../../atoms/ShareTicketModal";
import { generateMultiPagePDF } from "../../../utils/pdfGenerator";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import type { SightseeingBookingSummary } from "../../../features/sightseeing/sightseeingBooking";
import type { SightseeingProtectionChoice } from "./SightseeingGetProtectionSection";
import {
  SightseeingNotchDivider,
  SightseeingTicketPdfContent,
} from "./SightseeingTicketPdfContent";

type Props = {
  summary: SightseeingBookingSummary;
  bookingReference: string;
  clientReference: string;
  leadTravelerDisplayName: string;
  protectionChoice: SightseeingProtectionChoice;
};

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

  const shareUrl = useMemo(() => {
    if (typeof window === "undefined" || !bookingReference) return "";
    return `${window.location.origin}/my-bookings?ref=${encodeURIComponent(bookingReference)}`;
  }, [bookingReference]);

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

  return (
    <section className="mt-8 flex items-center justify-center px-4 pb-16 font-[Inter,sans-serif]">
      <div className="w-full max-w-[560px]">
        <div
          className="rounded-[16px] border bg-[#FFFFFF] px-2 pt-6 pb-6"
          style={{ borderWidth: 1, borderColor: "#C2CAD6" }}
        >
          <SightseeingTicketPdfContent
            summary={summary}
            bookingReference={bookingReference}
            clientReference={clientReference}
            leadTravelerDisplayName={leadTravelerDisplayName}
            protectionChoice={protectionChoice}
          />
          <SightseeingNotchDivider />
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
            <SightseeingTicketPdfContent
              summary={summary}
              bookingReference={bookingReference}
              clientReference={clientReference}
              leadTravelerDisplayName={leadTravelerDisplayName}
              protectionChoice={protectionChoice}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
