import React, { useEffect, useMemo, useState } from "react";
import Input from "../atoms/Input";
import Button from "../atoms/Button";
import { useAuth } from "../../features/auth/hooks/useAuth";
import Logo from "../atoms/Logo";
import logoImg from "../../assets/images/logo.jpg";
import { Link } from "react-router-dom";
import { useNetworkStatus } from "../../context/NetworkStatusContext";
import { PhoneInput } from "react-international-phone";
import "react-international-phone/style.css";
import { filterEmailInput } from "../../utils/helpers";
import toast from "react-hot-toast";

interface LoginFormProps {
  onSignupClick: () => void;
  onLoginSuccess?: () => void;
  onForgotPasswordClick?: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({
  onSignupClick,
  onLoginSuccess,
  onForgotPasswordClick,
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
      [name]: name === "email" ? filterEmailInput(value) : value,
    }));
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
      INVALID_CREDENTIALS: () =>
        showErrorWithAction(
          errorMessage,
          "Reset password",
          onForgotPasswordClick,
        ),
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
      <div className="bg-white rounded-xl border border-[#E4E4E7] w-full px-4 py-10">
        <div className="flex justify-center mb-6">
          <Link
            to="/"
            aria-label="Go to home page"
            className="cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
          >
            <Logo src={logoImg} alt="Brand name" size="modal" />
          </Link>
        </div>

        <h2 className="text-center text-2xl font-semibold mb-1">
          Welcome back
        </h2>
        <p className="text-center text-sm text-gray-500 mb-6">
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
                    // if (submitError) setSubmitError(null);
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
                        ? "1px solid #ef4444"
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
                className="mt-1 text-sm text-red-600"
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
                className="mt-1 text-sm text-red-600"
              >
                {passwordError}
              </p>
            )}
          </div>

          {/* {loginMessage && (
            <p className="text-green-500 text-sm">{loginMessage}</p>
          )} */}

          <div className="text-right">
            <button
              type="button"
              onClick={onForgotPasswordClick}
              className="text-sm text-blue-600 hover:underline"
            >
              Forgot password?
            </button>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={!isFormValid || !!loading?.login || !isOnline}
            aria-disabled={!isFormValid || !!loading?.login || !isOnline}
          >
            {loading?.login ? "Logging in..." : "Login"}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-[#3D495C]">
          Don’t have an account?{" "}
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
