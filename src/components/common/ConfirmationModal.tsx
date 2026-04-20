import { Modal } from "antd";
import type { ReactNode } from "react";
import Button from "../atoms/Button";

type ConfirmationModalProps = {
  open: boolean;
  title: string;
  description: string | ReactNode;
  note?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
};

const modalOverlayStyles = {
  backgroundColor: "rgba(10, 12, 15, 0.55)",
  backdropFilter: "blur(12px) saturate(1.4)",
  WebkitBackdropFilter: "blur(12px) saturate(1.4)",
};

export default function ConfirmationModal({
  open,
  title,
  description,
  note,
  confirmText = "Proceed",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  loading = false,
}: ConfirmationModalProps) {
  return (
    <Modal
      open={open}
      onCancel={onCancel}
      closable={true}
      maskClosable={false}
      keyboard={false}
      footer={null}
      centered
      styles={{
        mask: modalOverlayStyles,
        body: { padding: 0 },
        content: {
          padding: "32px 32px 28px",
          borderRadius: 20,
          boxShadow: "0 32px 64px rgba(0,0,0,0.22)",
        },
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 20 }}>
        {/* <div style={{
          width: 44, height: 44, borderRadius: "50%",
          background: "#EFF6FF", display: "flex",
          alignItems: "center", justifyContent: "center", flexShrink: 0,
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
            stroke="#185FA5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 16v-4M12 8h.01" />
          </svg>
        </div> */}
        <div style={{ display: "flex", flexDirection: "column", gap: 3, justifyContent: "center" }}>
          <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#111827" }}>{title}</p>
          <p style={{ margin: 0, fontSize: 12, color: "#9CA3AF" }}>Review before proceeding</p>
        </div>
      </div>

      {/* <div style={{ height: 1, background: "#F3F4F6", margin: "0 -32px 20px" }} /> */}

      {typeof description === "string" ? (
        <p style={{ color: "#374151", lineHeight: 1.65, fontSize: 14, marginBottom: 16 }}>
          {description}
        </p>
      ) : (
        <div style={{ color: "#374151", lineHeight: 1.65, fontSize: 14, marginBottom: 16 }}>
          {description}
        </div>
      )}

      {note && (
        <div style={{
          background: "#F0F6FF", borderRadius: 10, padding: "12px 14px",
          marginBottom: 24, fontSize: 13, color: "#4B5563",
          lineHeight: 1.6, borderLeft: "3px solid #2351A3",
        }}>
          {note}
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, paddingTop: 4 }}>
        <Button
          type="button"
          onClick={onCancel}
          disabled={loading}
          style={{
            padding: "10px 22px", borderRadius: 100,
            border: "1px solid #E5E7EB", background: "#F9FAFB",
            fontWeight: 600, cursor: "pointer", fontSize: 14, color: "#374151",
          }}
          overrideClasses
        >
          {cancelText}
        </Button>
        <Button
          type="button"
          onClick={onConfirm}
          disabled={loading}
          style={{
            padding: "10px 24px", borderRadius: 100,
            border: "1px solid #2351A3", background: "#2351A3",
            color: "#fff", fontWeight: 600, cursor: "pointer", fontSize: 14,
            boxShadow: "0 2px 8px rgba(35,81,163,0.25)",
            opacity: loading ? 0.7 : 1,
          }}
          overrideClasses
        >
          {loading ? "Please wait..." : confirmText}
        </Button>
      </div>
    </Modal>
  );
}