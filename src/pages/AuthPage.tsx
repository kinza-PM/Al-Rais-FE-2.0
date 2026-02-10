import { useState } from "react";
import {
  ForgotPasswordForm,
  // LoginFailedCard,
  LoginForm,
  MainLayout,
  ResetPasswordForm,
  SignupForm,
} from "../components";
import type { AuthMode } from "../types/AuthTypes";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
// import OTPVerificationForm from "../components/molecules/OTPVerificationForm";

const AuthPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const initialMode =
    (location.state as { mode?: AuthMode } | undefined)?.mode ?? "login";
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");

  const handleModeSwitch = () => {
    setMode(mode === "login" ? "signup" : "login");
  };

  const handleForgotPassword = () => {
    setMode("forgot-password");
  };

  const handleBackToLogin = () => {
    setMode("login");
    setForgotPasswordEmail("");
    // setForgotPasswordOTP("");
  };

  const handleOTPSent = (email: string) => {
    setForgotPasswordEmail(email);
    // setMode("otp-verification");
    setMode("reset-password");
  };

  const handlePasswordReset = () => {
    toast.success(
      "Password reset successfully! Please log in with your new password.",
    );
    setTimeout(() => {
      handleBackToLogin();
    }, 500);
  };

  const handleBackToOTP = () => {
    setMode("otp-verification");
  };

  const onLoginClick = () => {
    setMode("login");
  };
  const onSignupClick = () => {
    setMode("signup");
  };

  return (
    <MainLayout
      addPadding={false}
      onLoginClick={onLoginClick}
      onSignupClick={onSignupClick}
    >
      <div className="flex flex-1 h-screen max-h-screen">
        {/* Signup: full-width dark background, centered card (Figma 468×976) */}
        {mode === "signup" ? (
          <div
            className="flex min-h-screen w-full flex-1 items-center justify-center overflow-y-auto px-4 py-6 sm:py-8 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
            style={{ background: "#3D495C" }}
          >
            <div className="my-auto w-full max-w-[468px] shrink-0 py-4 sm:py-6">
              <SignupForm
                onLoginClick={handleModeSwitch}
                onSignupSuccess={() => navigate("/")}
              />
            </div>
          </div>
        ) : mode === "forgot-password" ? (
          /* Reset password (forgot) flow: light background like Verify email, centered card, back button top-left */
          <div
            className="relative flex min-h-screen w-full flex-1 items-center justify-center overflow-y-auto px-4 py-6 sm:py-8 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
            style={{ background: "#F2F2F3" }}
          >
            {/* Back to login button - top-left corner of page */}
            <button
              type="button"
              onClick={handleBackToLogin}
              className="absolute left-6 top-6 text-sm text-[#0A0C0F] hover:opacity-80 sm:left-8 sm:top-8"
            >
              ← Back to login
            </button>

            <ForgotPasswordForm
              onBackToLogin={handleBackToLogin}
              onOTPSent={handleOTPSent}
            />
          </div>
        ) : mode === "reset-password" ? (
          <div
            className="relative flex min-h-screen w-full flex-1 items-center justify-center overflow-y-auto px-4 py-6 sm:py-8 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
            style={{ background: "#F2F2F3" }}
          >
            <button
              type="button"
              onClick={handleBackToLogin}
              className="absolute left-6 top-6 text-sm text-[#0A0C0F] hover:opacity-80 sm:left-8 sm:top-8"
            >
              ← Back to login
            </button>

            <ResetPasswordForm
              email={forgotPasswordEmail}
              onPasswordReset={handlePasswordReset}
              onBackToOTP={handleBackToOTP}
            />
          </div>
        ) : (
          /* Login page: dark background, centered form */
          <div
            className="relative flex min-h-screen w-full flex-1 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
            style={{ background: "#3D495C" }}
          >
            {/* Centered layout: Login form and error card side by side when error exists */}
            <div className="flex w-full min-h-full items-center justify-center gap-8 py-6 px-4 sm:py-8 sm:px-8">
              <LoginForm
                onSignupClick={handleModeSwitch}
                onLoginSuccess={() => navigate("/")}
                onForgotPasswordClick={handleForgotPassword}
              />

              {/* Login failed card (shown on right when error occurs) */}
              {/* {showLoginError && (
                <LoginFailedCard onTryAgain={handleTryAgain} />
              )} */}
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default AuthPage;
