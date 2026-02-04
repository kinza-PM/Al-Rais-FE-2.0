import Whatsapp from "../../assets/images/whatsapp.png";
import Printer from "../../assets/svgs/printer.svg";
import Mail from "../../assets/svgs/mail.svg";
import Cross from "../../assets/svgs/cross.svg";

type ShareTicketProps = {
  closeModal: () => void;
  bookingRef: string;
  passengerName?: string;
  onPrint?: () => void;
  /** URL of the uploaded ticket PDF (from S3) for sharing */
  ticketPdfUrl?: string | null;
  /** Show Print option (e.g. hide in My Bookings listing) */
  showPrint?: boolean;
};

export default function ShareTicketModal({
  closeModal,
  bookingRef,
  passengerName = "Valued Customer",
  onPrint,
  ticketPdfUrl,
  showPrint = true,
}: ShareTicketProps) {
  const handleEmailShare = async () => {
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

  const handleWhatsAppShare = async () => {
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

  return (
    <div className="fixed inset-0 z-50 share-modal">
      <div className="absolute inset-0 bg-black/60" onClick={closeModal} />

      <div className="relative z-10 grid min-h-full place-items-center p-4">
        <div className="w-full max-w-[520px]">
          <div
            className="relative rounded-2xl bg-white shadow-xl ring-1 ring-black/5 px-6 sm:px-10 py-6 sm:py-8
                       flex flex-col min-h-[250px] sm:min-h-[360px]"
            role="dialog"
            aria-modal="true"
            aria-labelledby="share-ticket-title"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={closeModal}
              className="absolute right-4 top-4 rounded-full p-1 text-[#0A0C0F]/70"
              aria-label="Close"
            >
              <img src={Cross} alt="close" />
            </button>

            <h2
              id="share-ticket-title"
              className="text-center text-[28px] sm:text-[32px] font-medium text-[#0A0C0F] mt-2"
            >
              Share your ticket
            </h2>

            <div className="mt-auto flex items-center justify-center gap-8 sm:gap-12 pb-2">
              {showPrint && (
                <button
                  type="button"
                  className="group flex flex-col items-center gap-2"
                  onClick={handlePrint}
                >
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#F2F2F3]">
                    <img src={Printer} alt="printer" />
                  </span>
                  <span className="text-[12px] text-[#3D495C]">Print</span>
                </button>
              )}

              <button
                type="button"
                className="group flex flex-col items-center gap-2"
                onClick={handleEmailShare}
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#F2F2F3]">
                  <img src={Mail} alt="mail" />
                </span>
                <span className="text-[12px] text-[#3D495C]">Email</span>
              </button>

              <button
                type="button"
                className="group flex flex-col items-center gap-2"
                onClick={handleWhatsAppShare}
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#25D366]">
                  <img src={Whatsapp} alt="whatsapp" />
                </span>
                <span className="text-[12px] text-[#3D495C]">WhatsApp</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
