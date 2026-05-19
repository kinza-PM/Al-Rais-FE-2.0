import { useCallback, useState } from "react";
import { message } from "antd";
import "../../assets/css/travel.css";

import Whatsapp from "../../assets/images/whatsapp.png";
import Mail from "../../assets/svgs/mail.svg";
import Cross from "../../assets/svgs/cross.svg";
import defaultAirlineLogo from "../../assets/images/emirates.png";
import type { ShareFlightListingSnapshot } from "../../utils/shareFlightListingContext";

type ShareFlightListingModalProps = {
  closeModal: () => void;
  snapshot: ShareFlightListingSnapshot;
  shareUrl?: string;
};

async function copyTextToClipboard(text: string): Promise<boolean> {
  if (!text) return false;

  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (error) {
      console.warn("Clipboard API failed. Falling back.", error);
    }
  }

  try {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.setAttribute("readonly", "");
    textArea.style.position = "fixed";
    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.width = "1px";
    textArea.style.height = "1px";
    textArea.style.opacity = "0";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const copied = document.execCommand("copy");
    document.body.removeChild(textArea);
    if (copied) return true;
  } catch (error) {
    console.warn("execCommand fallback failed.", error);
  }

  return false;
}

export default function ShareFlightListingModal({
  closeModal,
  snapshot,
  shareUrl,
}: ShareFlightListingModalProps) {
  const [copied, setCopied] = useState(false);
  const [isCopying, setIsCopying] = useState(false);

  const finalShareUrl =
    shareUrl ||
    (typeof window !== "undefined" ? window.location.href : "");

  const handleCopyLink = useCallback(async () => {
    if (!finalShareUrl) {
      void message.error("Link not available.");
      return;
    }
    setIsCopying(true);
    try {
      const success = await copyTextToClipboard(finalShareUrl);
      if (success) {
        setCopied(true);
        void message.success("Link copied to clipboard");
        setTimeout(() => setCopied(false), 2000);
      } else {
        void message.error("Unable to copy. Please try again.");
      }
    } finally {
      setIsCopying(false);
    }
  }, [finalShareUrl]);

  const handleEmailShare = useCallback(() => {
    const subject = encodeURIComponent(
      `Flight: ${snapshot.routeTitle}`,
    );
    const body = encodeURIComponent(
      `Hi,\n\nI found this flight on Al Rais Travels:\n\n${snapshot.routeTitle}\n${snapshot.infoSubtitle}\nStarting from ${snapshot.priceCompact}/per seat\n\nView search / offer:\n${finalShareUrl}\n\n`,
    );
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  }, [finalShareUrl, snapshot]);

  const handleWhatsAppShare = useCallback(() => {
    const text = encodeURIComponent(
      `✈️ *${snapshot.routeTitle}*\n${snapshot.infoSubtitle}\nStarting from ${snapshot.priceCompact}/per seat\n\n${finalShareUrl}`,
    );
    window.open(`https://wa.me/?text=${text}`, "_blank", "noopener,noreferrer");
  }, [finalShareUrl, snapshot]);

  const logoSrc =
    String(snapshot.airlineLogoUrl ?? "").trim() || defaultAirlineLogo;

  return (
    <div className="share-fly-modal-root">
      <button
        type="button"
        className="share-fly-modal-backdrop"
        aria-label="Close share dialog"
        onClick={closeModal}
      />

      <div className="share-fly-modal-center">
        <div
          className="share-fly-modal-panel"
          role="dialog"
          aria-modal="true"
          aria-labelledby="share-flight-title"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            className="share-fly-modal-close"
            onClick={closeModal}
            aria-label="Close"
          >
            <img src={Cross} alt="" width={16} height={16} />
          </button>

          <h2 id="share-flight-title" className="share-fly-modal-title">
            Share this flight
          </h2>

          <div className="share-fly-summary-card">
            <div className="share-fly-summary-card__left">
              <div className="share-fly-summary-card__logo">
                <img
                  src={logoSrc}
                  alt=""
                  onError={(e) => {
                    const t = e.target as HTMLImageElement;
                    t.onerror = null;
                    t.src = defaultAirlineLogo;
                  }}
                />
              </div>
              <div className="share-fly-summary-card__text">
                <div className="share-fly-summary-card__route">
                  {snapshot.routeTitle}
                </div>
                <div className="share-fly-summary-card__meta">
                  {snapshot.infoSubtitle}
                </div>
              </div>
            </div>
            <div className="share-fly-summary-card__price">
              <span className="share-fly-summary-card__price-label">
                Starting from
              </span>
              <div className="share-fly-summary-card__price-value">
                <strong>
                  {snapshot.priceCompact}
                  <span className="share-fly-summary-card__per">/per seat</span>
                </strong>
              </div>
            </div>
          </div>

          <div className="share-fly-actions">
            <button
              type="button"
              className="share-fly-action"
              onClick={() => void handleCopyLink()}
              disabled={isCopying}
            >
              <span className="share-fly-action__icon share-fly-action__icon--muted">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden
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
              <span className="share-fly-action__label">
                {isCopying ? "Copying…" : copied ? "Copied!" : "Copy link"}
              </span>
            </button>

            <button
              type="button"
              className="share-fly-action"
              onClick={handleEmailShare}
            >
              <span className="share-fly-action__icon share-fly-action__icon--muted">
                <img src={Mail} alt="" width={20} height={20} />
              </span>
              <span className="share-fly-action__label">Email</span>
            </button>

            <button
              type="button"
              className="share-fly-action"
              onClick={handleWhatsAppShare}
            >
              <span className="share-fly-action__icon share-fly-action__icon--wa">
                <img src={Whatsapp} alt="" width={22} height={22} />
              </span>
              <span className="share-fly-action__label">WhatsApp</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
