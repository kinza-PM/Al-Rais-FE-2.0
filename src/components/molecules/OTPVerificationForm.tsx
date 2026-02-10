import React, { useMemo, useState } from "react";
import Input from "../atoms/Input";
import { AuthService } from "../../features/auth/services/authService";
import type { OTPVerificationForm as OTPVerificationFormType } from "../../features/auth/types";
import toast from "react-hot-toast";

interface OTPVerificationFormProps {
  email: string;
  onBackToForgotPassword: () => void;
  onOTPVerified: (email: string, otp: string) => void;
}

const OTPVerificationForm: React.FC<OTPVerificationFormProps> = ({
  email,
  onBackToForgotPassword: _onBackToForgotPassword,
  onOTPVerified,
}) => {
  const [formData, setFormData] = useState<OTPVerificationFormType>({
    email: email,
    otp: "",
  });
  const [touched, setTouched] = useState({
    otp: false,
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    // Only allow numbers and limit to 6 digits
    if (name === "otp") {
      const numericValue = value.replace(/\D/g, "");
      if (numericValue.length <= 6) {
        setFormData((prev) => ({ ...prev, [name]: numericValue }));
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    // if (touched.otp) {
    //   // setTouched({ otp: false });
    // }
  };

  const handleBlur = () => setTouched({ otp: true });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ otp: true });

    if (otpError) {
      return;
    }

    setLoading(true);

    try {
      const result = await AuthService.verifyResetCode(formData);
      // console.log(result);
      if (result.success) {
        toast.success("Code verified successfully!");
        onOTPVerified(formData.email, formData.otp);
      } else {
        toast.error("The code you entered is incorrect");
      }
    } catch (err) {
      console.error("OTPVerificationForm error:", err);
      toast.error("The code you entered is incorrect");
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
        // REMOVE: setError(null);
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

  const otpError = useMemo(() => {
    if (!formData.otp.trim()) return "Verification code is required";
    if (!/^[0-9]+$/.test(formData.otp)) return "Code must contain only numbers";
    if (formData.otp.length !== 6) return "Code must be 6 digits";
    return null;
  }, [formData.otp]);

  const hasError = Boolean(otpError);

  return (
    <div className="w-full shrink-0" style={{ maxWidth: "576px" }}>
      <div
        className="rounded-xl sm:rounded-2xl bg-white shadow-lg px-6 py-8 sm:px-8"
        style={{ minHeight: "369px" }}
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Figma: Title "Verify your email" bold #0A0C0F */}
          <h3 className="text-center text-xl font-bold text-[#0A0C0F] sm:text-2xl">
            Verify your email
          </h3>

          {/* Figma: "A code has been sent to [email]" - email in blue */}
          <p className="text-center text-sm text-[#3D495C] mb-6">
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
              onBlur={handleBlur}
              rounded="xl"
              required
              touched={touched.otp}
              error={hasError}
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
          </div>

          {/* Figma: "Verify now" button - #C2CAD6, pill, white text */}
          <div className="flex justify-center pt-2">
            <button
              type="submit"
              disabled={
                loading || !formData.otp.trim() || formData.otp.length !== 6
              }
              className={`flex min-h-[47px] min-w-[156px] items-center justify-center gap-2.5 rounded-full px-10 py-3.5 font-medium text-white transition-opacity hover:opacity-95 ${loading || !formData.otp.trim() || formData.otp.length !== 6 ? "bg-[#C2CAD6] disabled:cursor-not-allowed disabled:opacity-70" : "auth-bg-btn"}`}
            >
              {loading ? "Verifying..." : "Verify now"}
            </button>
          </div>

          {/* Figma: "Haven't received the code? Resend" - Resend in blue */}
          <div className="text-center pt-4">
            <p className="text-sm text-[#3D495C]">
              Haven't received the code?{" "}
              <button
                type="button"
                onClick={handleResendCode}
                disabled={loading}
                className="text-sm font-medium text-[#5383DA] hover:underline underline disabled:opacity-50"
              >
                Resend
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OTPVerificationForm;
