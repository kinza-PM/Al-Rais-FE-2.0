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
}

const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({
  onBackToLogin,
  onOTPSent,
}) => {
  const [formData, setFormData] = useState<ForgotPasswordFormType>({
    email: "",
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
    setFormData((prev) => ({
      ...prev,
      [name]: name === "email" ? filterEmailInput(value) : value,
    }));
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ email: true });
    setError(null);

    if (!formData.email.trim() || emailError) {
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
    } catch (err) {
      console.error('ForgotPasswordForm error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = useMemo(() => {
    return !emailError;
  }, [emailError]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const emailHasError = Boolean(emailError);
  const hasEmailError = Boolean(touched.email && emailHasError);
  const displayError = error || (hasEmailError ? emailError : null);

  return (
    <div className="w-full shrink-0" style={{ maxWidth: '576px' }}>
      <div className="rounded-xl sm:rounded-2xl bg-white shadow-lg px-6 py-8 sm:px-8" style={{ minHeight: '369px' }}>
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
            />
            {touched.email && emailHasError && (
              <p role="alert" className="mt-1 text-sm font-medium text-[#FF5270]">
                {emailError}
              </p>
            )}
          </div>

          {/* Figma: Continue button - #C2CAD6, pill, white text */}
          <div className="flex justify-center pt-2">
            <button
              type="submit"
              disabled={loading || !isFormValid || !formData.email.trim()}
              className="flex min-h-[47px] min-w-[156px] items-center justify-center gap-2.5 rounded-full px-10 py-3.5 font-medium text-white transition-opacity hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-70"
              style={{ background: '#C2CAD6' }}
            >
              {loading ? 'Sending...' : 'Continue'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPasswordForm;
