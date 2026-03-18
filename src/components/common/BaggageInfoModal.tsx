import React from "react";
import { Modal } from "antd";
import baggageIcon from "../../assets/svgs/baggage.svg";

type SegmentBaggage = {
  fromCode?: string;
  toCode?: string;
  baggageChecked?: string | null;
  baggageCarry?: string | null;
};

type BaggageInfoModalProps = {
  open: boolean;
  onClose: () => void;
  segments: SegmentBaggage[];
};

export default function BaggageInfoModal({
  open,
  onClose,
  segments,
}: BaggageInfoModalProps) {
  const hasAnyBaggage = segments.some(
    (s) => s.baggageChecked || s.baggageCarry
  );

  return (
    <Modal
      title={
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <img src={baggageIcon} alt="Baggage" width={24} height={24} />
          <span>Baggage Allowance</span>
        </div>
      }
      open={open}
      onCancel={onClose}
      footer={null}
      width={420}
      styles={{
        body: { padding: "20px 24px" },
        header: { padding: "16px 24px", borderBottom: "1px solid #E5E7EB" },
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {!hasAnyBaggage ? (
          <p style={{ color: "#64748B", margin: 0, fontSize: 14 }}>
            No baggage allowance information available for this flight.
          </p>
        ) : (
          segments.map((seg, idx) => (
            <div
              key={idx}
              style={{
                padding: 16,
                background: "#F8FAFC",
                borderRadius: 12,
                border: "1px solid #E2E8F0",
              }}
            >
              {seg.fromCode && seg.toCode && (
                <p
                  style={{
                    margin: "0 0 12px 0",
                    fontSize: 13,
                    fontWeight: 600,
                    color: "#0F172A",
                  }}
                >
                  {seg.fromCode} → {seg.toCode}
                </p>
              )}
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {seg.baggageChecked && (
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      fontSize: 14,
                    }}
                  >
                    <span style={{ color: "#64748B" }}>Checked baggage</span>
                    <span style={{ fontWeight: 600, color: "#0F172A" }}>
                      {seg.baggageChecked}
                    </span>
                  </div>
                )}
                {seg.baggageCarry && (
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      fontSize: 14,
                    }}
                  >
                    <span style={{ color: "#64748B" }}>Carry-on</span>
                    <span style={{ fontWeight: 600, color: "#0F172A" }}>
                      {seg.baggageCarry}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
        <div
          style={{
            padding: 12,
            background: "#FEF3C7",
            borderRadius: 8,
            border: "1px solid #FCD34D",
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: 12,
              color: "#92400E",
              lineHeight: 1.5,
            }}
          >
            Excess baggage fees may apply. Please check with the airline for
            overweight or additional baggage charges.
          </p>
        </div>
      </div>
    </Modal>
  );
}
