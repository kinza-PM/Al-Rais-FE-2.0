import React, { useEffect, useMemo, useState } from "react";
import Input from "../atoms/Input";
import PasswordChecklist from "../common/PasswordChecklist";
import { AuthService } from "../../features/auth/services/authService";
import type { OTPVerificationForm as OTPVerificationFormType } from "../../features/auth/types";
import toast from "react-hot-toast";
import { closeAuthOverlay } from "../../utils/closeAuthOverlay";
import {
  evaluatePasswordRules,
  getPasswordError,
  isPasswordValid,
} from "../../utils/validators";

interface OTPVerificationFormProps {
  email: string;
  /** Prefill OTP when returning from a previous step (rare). */
  initialOtp?: string;
  onBackToForgotPassword: () => void;
  /** Called after Cognito confirms the code and new password. */
  onResetSuccess: () => void;
  /** Close modal / leave flow (Ant Modal, AuthModal overlay, or full-page). */
  onCloseModal?: () => void;
}

const OTPVerificationForm: React.FC<OTPVerificationFormProps> = ({
  email,
  initialOtp = "",
  onBackToForgotPassword,
  onResetSuccess,
  onCloseModal,
}) => {
  const [formData, setFormData] = useState<OTPVerificationFormType>({
    email: email,
    otp: initialOtp,
  });
  const [passwords, setPasswords] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [touched, setTouched] = useState({
    otp: false,
    newPassword: false,
    confirmPassword: false,
  });
  const [loading, setLoading] = useState(false);
  const [otpServerError, setOtpServerError] = useState<string | null>(null);

  useEffect(() => {
    setFormData((prev) => ({ ...prev, email }));
  }, [email]);

  useEffect(() => {
    setFormData((prev) => ({ ...prev, otp: initialOtp }));
  }, [initialOtp]);

  const mapBackendPasswordError = (msg: string | undefined): string => {
    if (!msg) return "Failed to reset password";
    const lc = msg.toLowerCase();
    if (
      lc.includes("security rules") ||
      lc.includes("password does not conform")
    ) {
      return "Your new password must meet all the requirements shown above.";
    }
    return msg;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "otp") {
      const numericValue = value.replace(/\D/g, "");
      if (numericValue.length <= 6) {
        setFormData((prev) => ({ ...prev, otp: numericValue }));
      }
      if (otpServerError) setOtpServerError(null);
      return;
    }
    if (name === "newPassword" || name === "confirmPassword") {
      setPasswords((prev) => ({ ...prev, [name]: value }));
      if (name === "newPassword" && !touched.newPassword) {
        setTouched((prev) => ({ ...prev, newPassword: true }));
      }
      if (name === "confirmPassword" && !touched.confirmPassword) {
        setTouched((prev) => ({ ...prev, confirmPassword: true }));
      }
    }
  };

  const handleBlurOtp = () => setTouched((prev) => ({ ...prev, otp: true }));

  const handleBlurPassword = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name } = e.target;
    if (name === "newPassword" || name === "confirmPassword") {
      setTouched((prev) => ({ ...prev, [name]: true }));
    }
  };

  const otpError = useMemo(() => {
    if (!formData.otp.trim()) return "Verification code is required";
    if (!/^[0-9]+$/.test(formData.otp)) return "Code must contain only numbers";
    if (formData.otp.length !== 6) return "Code must be 6 digits";
    return null;
  }, [formData.otp]);

  const passwordError = useMemo(() => {
    return getPasswordError(passwords.newPassword);
  }, [passwords.newPassword]);

  const passwordRules = useMemo(() => {
    return evaluatePasswordRules(passwords.newPassword);
  }, [passwords.newPassword]);

  const confirmPasswordError = useMemo(() => {
    if (passwords.confirmPassword.trim() === "")
      return "Confirm password is required.";
    if (passwords.newPassword !== passwords.confirmPassword)
      return "Passwords do not match.";
    return null;
  }, [passwords.newPassword, passwords.confirmPassword]);

  const isFormValid = useMemo(() => {
    if (!formData.otp || formData.otp.length !== 6 || otpError) return false;
    if (!passwords.newPassword || !passwords.confirmPassword) return false;
    if (passwords.newPassword !== passwords.confirmPassword) return false;
    return isPasswordValid(passwords.newPassword);
  }, [formData.otp, otpError, passwords]);

  const otpFieldError = Boolean(otpError || otpServerError);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setOtpServerError(null);
    setTouched({
      otp: true,
      newPassword: true,
      confirmPassword: true,
    });

    if (otpError || !isFormValid) {
      return;
    }

    setLoading(true);

    try {
      const result = await AuthService.resetPasswordWithCode({
        email: formData.email.trim(),
        otp: formData.otp,
        newPassword: passwords.newPassword,
        confirmPassword: passwords.confirmPassword,
      });

      if (result.success) {
        onResetSuccess();
      } else {
        const msg = result.message || "";
        const lower = msg.toLowerCase();
        if (
          lower.includes("verification code") ||
          lower.includes("invalid verification") ||
          lower.includes("code mismatch") ||
          lower.includes("expired")
        ) {
          setOtpServerError(msg);
        } else {
          toast.error(mapBackendPasswordError(result.message));
        }
      }
    } catch (error) {
      console.error("OTPVerificationForm error:", error);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setLoading(true);
    try {
      const result = await AuthService.forgotPassword({ email });

      if (result.success) {
        toast.success("New verification code sent to your email!");
        setOtpServerError(null);
      } else {
        toast.error(result.message || "Failed to resend code");
      }
    } catch (error) {
      console.error("Resend code error:", error);
      toast.error("Failed to resend code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCloseClick = () => {
    if (onCloseModal) {
      onCloseModal();
      return;
    }
    closeAuthOverlay();
  };

  return (
    <div className="w-full shrink-0" style={{ maxWidth: "576px" }}>
      <div
        className="rounded-xl sm:rounded-2xl bg-white shadow-lg px-6 py-8 sm:px-8 relative"
        style={{ minHeight: "369px" }}
      >
        <button
          type="button"
          onClick={handleCloseClick}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full text-[#3D495C] hover:bg-[#F2F2F3] transition-colors"
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
        </button>
        <form onSubmit={handleSubmit} className="space-y-5">
          <h3 className="text-center text-xl font-bold text-[#0A0C0F] sm:text-2xl">
            Verify your email
          </h3>

          <p className="text-center text-sm text-[#3D495C] mb-2">
            A code has been sent to{" "}
            <span className="font-medium text-[#5383DA]">{email}</span>
          </p>

          <div className="space-y-1">
            <Input
              type="text"
              name="otp"
              label="Verification code"
              placeholder="Enter verification code"
              value={formData.otp}
              onChange={handleInputChange}
              onBlur={handleBlurOtp}
              rounded="xl"
              required
              touched={touched.otp}
              error={otpFieldError}
              errorBorderColor="#FF5270"
            />
            {touched.otp && otpError && (
              <p
                role="alert"
                className="mt-1 text-sm font-medium text-[#FF5270]"
              >
                {otpError}
              </p>
            )}
            {otpServerError && !otpError && (
              <p
                role="alert"
                className="mt-1 text-sm font-medium text-[#FF5270]"
              >
                {otpServerError}
              </p>
            )}
          </div>

          <div className="border-t border-[#E8EAED] pt-5 space-y-1">
            <h4 className="text-center text-lg font-bold text-[#0A0C0F]">
              Set a new password
            </h4>
            <p className="text-center text-sm text-[#3D495C] mb-3">
              Make sure it&apos;s strong and unique.
            </p>

            <Input
              type="password"
              name="newPassword"
              label="New password"
              placeholder="••••••••••"
              value={passwords.newPassword}
              onChange={handleInputChange}
              onBlur={handleBlurPassword}
              touched={touched.newPassword}
              error={Boolean(passwordError)}
              rounded="xl"
              required
            />
            <PasswordChecklist rules={passwordRules} className="mt-2" />
            {touched.newPassword && passwordError && (
              <p
                id="otp-reset-new-password-error"
                role="alert"
                aria-live="assertive"
                className="mt-1 text-sm text-red-600"
              >
                {passwordError}
              </p>
            )}
          </div>

          <div className="space-y-1">
            <Input
              type="password"
              name="confirmPassword"
              label="Confirm password"
              placeholder="••••••••••"
              value={passwords.confirmPassword}
              onChange={handleInputChange}
              rounded="xl"
              required
              onBlur={handleBlurPassword}
              touched={
                touched.confirmPassword || passwords.confirmPassword.length > 0
              }
              error={Boolean(confirmPasswordError)}
              errorBorderColor="#FF5270"
            />
            {(touched.confirmPassword ||
              passwords.confirmPassword.length > 0) &&
              confirmPasswordError && (
                <p
                  id="otp-reset-confirm-password-error"
                  role="alert"
                  aria-live="assertive"
                  className="mt-1 text-sm text-red-600"
                >
                  {confirmPasswordError}
                </p>
              )}
          </div>

          <div className="flex justify-center pt-2">
            <button
              type="submit"
              disabled={!isFormValid || loading}
              className={`flex min-h-[47px] min-w-[156px] items-center justify-center gap-2.5 rounded-full px-10 py-3.5 font-medium text-white transition-opacity hover:opacity-95 ${!isFormValid || loading ? "bg-[#C2CAD6] disabled:cursor-not-allowed disabled:opacity-70" : "auth-bg-btn"}`}
            >
              {loading ? "Updating..." : "Update password"}
            </button>
          </div>

          <div className="text-center pt-4 space-y-2">
            <p className="text-sm text-[#3D495C]">
              Haven&apos;t received the code?{" "}
              <button
                type="button"
                onClick={handleResendCode}
                disabled={loading}
                className="text-sm font-medium text-[#5383DA] hover:underline underline disabled:opacity-50"
              >
                Resend OTP
              </button>
            </p>
            <button
              type="button"
              onClick={onBackToForgotPassword}
              disabled={loading}
              className="text-sm font-medium text-[#5383DA] hover:underline disabled:opacity-50"
            >
              Change email
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OTPVerificationForm;
