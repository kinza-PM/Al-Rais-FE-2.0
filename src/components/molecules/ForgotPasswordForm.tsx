import React, { useEffect, useMemo, useState } from "react";
import Input from "../atoms/Input";
import { AuthService } from "../../features/auth/services/authService";
import type { ForgotPasswordForm as ForgotPasswordFormType } from "../../features/auth/types";
import { filterEmailInput } from "../../utils/helpers";
import { getEmailError } from "../../utils/validators";
import toast from "react-hot-toast";

interface ForgotPasswordFormProps {
  onBackToLogin: () => void;
  onOTPSent: (email: string) => void;
  /** Prefill when the user returns from the OTP step via "Change email". */
  prefillEmail?: string;
}

const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({
  onBackToLogin: _onBackToLogin,
  onOTPSent,
  prefillEmail = "",
}) => {
  const [formData, setFormData] = useState<ForgotPasswordFormType>({
    email: prefillEmail,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [touched, setTouched] = useState({ email: false });

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
  };

  const emailError = useMemo(() => {
    return getEmailError(formData.email, false);
  }, [formData.email]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const MAX_EMAIL_LEN = 254; // RFC standard practical maximum
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "email"
          ? filterEmailInput(value).slice(0, MAX_EMAIL_LEN)
          : value,
    }));
    if (name === "email" && !touched.email) {
      setTouched((prev) => ({ ...prev, email: true }));
    }
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.email) {
      setError("Please enter your email address");
      return;
    }

    setLoading(true);

    try {
      const result = await AuthService.forgotPassword(formData);

      if (result.success) {
        onOTPSent(formData.email);
      } else {
        setError(result.message || "Failed to send reset code");
      }
    } catch (error) {
      console.error("ForgotPasswordForm error:", error);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = useMemo(() => {
    return !emailError;
  }, [emailError]);

  useEffect(() => {
    if (prefillEmail) {
      setFormData((prev) => ({ ...prev, email: prefillEmail }));
    }
  }, [prefillEmail]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const emailHasError = Boolean(emailError);

  return (
    <div className="w-full shrink-0" style={{ maxWidth: "576px" }}>
      <div
        className="rounded-xl sm:rounded-2xl bg-white shadow-lg px-6 py-8 sm:px-8 relative"
        style={{ minHeight: "369px" }}
      >
        {/* Close button — inside the card, top-right corner (same pattern as Login/Signup) */}
        <button
          type="button"
          onClick={() => {
            // Prefer AntD modal close if present
            const antClose = document.querySelector(
              ".ant-modal .ant-modal-close",
            ) as HTMLElement | null;
            if (antClose) {
              antClose.click();
              return;
            }
            // Fallback to custom AuthModal backdrop
            const backdrop = document.querySelector(
              ".modal-overlay .absolute.inset-0",
            ) as HTMLElement | null;
            if (backdrop) {
              backdrop.click();
              return;
            }
            // Last resort: browser back
            try {
              window.history.back();
            } catch {}
          }}
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
          {/* Figma: Title "Reset password" bold #0A0C0F */}
          <h3 className="text-center text-xl font-bold text-[#0A0C0F] sm:text-2xl">
            Reset password
          </h3>
          {/* Figma: Instruction text */}
          <p className="text-center text-sm text-[#3D495C] mb-6">
            Enter your email address to receive a verification code.
          </p>

          <div className="space-y-1">
            <Input
              type="email"
              name="email"
              label="Email"
              placeholder="Enter your email address"
              value={formData.email}
              onChange={handleInputChange}
              onBlur={handleBlur}
              rounded="xl"
              required
              touched={touched.email}
              error={emailHasError}
              errorBorderColor="#FF5270"
              inputProps={{
                maxLength: 254,
                autoComplete: "email",
                inputMode: "email",
                spellCheck: false,
                onPaste: (e) => {
                  const pasted = (e.clipboardData?.getData("text") || "").trim();
                  const sanitized = filterEmailInput(pasted).slice(0, 254);
                  e.preventDefault();
                  setFormData((prev) => ({ ...prev, email: sanitized }));
                  if (!touched.email) {
                    setTouched((prev) => ({ ...prev, email: true }));
                  }
                },
              }}
            />
            {touched.email && emailHasError && (
              <p
                role="alert"
                className="mt-1 text-sm font-medium text-[#FF5270]"
              >
                {emailError}
              </p>
            )}
          </div>

          {/* Figma: Continue button - #C2CAD6, pill, white text */}
          <div className="flex justify-center pt-2">
            <button
              type="submit"
              disabled={loading || !isFormValid || !formData.email.trim()}
              className={`flex min-h-[47px] min-w-[156px] items-center justify-center gap-2.5 rounded-full px-10 py-3.5 font-medium text-white transition-opacity hover:opacity-95 ${loading || !isFormValid || !formData.email.trim() ? " bg-[#C2CAD6] disabled:cursor-not-allowed disabled:opacity-70" : "auth-bg-btn"}`}
            >
              {loading ? "Sending..." : "Continue"}
            </button>
          </div>

          {/* Go back to login */}
          <div className="mt-3 text-center">
            <button
              type="button"
              onClick={_onBackToLogin}
              className="text-sm text-[#5383DA] hover:underline font-medium"
              aria-label="Back to login"
            >
              Back to login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPasswordForm;
