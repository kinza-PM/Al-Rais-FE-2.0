import { useEffect, useState } from "react";
import { Modal } from "antd";
import { useLocation, useNavigate } from "react-router-dom";
import LoginForm from "../molecules/LoginForm";
import LoginFailedCard from "../molecules/LoginFailedCard";
import SignupForm from "../molecules/SignupForm";
import ForgotPasswordForm from "../molecules/ForgotPasswordForm";
import ResetPasswordForm from "../molecules/ResetPasswordForm";
import { useAuth } from "../../features/auth/hooks/useAuth";

interface LoginModalProps {
  showModal?: boolean;
  onClose?: () => void;
}

export default function LoginModal({ showModal, onClose }: LoginModalProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [showLoginFailed, setShowLoginFailed] = useState(false);
  const [mode, setMode] = useState<"login" | "signup" | "forgot" | "reset">(
    "login",
  );
  const [internalOpen, setInternalOpen] = useState(true);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const { refreshAuth } = useAuth();

  const softRefresh = () => {
    // Re-run route rendering without a hard page refresh (keeps route state like booking data).
    navigate(`${location.pathname}${location.search ?? ""}`, {
      replace: true,
      state: location.state,
    });
  };

  const handleClose = () => {
    setInternalOpen(false);
    onClose?.();
  };

  // When parent asks to show the modal again, reopen our internal state.
  useEffect(() => {
    if (showModal) {
      setInternalOpen(true);
    }
  }, [showModal]);

  const handleForgotPassword = () => {
    setMode("forgot");
  };

  const handleLoginSuccess = () => {
    // No hard refresh: update auth state then close.
    void refreshAuth().finally(() => {
      softRefresh();
      // Notify the rest of the app (e.g. header) to refresh its auth snapshot.
      window.dispatchEvent(new Event("alrais:auth-changed"));
      handleClose();
    });
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
      open={Boolean(showModal) && internalOpen}
      footer={null}
      centered
      className="compareModal"
      styles={{
        mask: modalOverlayStyles,
        body: { padding: 0 },
        content: {
          padding: 0,
          background: "transparent",
          boxShadow: "none",
        },
        wrapper: {
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        },
      }}
    >
      <div className="relative flex w-full justify-center">
        {/* Close button (top-right) — anchored inside modal content */}
        {/* <button
          type="button"
          onClick={handleClose}
          className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-[#3D495C] shadow hover:bg-white"
          aria-label="Close"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path
              d="M11 3L3 11M3 3L11 11"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
        </button> */}

        <div className="w-full max-w-[468px]">
          {showLoginFailed ? (
            <LoginFailedCard onTryAgain={handleTryAgain} />
          ) : mode === "login" ? (
            <LoginForm
              onSignupClick={() => setMode("signup")}
              onLoginSuccess={handleLoginSuccess}
              onForgotPasswordClick={handleForgotPassword}
              onLoginFailed={handleLoginFailed}
              onClose={handleClose}
            />
          ) : mode === "signup" ? (
            <SignupForm
              onLoginClick={() => setMode("login")}
              onSignupSuccess={() => {
                void refreshAuth().finally(() => {
                  softRefresh();
                  window.dispatchEvent(new Event("alrais:auth-changed"));
                  handleClose();
                });
              }}
              onClose={handleClose}
              compact
              returnUrl={`${location.pathname}${location.search ?? ""}`}
              bookingData={location.state}
            />
          ) : mode === "forgot" ? (
            <ForgotPasswordForm
              onBackToLogin={() => setMode("login")}
              onOTPSent={(email) => {
                setForgotPasswordEmail(email);
                setMode("reset");
              }}
            />
          ) : (
            <ResetPasswordForm
              email={forgotPasswordEmail}
              onPasswordReset={() => setMode("login")}
              onBackToOTP={() => setMode("forgot")}
            />
          )}
        </div>
      </div>
    </Modal>
  );
}
