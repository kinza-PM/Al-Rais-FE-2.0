import { useState } from "react";
import bgImage from "../assets/images/bgImage.png";
import {
  ForgotPasswordForm,
  LoginForm,
  MainLayout,
  OTPVerificationForm,
  ResetPasswordForm,
  SignupForm
} from "../components";
import type { AuthMode } from "../types/AuthTypes";
import { useLocation, useNavigate } from "react-router-dom";

const AuthPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const initialMode = (location.state as { mode?: AuthMode } | undefined)?.mode ?? "login";
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const [forgotPasswordOTP, setForgotPasswordOTP] = useState("");
  const handleModeSwitch = () => {
    setMode(mode === "login" ? "signup" : "login");
  };

  const handleForgotPassword = () => {
    setMode("forgot-password");
  };

  const handleBackToLogin = () => {
    setMode("login");
    setForgotPasswordEmail("");
    setForgotPasswordOTP("");
  };

  const handleOTPSent = (email: string) => {
    setForgotPasswordEmail(email);
    setMode("otp-verification");
  };

  const handleOTPVerified = (email: string, otp: string) => {
    setForgotPasswordEmail(email);
    setForgotPasswordOTP(otp);
    setMode("reset-password");
  };

  const handlePasswordReset = () => {
    alert("Password reset successfully! Please log in with your new password.");
    handleBackToLogin();
  };

  const handleBackToForgotPassword = () => {
    setMode("forgot-password");
    setForgotPasswordOTP("");
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
        <div className="w-1/3 h-full justify-center items-center flex overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          <div className="w-full max-w-md px-8 py-10">
            {mode === "login" && (
              <LoginForm
                onSignupClick={handleModeSwitch}
                onLoginSuccess={() => navigate("/")}
                onForgotPasswordClick={handleForgotPassword}
              />
            )}
            {mode === "signup" && (
              <SignupForm
                onLoginClick={handleModeSwitch}
                onSignupSuccess={() => navigate("/")}
              // onSignupSuccess={handleBackToLogin}
              />
            )}
            {mode === "forgot-password" && (
              <ForgotPasswordForm
                onBackToLogin={handleBackToLogin}
                onOTPSent={handleOTPSent}
              />
            )}
            {mode === "otp-verification" && (
              <OTPVerificationForm
                email={forgotPasswordEmail}
                onBackToForgotPassword={handleBackToForgotPassword}
                onOTPVerified={handleOTPVerified}
              />
            )}
            {mode === "reset-password" && (
              <ResetPasswordForm
                email={forgotPasswordEmail}
                otp={forgotPasswordOTP}
                onPasswordReset={handlePasswordReset}
                onBackToOTP={handleBackToOTP}
              />
            )}
          </div>
        </div>
        <div className="flex-1">
          <img src={bgImage} alt="" className="h-full w-full" />
        </div>
      </div>
    </MainLayout>
  );
};

export default AuthPage;
