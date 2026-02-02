import React, { useEffect, useMemo, useState } from "react";
import Input from "../atoms/Input";
import Button from "../atoms/Button";
import { AuthService } from "../../features/auth/services/authService";
import type { ResetPasswordForm as ResetPasswordFormType } from "../../features/auth/types";

interface ResetPasswordFormProps {
  email: string;
  onPasswordReset: () => void;
  onBackToForgotPassword: () => void;
}

const ResetPasswordForm: React.FC<ResetPasswordFormProps> = ({
  email,
  onPasswordReset,
  onBackToForgotPassword,
}) => {
  const [formData, setFormData] = useState<ResetPasswordFormType>({
    email: email,
    otp: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordRequirements, setPasswordRequirements] = useState({
    minLength: false,
    hasUpperAndLower: false,
    hasNumber: false,
    hasSpecialChar: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

    if (!formData.newPassword || !formData.confirmPassword) {
      setError("Please fill in all fields");
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    const passwordError = validatePassword(formData.newPassword);
    if (passwordError) {
      setError(passwordError);
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

  const isFormValid = useMemo(() => {
    if (!formData.otp || formData.otp.length !== 6) return false;
    if (!formData.newPassword || !formData.confirmPassword) return false;
    if (formData.newPassword !== formData.confirmPassword) return false;
    const passwordError = validatePassword(formData.newPassword);
    return passwordError === null;
  }, [formData.otp, formData.newPassword, formData.confirmPassword]);

  useEffect(() => {
    const password = formData.newPassword;
    setPasswordRequirements({
      minLength: password.length >= 8,
      hasUpperAndLower: /(?=.*[a-z])(?=.*[A-Z])/.test(password),
      hasNumber: /(?=.*\d)/.test(password),
      hasSpecialChar: /(?=.*[!@#$%^&*])/.test(password),
    });
  }, [formData.newPassword]);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="text-center mb-6">
        <h3 className="text-lg font-medium text-gray-800 mb-2">
          Reset Password
        </h3>
        <p className="text-sm text-gray-600">
          Enter the verification code and create a new password
        </p>
      </div>

      <Input
        type="text"
        name="otp"
        label="Verification Code"
        placeholder="Enter 6-digit code"
        value={formData.otp}
        onChange={handleInputChange}
        rounded="xl"
        required
        className="text-center text-lg tracking-widest"
      />

      <Input
        type="password"
        name="newPassword"
        label="New Password"
        placeholder="Enter new password"
        value={formData.newPassword}
        onChange={handleInputChange}
        rounded="xl"
        required
      />

      <Input
        type="password"
        name="confirmPassword"
        label="Confirm New Password"
        placeholder="Confirm new password"
        value={formData.confirmPassword}
        onChange={handleInputChange}
        rounded="xl"
        required
      />

      {/* <div className="text-xs text-gray-500 space-y-1">
        <p>Password requirements:</p>
        <ul className="list-disc pl-4 space-y-1">
          <li>At least 8 characters long</li>
          <li>Contains uppercase and lowercase letters</li>
          <li>Contains at least one number</li>
          <li>Contains at least one special character (!@#$%^&*)</li>
        </ul>
      </div> */}
      <div className="text-xs text-gray-500 space-y-1">
        <p>Password requirements:</p>
        <ul className="space-y-1">
          <li className="flex items-center gap-2">
            {passwordRequirements.minLength ? (
              <span className="text-green-600">✓</span>
            ) : (
              <span className="text-gray-400">•</span>
            )}
            <span
              className={passwordRequirements.minLength ? "text-green-600" : ""}
            >
              At least 8 characters long
            </span>
          </li>
          <li className="flex items-center gap-2">
            {passwordRequirements.hasUpperAndLower ? (
              <span className="text-green-600">✓</span>
            ) : (
              <span className="text-gray-400">•</span>
            )}
            <span
              className={
                passwordRequirements.hasUpperAndLower ? "text-green-600" : ""
              }
            >
              Contains uppercase and lowercase letters
            </span>
          </li>
          <li className="flex items-center gap-2">
            {passwordRequirements.hasNumber ? (
              <span className="text-green-600">✓</span>
            ) : (
              <span className="text-gray-400">•</span>
            )}
            <span
              className={passwordRequirements.hasNumber ? "text-green-600" : ""}
            >
              Contains at least one number
            </span>
          </li>
          <li className="flex items-center gap-2">
            {passwordRequirements.hasSpecialChar ? (
              <span className="text-green-600">✓</span>
            ) : (
              <span className="text-gray-400">•</span>
            )}
            <span
              className={
                passwordRequirements.hasSpecialChar ? "text-green-600" : ""
              }
            >
              Contains at least one special character (!@#$%^&*)
            </span>
          </li>
        </ul>
      </div>

      {error && <div className="text-red-500 text-sm text-center">{error}</div>}

      <div className="flex justify-center">
        <Button
          type="submit"
          variant="primary"
          disabled={!isFormValid || loading}
        >
          {loading ? "Resetting..." : "Reset Password"}
        </Button>
      </div>

      <div className="text-center">
        <button
          type="button"
          onClick={onBackToForgotPassword}
          className="text-sm text-gray-600 hover:underline"
        >
          Request a new code
        </button>
      </div>
    </form>
  );
};

export default ResetPasswordForm;
