import { useState } from "react";
import Whatsapp from "../../assets/images/whatsapp.png";
import Printer from "../../assets/svgs/printer.svg";
import Mail from "../../assets/svgs/mail.svg";
import Cross from "../../assets/svgs/cross.svg";
import ShareFill from "../../assets/images/share-fill 1.png";
import AlRaisLogo from "../../assets/images/alraisLogo.png";

type ShareTicketProps = {
  closeModal: () => void;
  bookingRef: string;
  passengerName?: string;
  onPrint?: () => void;
  /** URL of the uploaded ticket PDF (from S3) for sharing */
  ticketPdfUrl?: string | null;
  /** Show Print option (e.g. hide in My Bookings listing) */
  showPrint?: boolean;
  /** Optional flight route info for the info card */
  routeFrom?: string;
  routeTo?: string;
  airlines?: string;
  flightDates?: string;
  pricePerSeat?: string;
  currency?: string;
};

export default function ShareTicketModal({
  closeModal,
  bookingRef,
  passengerName = "Valued Customer",
  onPrint,
  ticketPdfUrl,
  showPrint = true,
  routeFrom,
  routeTo,
  airlines,
  flightDates,
  pricePerSeat,
  currency = "$",
}: ShareTicketProps) {
  const [copied, setCopied] = useState(false);

  const shareUrl = ticketPdfUrl || window.location.href;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  };

  const handleEmailShare = () => {
    const subject = encodeURIComponent(
      `Flight Booking Confirmation - ${bookingRef}`,
    );
    const body = encodeURIComponent(
      `Dear ${passengerName},\n\n` +
        `Thank you for booking with Al Rais Travels!\n\n` +
        `Your booking has been confirmed with the following details:\n` +
        `Booking Reference: ${bookingRef}\n\n` +
        (ticketPdfUrl ? `Your e-ticket: ${ticketPdfUrl}\n\n` : ``) +
        `We wish you a pleasant journey!\n\n` +
        `Best regards,\n` +
        `Al Rais Travels Team`,
    );
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const handleWhatsAppShare = () => {
    const message = encodeURIComponent(
      `✈️ *Flight Booking Confirmed* ✈️\n\n` +
        `Dear ${passengerName},\n\n` +
        `Your booking with Al Rais Travels has been confirmed!\n\n` +
        `📋 *Booking Reference:* ${bookingRef}\n\n` +
        (ticketPdfUrl ? `📄 Your e-ticket: ${ticketPdfUrl}\n\n` : ``) +
        `Have a safe journey! 🌍✨`,
    );
    window.open(`https://wa.me/?text=${message}`, "_blank");
  };

  const handlePrint = () => {
    if (typeof onPrint === "function") {
      onPrint();
    }
  };

  const showFlightCard = Boolean(routeFrom && routeTo);

  return (
    <div className="fixed inset-0 z-50 share-modal">
      <div className="absolute inset-0 bg-black/60" onClick={closeModal} />

      <div className="relative z-10 grid min-h-full place-items-center p-4">
        {/* Modal card */}
        <div
          className="relative bg-white shadow-2xl overflow-hidden"
          style={{ width: "100%", maxWidth: 630, minHeight: 425, borderRadius: 12 }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="share-ticket-title"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            type="button"
            onClick={closeModal}
            className="absolute right-4 top-4 z-20 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Close"
          >
            <img src={Cross} alt="close" className="w-4 h-4" />
          </button>

          {/* ── Header section with gradient border ── */}
          <div style={{ padding: "15px 15px 0 15px" }}>
            {/* Outer gradient-border wrapper */}
            <div
              style={{
                background:
                  "linear-gradient(112.79deg, #DBEDF5 0%, #B8E4EF 100%)",
                borderRadius: 16,
                padding: 1,
              }}
            >
              {/* Inner gradient fill */}
              <div
                style={{
                  background:
                    "linear-gradient(180deg, #D2F4FE 0%, #FFFFFF 100%)",
                  borderRadius: 15,
                  height: 190,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  paddingTop: 30,
                }}
              >
                {/* Share icon container */}
                <div
                  style={{
                    width: 62,
                    height: 62,
                    borderRadius: 15,
                    background: "#FFFFFF",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 2px 10px rgba(35,81,163,0.12)",
                    flexShrink: 0,
                  }}
                >
                  <img
                    src={ShareFill}
                    alt="share"
                    style={{ width: 30, height: 30, objectFit: "contain" }}
                  />
                </div>

                {/* "Share your Ticket" title */}
                <h2
                  id="share-ticket-title"
                  style={{
                    fontFamily: "Inter, sans-serif",
                    fontWeight: 600,
                    fontSize: 18,
                    lineHeight: "100%",
                    color: "#2351A3",
                    textAlign: "center",
                    marginTop: 10,
                    marginBottom: 0,
                  }}
                >
                  Share your Ticket
                </h2>

                {/* Description */}
                <p
                  style={{
                    fontFamily: "Inter, sans-serif",
                    fontWeight: 400,
                    fontSize: 14,
                    lineHeight: "130%",
                    color: "#3D495C",
                    textAlign: "center",
                    maxWidth: 538,
                    marginTop: 8,
                    marginBottom: 0,
                    padding: "0 12px",
                  }}
                >
                  Send your flight info to family and friends. Save them the
                  search. Share your arrival time and terminal instantly.
                </p>
              </div>
            </div>
          </div>

          {/* ── Flight info card ── */}
          <div style={{ padding: "12px 15px" }}>
            <div
              style={{
                border: "1px solid #E4E4E7",
                borderRadius: 12,
                padding: "14px 16px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                background: "#FFFFFF",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                {/* Al Rais logo circle */}
                <div
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: "50%",
                    background:
                      "linear-gradient(135deg, #F0F4FF 0%, #E8EEFF 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    border: "1px solid #E4E4E7",
                  }}
                >
                  <img
                    src={AlRaisLogo}
                    alt="Al Rais"
                    style={{ width: 36, height: 36, objectFit: "contain" }}
                  />
                </div>

                {/* Route & airline details */}
                <div>
                  <div
                    style={{
                      fontFamily: "Inter, sans-serif",
                      fontWeight: 600,
                      fontSize: 16,
                      color: "#0A0C0F",
                      lineHeight: "100%",
                      marginBottom: 6,
                    }}
                  >
                    {showFlightCard
                      ? `${routeFrom} - ${routeTo}`
                      : `Ref: ${bookingRef}`}
                  </div>
                  <div
                    style={{
                      fontFamily: "Inter, sans-serif",
                      fontWeight: 400,
                      fontSize: 13,
                      color: "#3D495C",
                      lineHeight: "100%",
                    }}
                  >
                    {showFlightCard
                      ? `${airlines ?? "Multiple Airlines"}${flightDates ? ` • ${flightDates}` : ""}`
                      : passengerName}
                  </div>
                </div>
              </div>

              {/* Price (only when route info provided) */}
              {showFlightCard && pricePerSeat && (
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div
                    style={{
                      fontFamily: "Inter, sans-serif",
                      fontWeight: 400,
                      fontSize: 12,
                      color: "#3D495C",
                      lineHeight: "100%",
                      marginBottom: 4,
                    }}
                  >
                    Starting from
                  </div>
                  <div
                    style={{
                      fontFamily: "Inter, sans-serif",
                      fontWeight: 700,
                      fontSize: 18,
                      color: "#0A0C0F",
                      lineHeight: "100%",
                    }}
                  >
                    {currency}
                    {pricePerSeat}
                    <span
                      style={{ fontWeight: 400, fontSize: 13, color: "#3D495C" }}
                    >
                      /per seat
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── Action buttons ── */}
          <div
            style={{
              padding: "8px 15px 24px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 32,
            }}
          >
            {/* Copy link */}
            <button
              type="button"
              className="flex flex-col items-center gap-2"
              onClick={handleCopyLink}
            >
              <span
                className="flex h-12 w-12 items-center justify-center rounded-full"
                style={{ background: "#F2F2F3" }}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <rect
                    x="9"
                    y="9"
                    width="13"
                    height="13"
                    rx="2"
                    stroke="#3D495C"
                    strokeWidth="1.8"
                  />
                  <path
                    d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"
                    stroke="#3D495C"
                    strokeWidth="1.8"
                  />
                </svg>
              </span>
              <span
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: 12,
                  color: "#3D495C",
                }}
              >
                {copied ? "Copied!" : "Copy link"}
              </span>
            </button>

            {/* Email */}
            <button
              type="button"
              className="flex flex-col items-center gap-2"
              onClick={handleEmailShare}
            >
              <span
                className="flex h-12 w-12 items-center justify-center rounded-full"
                style={{ background: "#F2F2F3" }}
              >
                <img src={Mail} alt="mail" />
              </span>
              <span
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: 12,
                  color: "#3D495C",
                }}
              >
                Email
              </span>
            </button>

            {/* WhatsApp */}
            <button
              type="button"
              className="flex flex-col items-center gap-2"
              onClick={handleWhatsAppShare}
            >
              <span
                className="flex h-12 w-12 items-center justify-center rounded-full"
                style={{ background: "#25D366" }}
              >
                <img src={Whatsapp} alt="whatsapp" />
              </span>
              <span
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: 12,
                  color: "#3D495C",
                }}
              >
                WhatsApp
              </span>
            </button>

            {/* Print (conditional) */}
            {showPrint && (
              <button
                type="button"
                className="flex flex-col items-center gap-2"
                onClick={handlePrint}
              >
                <span
                  className="flex h-12 w-12 items-center justify-center rounded-full"
                  style={{ background: "#F2F2F3" }}
                >
                  <img src={Printer} alt="print" />
                </span>
                <span
                  style={{
                    fontFamily: "Inter, sans-serif",
                    fontSize: 12,
                    color: "#3D495C",
                  }}
                >
                  Print
                </span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
