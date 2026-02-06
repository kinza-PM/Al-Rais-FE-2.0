import React, { useEffect, useMemo, useState } from "react";
import Input from "../atoms/Input";
import { AuthService } from "../../features/auth/services/authService";
import type { ResetPasswordForm as ResetPasswordFormType } from "../../features/auth/types";
import toast from "react-hot-toast";
import { getPasswordError } from "../../utils/validators";

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
  const [formData, setFormData] = useState<ResetPasswordFormType>({
    email: email,
    otp: otp,
    newPassword: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [touched, setTouched] = useState({
    newPassword: false,
    confirmPassword: false,
  });

  const handleBlur = (field: 'newPassword' | 'confirmPassword') => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError(null);
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

  const passwordError = useMemo(() => {
    return getPasswordError(formData.newPassword);
  }, [formData.newPassword]);

  const isFormValid = useMemo(() => {
    if (!formData.newPassword || !formData.confirmPassword) return false;
    if (formData.newPassword !== formData.confirmPassword) return false;
    return !passwordError;
  }, [formData.newPassword, formData.confirmPassword, passwordError]);

  const passwordsMatch = formData.newPassword && formData.confirmPassword && formData.newPassword === formData.confirmPassword;
  const showMismatchError = Boolean(touched.confirmPassword && formData.confirmPassword && !passwordsMatch);

  // Check if password meets all requirements (for green checkmark display)
  const passwordMeetsAllRequirements = useMemo(() => {
    const password = formData.newPassword;
    return password.length >= 8 &&
           /(?=.*[a-z])(?=.*[A-Z])/.test(password) &&
           /(?=.*\d)/.test(password) &&
           /(?=.*[!@#$%^&*])/.test(password);
  }, [formData.newPassword]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  return (
    <div className="w-full shrink-0" style={{ maxWidth: '576px' }}>
      <div className="rounded-xl sm:rounded-2xl bg-white shadow-lg px-6 py-8 sm:px-8" style={{ minHeight: '369px' }}>
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
              onBlur={() => handleBlur('newPassword')}
              rounded="xl"
              required
              touched={touched.newPassword}
              error={false}
            />
            {/* Figma: Green checkmark when password meets all requirements */}
            {passwordMeetsAllRequirements && (
              <div className="flex items-start gap-2 mt-2">
                <svg className="w-5 h-5 text-green-600 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <p className="text-sm text-green-600">
                  Contains letters (A-Z, a-z), digits 0-9 AND special characters.
                </p>
              </div>
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
              onBlur={() => handleBlur('confirmPassword')}
              rounded="xl"
              required
              touched={touched.confirmPassword}
              error={showMismatchError}
              errorBorderColor="#FF5270"
            />
            {/* Figma: "Password doesn't match" error in red */}
            {showMismatchError && (
              <p role="alert" className="mt-1 text-sm font-medium text-[#FF5270]">
                Password doesn't match
              </p>
            )}
          </div>

          {/* Backend API errors */}
          {error && <div className="text-[#FF5270] text-sm text-center font-medium">{error}</div>}

          {/* Figma: "Update password" button - #C2CAD6, pill */}
          <div className="flex justify-center pt-2">
            <button
              type="submit"
              disabled={!isFormValid || loading}
              className="flex min-h-[47px] min-w-[156px] items-center justify-center gap-2.5 rounded-full px-10 py-3.5 font-medium text-white transition-opacity hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-70"
              style={{ background: '#C2CAD6' }}
            >
              {loading ? 'Updating...' : 'Update password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordForm;
