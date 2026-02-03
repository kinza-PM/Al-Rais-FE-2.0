import React, { useEffect, useMemo, useState } from "react";
import Input from "../atoms/Input";
import Button from "../atoms/Button";
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
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const emailHasError = Boolean(emailError);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="text-center mb-6">
        <h3 className="text-lg font-medium text-gray-800 mb-2">
          Forgot Password
        </h3>
        <p className="text-sm text-gray-600">
          Enter your email address and we'll send you a verification code to
          reset your password.
        </p>
      </div>

      <div>
        <Input
          type="email"
          name="email"
          label="Email"
          placeholder="Enter your email address"
          value={formData.email}
          onChange={handleInputChange}
          rounded="xl"
          onBlur={handleBlur}
          touched={touched.email}
          error={emailHasError}
          required
        />
        {touched.email && emailHasError && (
          <p
            id="forgot-email-error"
            role="alert"
            aria-live="assertive"
            className="mt-1 text-sm text-red-600"
          >
            {emailError}
          </p>
        )}
      </div>

      {/* {error && <div className="text-red-500 text-sm text-center">{error}</div>} */}

      <div className="flex justify-center">
        <Button
          type="submit"
          variant="primary"
          disabled={!isFormValid || loading}
        >
          {loading ? "Sending..." : "Send Reset Code"}
        </Button>
      </div>

      <div className="text-center">
        <button
          type="button"
          onClick={onBackToLogin}
          className="text-sm text-primary hover:underline"
        >
          Back to Login
        </button>
      </div>
    </form>
  );
};

export default ForgotPasswordForm;
