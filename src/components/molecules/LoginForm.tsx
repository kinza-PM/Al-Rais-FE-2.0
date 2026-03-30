import React, { useEffect, useMemo, useState } from "react";
import Input from "../atoms/Input";
import { useAuth } from "../../features/auth/hooks/useAuth";
import { Link } from "react-router-dom";
import { useNetworkStatus } from "../../context/NetworkStatusContext";
import { PhoneInput } from "react-international-phone";
import "react-international-phone/style.css";
import { filterEmailInput } from "../../utils/helpers";
import toast from "react-hot-toast";
import logoSmall from "../../assets/images/logo-small.png";

interface LoginFormProps {
  onSignupClick: () => void;
  onLoginSuccess?: () => void;
  onForgotPasswordClick?: () => void;
  onLoginFailed?: () => void;
  onClose?: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({
  onSignupClick,
  onLoginSuccess,
  onForgotPasswordClick,
  onLoginFailed,
  onClose,
}) => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [usePhone, setUsePhone] = useState(false);
  const [phoneCountryCode, setPhoneCountryCode] = useState("+1");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [resendLoading, setResendLoading] = useState(false);
  const [touched, setTouched] = useState({ email: false, password: false });
  const { login, loading, error, clearError, resendConfirmationCode } =
    useAuth();
  const { isOnline } = useNetworkStatus();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "email"
          ? filterEmailInput(value).slice(0, 254)
          : value,
    }));
    if (name === "email" && !touched.email) {
      setTouched((prev) => ({ ...prev, email: true }));
    }
    if (error) clearError();
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
  };

  const handlePhoneBlur = () => {
    setTouched((prev) => ({ ...prev, email: true }));
  };

  const isEmailValid = (value: string) => {
    const trimmed = value.trim();
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isOnline) {
      toast.error(
        "No internet connection. Check your connection and try again.",
      );
      return;
    }

    if (!isFormValid) {
      setTouched({ email: true, password: true });
      return;
    }

    // Combine phone country code and number if using phone
    const identifier = usePhone
      ? `${phoneCountryCode}${phoneNumber.trim()}`
      : formData.email.trim();
    const loginData = {
      email: identifier,
      password: formData.password,
    };

    if (!loginData.email || !loginData.password) return;

    const result = await login(loginData);
    if (result.success) {
      toast.success("Login successful!");
      setTimeout(() => {
        onLoginSuccess?.();
      }, 2000);
    } else {
      handleLoginError(result);
    }
  };

  const handleLoginError = (result: any) => {
    const errorMessage = result.message || "Login failed. Please try again.";

    const errorActions: Record<string, () => void> = {
      INVALID_CREDENTIALS: () => {
        if (onLoginFailed) {
          onLoginFailed();
        } else {
          showErrorWithAction(errorMessage, "Reset password", onForgotPasswordClick);
        }
      },
      PASSWORD_RESET_REQUIRED: () =>
        showErrorWithAction(
          errorMessage,
          "Reset password",
          onForgotPasswordClick,
        ),
      USER_NOT_FOUND: () =>
        showErrorWithAction(errorMessage, "Sign up", onSignupClick),
      USER_NOT_CONFIRMED: () =>
        showErrorWithAction(
          errorMessage,
          "Resend verification code",
          handleResendConfirmation,
          6000,
        ),
    };

    if (result.errorCode && errorActions[result.errorCode]) {
      errorActions[result.errorCode]();
    } else {
      toast.error(errorMessage);
      if (result.errorRef) {
        toast.error(`Reference ID: ${result.errorRef}`, { duration: 6000 });
      }
    }
  };

  const showErrorWithAction = (
    message: string,
    actionText: string,
    onAction?: () => void,
    duration = 5000,
  ) => {
    toast.error(
      <div>
        <p>{message}</p>
        {onAction && (
          <button
            onClick={() => {
              toast.dismiss();
              onAction();
            }}
            className="mt-2 text-sm underline hover:no-underline"
          >
            {actionText}
          </button>
        )}
      </div>,
      { duration },
    );
  };

  const emailError = useMemo(() => {
    if (usePhone) {
      const phoneTrim = phoneNumber.trim();
      if (!phoneTrim) return "Phone number is required.";
      if (!/^[0-9]+$/.test(phoneTrim))
        return "Enter a valid phone number with country code.";
      if (phoneTrim.length < 7 || phoneTrim.length > 15) {
        return "Enter a valid phone number with country code.";
      }
      return null;
    }

    if (!formData.email.trim()) return "Email is required.";
    if (formData.email !== formData.email.trim()) {
      return "Remove spaces at the beginning or end of your email.";
    }
    if (!isEmailValid(formData.email)) return "Enter a valid email address.";
    return null;
  }, [formData.email, usePhone, phoneNumber]);

  const passwordError = useMemo(() => {
    if (!formData.password.trim()) return "Password is required.";
    if (formData.password !== formData.password.trim()) {
      return "Remove spaces at the beginning or end of your password.";
    }
    if (formData.password.length < 8) {
      return "Password must be at least 8 characters.";
    }
    return null;
  }, [formData.password]);

  const isFormValid = useMemo(() => {
    return !emailError && !passwordError;
  }, [emailError, passwordError]);

  useEffect(() => {
    setTouched({ email: false, password: false });

    setFormData({
      email: "",
      password: "",
    });
    setPhoneNumber("");
    setPhoneCountryCode("+1");
    clearError();
  }, [usePhone]);

  const emailHasError = Boolean(emailError);
  const passwordHasError = Boolean(passwordError);

  const handleResendConfirmation = async () => {
    if (resendLoading) return;
    const identifier = usePhone
      ? `${phoneCountryCode}${phoneNumber.trim()}`
      : formData.email.trim();
    if (!identifier) return;
    setResendLoading(true);
    // setSubmitError(null);
    const result = await resendConfirmationCode(identifier);
    setResendLoading(false);
    if (result.success) {
      // setLoginMessage("Verification code sent.");
      toast.success("Verification code sent.");
    } else {
      toast.error(result.message || "Failed to resend verification code.");
    }
  };

  return (
    <div className="flex items-center justify-center">
      <div className="relative bg-white rounded-2xl shadow-lg w-full max-w-[424px] px-8 py-8" style={{ minHeight: "600px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
        {/* Close button — inside the card, top-right corner */}
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full text-[#3D495C] hover:bg-[#F2F2F3] transition-colors"
            aria-label="Close"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M11 3L3 11M3 3L11 11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
          </button>
        )}
        <div className="flex justify-center mb-6">
          <Link
            to="/"
            aria-label="Go to home page"
            className="rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <img
              src={logoSmall}
              alt="Al Rais Travel"
              className="h-11 w-[60px] object-contain"
            />
          </Link>
        </div>

        <h2 className="text-center text-xl font-bold text-[#0A0C0F] mb-1 sm:text-2xl">
          Welcome back
        </h2>
        <p className="text-center text-sm text-[#3D495C] mb-6">
          Please login to continue
        </p>

        {/* Toggle Buttons */}
        <div className="flex justify-center mb-6">
          <div className="flex items-center rounded-xl ring-1 ring-[#C2CAD6] px-2 py-1">
            <button
              type="button"
              onClick={() => {
                setUsePhone(false);
                setTouched((prev) => ({ ...prev, email: false }));
              }}
              className={`px-7 py-2 text-[14px] rounded-xl transition-colors ${
                !usePhone ? "bg-[#2351A3] text-white" : "text-[#3D495C]"
              }`}
            >
              Email
            </button>
            <button
              type="button"
              onClick={() => {
                setUsePhone(true);
                setTouched((prev) => ({ ...prev, email: false }));
              }}
              className={`px-7 py-2 text-[14px] rounded-xl transition-colors ${
                usePhone ? "bg-[#2351A3] text-white" : "text-[#3D495C]"
              }`}
            >
              Phone
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-normal text-[#3D495C]">
              {usePhone ? "Phone" : "Email"}
            </label>
            {usePhone ? (
              <div className="flex gap-2">
                <PhoneInput
                  defaultCountry="us"
                  value={`${phoneCountryCode}${phoneNumber}`}
                  onChange={(phone, meta) => {
                    setPhoneCountryCode(`+${meta.country.dialCode}`);
                    setPhoneNumber(
                      phone.replace(`+${meta.country.dialCode}`, ""),
                    );
                    if (error) clearError();
                  }}
                  hideDropdown={false}
                  forceDialCode={true}
                  style={{
                    width: "100%",
                    display: "flex",
                    gap: "8px",
                  }}
                  onBlur={handlePhoneBlur}
                  countrySelectorStyleProps={{
                    buttonStyle: {
                      width: "96px",
                      height: "40px",
                      borderRadius: "12px",
                      border: "1px solid #C2CAD6",
                      background: "white",
                      padding: "8px 12px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "8px",
                    },
                  }}
                  inputStyle={{
                    width: "100%",
                    flex: 1,
                    height: "40px",
                    borderRadius: "12px",
                    border:
                      touched.email && emailHasError
                        ? "1px solid #EA0029"
                        : "1px solid #C2CAD6",
                    padding: "8px 12px",
                    fontSize: "14px",
                    color: "#3D495C",
                    fontFamily: "inherit",
                  }}
                  inputProps={{
                    placeholder: "Phone",
                    "aria-invalid":
                      touched.email && emailHasError ? "true" : "false",
                    "aria-describedby":
                      touched.email && emailHasError
                        ? "login-email-error"
                        : undefined,
                  }}
                />
              </div>
            ) : (
              <Input
                type="email"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleInputChange}
                onBlur={handleBlur}
                touched={touched.email}
                error={emailHasError}
                rounded="xl"
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
                  "aria-invalid":
                    touched.email && emailHasError ? "true" : "false",
                  "aria-describedby":
                    touched.email && emailHasError
                      ? "login-email-error"
                      : undefined,
                }}
              />
            )}
            {touched.email && emailHasError && (
              <p
                id="login-email-error"
                role="alert"
                aria-live="assertive"
                className="mt-1 text-sm font-medium text-[#EA0029]"
              >
                {emailError}
              </p>
            )}
          </div>

          <div>
            <label className="text-xs font-normal text-[#3D495C]">
              Password
            </label>
            <Input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleInputChange}
              onBlur={handleBlur}
              touched={touched.password}
              error={passwordHasError}
              rounded="xl"
              inputProps={{
                "aria-invalid":
                  touched.password && passwordHasError ? "true" : "false",
                "aria-describedby":
                  touched.password && passwordHasError
                    ? "login-password-error"
                    : undefined,
              }}
            />
            {touched.password && passwordHasError && (
              <p
                id="login-password-error"
                role="alert"
                aria-live="assertive"
                className="mt-1 text-sm font-medium text-[#EA0029]"
              >
                {passwordError}
              </p>
            )}
          </div>

          <div className="text-left">
            <button
              type="button"
              onClick={onForgotPasswordClick}
              className="text-sm text-[#5383DA] hover:underline font-medium"
            >
              Forgot password?
            </button>
          </div>

          <button
            type="submit"
            disabled={!isFormValid || !!loading?.login || !isOnline}
            className={`
              flex w-full min-h-[47px] items-center justify-center gap-2.5
              rounded-full px-10 py-3.5
              font-medium text-white transition-opacity hover:opacity-95
              ${
                !isFormValid || !!loading.login || !isOnline
                  ? "bg-[#C2CAD6] cursor-not-allowed opacity-70"
                  : "auth-bg-btn"
              }
            `}
          >
            {loading?.login ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-[#3D495C]">
          Don't have an account?{" "}
          <button
            onClick={onSignupClick}
            className="text-[#5383DA] hover:underline font-semibold"
          >
            Sign up
          </button>
        </div>

        <p className="mt-6 text-xs text-center text-[#3D495C]">
          By continuing, you agree to our{" "}
          <a href="#" className="underline text-[#5383DA] font-medium">
            Terms
          </a>{" "}
          and{" "}
          <a href="#" className="underline text-[#5383DA] font-medium">
            Privacy policy
          </a>
        </p>
      </div>
    </div>
  );
};

export default LoginForm;
