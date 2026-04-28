import React, { useEffect, useMemo, useState } from "react";
import Input from "../atoms/Input";
import { AuthService } from "../../features/auth/services/authService";
import type { ResetPasswordForm as ResetPasswordFormType } from "../../features/auth/types";
import toast from "react-hot-toast";
import { getPasswordError, evaluatePasswordRules, isPasswordValid } from "../../utils/validators";
import PasswordChecklist from "../common/PasswordChecklist";

interface ResetPasswordFormProps {
  email: string;
  otp: string;
  onPasswordReset: () => void;
  onBackToOTP: () => void;
}

const ResetPasswordForm: React.FC<ResetPasswordFormProps> = ({
  email,
  otp,
  onPasswordReset,
  onBackToOTP: _onBackToOTP,
}) => {
  const [formData, setFormData] = useState<
    Pick<ResetPasswordFormType, "newPassword" | "confirmPassword">
  >({
    newPassword: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [touched, setTouched] = useState({
    newPassword: false,
    confirmPassword: false,
  });

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Enable real-time validation feedback
    if (name === "newPassword" && !touched.newPassword) {
      setTouched((prev) => ({ ...prev, newPassword: true }));
    }
    if (name === "confirmPassword" && !touched.confirmPassword) {
      setTouched((prev) => ({ ...prev, confirmPassword: true }));
    }
    if (error) setError(null);
  };

  // Friendly mapping for backend generic password errors
  const mapBackendPasswordError = (msg: string | undefined): string => {
    if (!msg) return "Failed to reset password";
    const lc = msg.toLowerCase();
    if (lc.includes("security rules") || lc.includes("password does not conform")) {
      return "Your new password must meet all the requirements shown above.";
    }
    // Otherwise return the same message
    return msg;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isFormValid) {
      setTouched({
        newPassword: true,
        confirmPassword: true,
      });
      return;
    }

    setLoading(true);

    try {
      const result = await AuthService.resetPasswordWithCode({
        email,
        otp,
        newPassword: formData.newPassword,
        confirmPassword: formData.confirmPassword,
      });

      if (result.success) {
        onPasswordReset();
      } else {
        setError(mapBackendPasswordError(result.message));
      }
    } catch (error) {
      console.error("ResetPasswordForm error:", error);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const passwordError = useMemo(() => {
    return getPasswordError(formData.newPassword);
  }, [formData.newPassword]);

  const passwordRules = useMemo(() => {
    return evaluatePasswordRules(formData.newPassword);
  }, [formData.newPassword]);

  const confirmPasswordError = useMemo(() => {
    if (formData.confirmPassword.trim() === "")
      return "Confirm password is required.";
    if (formData.newPassword !== formData.confirmPassword)
      return "Passwords do not match.";
    return null;
  }, [formData.newPassword, formData.confirmPassword]);

  const isFormValid = useMemo(() => {
    if (!otp || otp.length !== 6) return false;
    if (!formData.newPassword || !formData.confirmPassword) return false;
    if (formData.newPassword !== formData.confirmPassword) return false;
    return isPasswordValid(formData.newPassword);
  }, [otp, formData.newPassword, formData.confirmPassword]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  return (
    <div className="w-full shrink-0" style={{ maxWidth: "576px" }}>
      <div
        className="rounded-xl sm:rounded-2xl bg-white shadow-lg px-6 py-8 sm:px-8"
        style={{ minHeight: "369px" }}
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Figma: Title "Set a new password" bold #0A0C0F */}
          <h3 className="text-center text-xl font-bold text-[#0A0C0F] sm:text-2xl">
            Set a new password
          </h3>

          {/* Figma: Subtitle "Make sure it's strong and unique." */}
          <p className="text-center text-sm text-[#3D495C] mb-6">
            Make sure it's strong and unique.
          </p>

          <div className="space-y-1">
            <Input
              type="password"
              name="newPassword"
              label="New password"
              placeholder="••••••••••"
              value={formData.newPassword}
              onChange={handleInputChange}
              onBlur={handleBlur}
              touched={touched.newPassword}
              error={Boolean(passwordError)}
              rounded="xl"
              required
            />
            {/* Live password checklist */}
            <PasswordChecklist rules={passwordRules} className="mt-2" />
            {touched.newPassword && passwordError && (
              <p
                id="reset-new-password-error"
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
              value={formData.confirmPassword}
              onChange={handleInputChange}
              rounded="xl"
              required
              onBlur={handleBlur}
              touched={touched.confirmPassword || formData.confirmPassword.length > 0}
              error={Boolean(confirmPasswordError)}
              errorBorderColor="#FF5270"
            />
            {/* Figma: "Password doesn't match" error in red */}
            {(touched.confirmPassword || formData.confirmPassword.length > 0) && confirmPasswordError && (
              <p
                id="reset-confirm-password-error"
                role="alert"
                aria-live="assertive"
                className="mt-1 text-sm text-red-600"
              >
                {confirmPasswordError}
              </p>
            )}
          </div>

          {/* Backend API errors */}
          {/* {error && (
            <div className="text-[#FF5270] text-sm text-center font-medium">
              {error}
            </div>
          )} */}

          {/* Figma: "Update password" button - #C2CAD6, pill */}
          <div className="flex justify-center pt-2">
            <button
              type="submit"
              disabled={!isFormValid || loading}
              className={`flex min-h-[47px] min-w-[156px] items-center justify-center gap-2.5 rounded-full px-10 py-3.5 font-medium text-white transition-opacity hover:opacity-95 ${!isFormValid || loading ? "bg-[#C2CAD6] disabled:cursor-not-allowed disabled:opacity-70" : "auth-bg-btn"}`}
            >
              {loading ? "Updating..." : "Update password"}
            </button>
          </div>

          {/* Back link for easy exit/navigation */}
          <div className="mt-3 text-center">
            <button
              type="button"
              onClick={_onBackToOTP}
              className="text-sm text-[#5383DA] hover:underline font-medium"
              aria-label="Back"
            >
              Back
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordForm;
