// import { Modal } from "antd";
import ConfirmationModal from "./ConfirmationModal";

type Props = {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function AncillaryConfirmationModal({
  open,
  onConfirm,
  onCancel,
}: Props) {
  return (
    <ConfirmationModal
      open={open}
      title="Ancillary services available"
      description="Additional services like seats, baggage, and meals are available for your booking. Would you like to view and select them now, or proceed directly to review?"
      confirmText="View ancillaries"
      cancelText="Skip"
      onConfirm={onConfirm}
      onCancel={onCancel}
    />
  );
  // return (
  //   <Modal
  //     title="Ancillary Services Available"
  //     open={open}
  //     onCancel={onCancel}
  //     closable={false}
  //     maskClosable={false}
  //     keyboard={false}
  //     footer={() => (
  //       <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
  //         <button
  //           type="button"
  //           onClick={onCancel}
  //           style={{
  //             border: "1px solid #e5e7eb",
  //             background: "#fff",
  //             padding: "8px 12px",
  //             borderRadius: 10,
  //             fontWeight: 700,
  //             cursor: "pointer",
  //           }}
  //         >
  //           Skip
  //         </button>
  //         <button
  //           type="button"
  //           onClick={onConfirm}
  //           style={{
  //             border: "1px solid #2351A3",
  //             background: "#2351A3",
  //             color: "#fff",
  //             padding: "8px 12px",
  //             borderRadius: 10,
  //             fontWeight: 700,
  //             cursor: "pointer",
  //           }}
  //         >
  //           View Ancillaries
  //         </button>
  //       </div>
  //     )}
  //   >
  //     <div style={{ color: "#374151", lineHeight: 1.6 }}>
  //       Additional services like seats, baggage, and meals are available for your
  //       booking. Would you like to view and select them now, or proceed directly
  //       to review?
  //     </div>
  //   </Modal>
  // );
}

