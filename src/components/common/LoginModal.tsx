import { useState } from "react";
import { Modal } from "antd";
import { useLocation, useNavigate } from "react-router-dom";
import LoginForm from "../molecules/LoginForm";
import LoginFailedCard from "../molecules/LoginFailedCard";

interface LoginModalProps {
  showModal?: boolean;
  onClose?: () => void;
}

export default function LoginModal({ showModal, onClose }: LoginModalProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [showLoginFailed, setShowLoginFailed] = useState(false);

  const openSignupPage = () => {
    const currentState = location.state;
    navigate("/auth", {
      state: {
        mode: "signup",
        returnUrl: location.pathname,
        bookingData: currentState,
      },
    });
  };

  const handleForgotPassword = () => {
    navigate("/auth", {
      state: {
        mode: "forgot-password",
        returnUrl: location.pathname,
        bookingData: location.state,
      },
    });
  };

  const handleLoginSuccess = () => {
    window.location.reload();
  };

  const handleLoginFailed = () => {
    setShowLoginFailed(true);
  };

  const handleTryAgain = () => {
    setShowLoginFailed(false);
  };

  const modalOverlayStyles = {
    backgroundColor: "rgba(10, 12, 15, 0.55)",
    backdropFilter: "blur(12px) saturate(1.4)",
    WebkitBackdropFilter: "blur(12px) saturate(1.4)",
  };

  return (
    <Modal
      closable={false}
      open={showModal}
      footer={null}
      centered
      className="compareModal [&_.ant-modal-content]:!bg-transparent [&_.ant-modal-content]:!shadow-none"
      styles={{
        mask: modalOverlayStyles,
        body: { padding: 0 },
      }}
    >
      {showLoginFailed ? (
        <LoginFailedCard onTryAgain={handleTryAgain} />
      ) : (
        <LoginForm
          onSignupClick={openSignupPage}
          onLoginSuccess={handleLoginSuccess}
          onForgotPasswordClick={handleForgotPassword}
          onLoginFailed={handleLoginFailed}
          onClose={onClose}
        />
      )}
    </Modal>
  );
}
