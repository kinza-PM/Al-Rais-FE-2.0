import React, { useEffect, useMemo, useState } from "react";
import Input from "../atoms/Input";
import { AuthService } from "../../features/auth/services/authService";
import type { ResetPasswordForm as ResetPasswordFormType } from "../../features/auth/types";
import toast from "react-hot-toast";
import { getPasswordError } from "../../utils/validators";

interface ResetPasswordFormProps {
  email: string;
  onPasswordReset: () => void;
  onBackToOTP: () => void;
}

const ResetPasswordForm: React.FC<ResetPasswordFormProps> = ({
  email,
  onPasswordReset,
  onBackToOTP: _onBackToOTP,
}) => {
  const [formData, setFormData] = useState<ResetPasswordFormType>({
    email: email,
    otp: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [touched, setTouched] = useState({
    otp: false,
    newPassword: false,
    confirmPassword: false,
  });

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "otp") {
      // Only allow numbers and limit to 6 digits
      const numericValue = value.replace(/\D/g, "");
      if (numericValue.length <= 6) {
        setFormData((prev) => ({ ...prev, [name]: numericValue }));
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    if (error) setError(null);
  };

  const validatePassword = (password: string): string | null => {
    if (password.length < 8) {
      return "Password must be at least 8 characters long";
    }
    if (!/(?=.*[a-z])(?=.*[A-Z])/.test(password)) {
      return "Password must contain both uppercase and lowercase letters";
    }
    if (!/(?=.*\d)/.test(password)) {
      return "Password must contain at least one number";
    }
    if (!/(?=.*[!@#$%^&*])/.test(password)) {
      return "Password must contain at least one special character (!@#$%^&*)";
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isFormValid) {
      setTouched({
        otp: true,
        newPassword: true,
        confirmPassword: true,
      });
      return;
    }

    setLoading(true);

    try {
      const result = await AuthService.resetPasswordWithCode(formData);

      if (result.success) {
        onPasswordReset();
      } else {
        setError(result.message || "Failed to reset password");
      }
    } catch (error) {
      console.error("ResetPasswordForm error:", error);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const otpError = useMemo(() => {
    if (!formData.otp.trim()) return "Verification code is required.";
    if (!/^[0-9]+$/.test(formData.otp))
      return "Code must contain only numbers.";
    if (formData.otp.length !== 6) return "Code must be 6 digits.";
    return null;
  }, [formData.otp]);

  const passwordError = useMemo(() => {
    return getPasswordError(formData.newPassword);
  }, [formData.newPassword]);

  const confirmPasswordError = useMemo(() => {
    if (formData.confirmPassword.trim() === "")
      return "Confirm password is required.";
    if (formData.newPassword !== formData.confirmPassword)
      return "Passwords do not match.";
    return null;
  }, [formData.newPassword, formData.confirmPassword]);

  const isFormValid = useMemo(() => {
    if (!formData.otp || formData.otp.length !== 6) return false;
    if (!formData.newPassword || !formData.confirmPassword) return false;
    if (formData.newPassword !== formData.confirmPassword) return false;
    const passwordError = validatePassword(formData.newPassword);
    return passwordError === null;
  }, [formData.otp, formData.newPassword, formData.confirmPassword]);

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

          <div>
            <Input
              type="text"
              name="otp"
              label="Verification code"
              placeholder="Enter verification code"
              value={formData.otp}
              onChange={handleInputChange}
              onBlur={handleBlur}
              rounded="xl"
              required
              touched={touched.otp}
              error={Boolean(otpError)}
              errorBorderColor="#FF5270"
            />
            {touched.otp && otpError && (
              <p
                id="reset-otp-error"
                role="alert"
                aria-live="assertive"
                className="mt-1 text-sm text-red-600"
              >
                {otpError}
              </p>
            )}
          </div>

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
              touched={touched.confirmPassword}
              error={Boolean(confirmPasswordError)}
              errorBorderColor="#FF5270"
            />
            {/* Figma: "Password doesn't match" error in red */}
            {touched.confirmPassword && confirmPasswordError && (
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
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordForm;
