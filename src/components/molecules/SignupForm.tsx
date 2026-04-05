import React, { useState, useEffect, useMemo } from "react";
import Input from "../atoms/Input";
import { useAuth } from "../../features/auth/hooks/useAuth";
import logoSmall from "../../assets/images/logo-small.png";
import CustomToggle from "../common/CustomToggle";
import {
  getEmailError,
  // getFullNameError,
  getPasswordError,
  // getPhoneError,
} from "../../utils/validators";
// import FlagUsa from "../../assets/images/Flag-usa.png";
// import FlagUae from "../../assets/svgs/Flag-uae.svg";
// import FlagPakistan from "../../assets/svgs/Flag-pakistan.svg";
import arrownDownwardIcon from "../../assets/svgs/arrow-downwards.svg";

// const COUNTRY_CODE_FLAGS: Record<string, string> = {
//   "+1": FlagUsa,
//   "+92": FlagPakistan,
//   "+971": FlagUae,
// };
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useNetworkStatus } from "../../context/NetworkStatusContext";
import toast from "react-hot-toast";
import type { SignupMethod } from "../../features/auth/types";
import { filterEmailInput } from "../../utils/helpers";
import { PhoneInput } from "react-international-phone";

interface SignupFormProps {
  onLoginClick: () => void;
  onSignupSuccess?: () => void;
  onClose?: () => void;
  compact?: boolean;
  returnUrl?: string;
  bookingData?: unknown;
}

const SignupForm: React.FC<SignupFormProps> = ({
  onLoginClick,
  onSignupSuccess,
  onClose,
  compact = false,
  returnUrl: returnUrlProp,
  bookingData: bookingDataProp,
}) => {
  const [formData, setFormData] = useState({
    title: "MR",
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    gender: "M",
  });
  const location = useLocation();
  const navigate = useNavigate();
  // const [signupMessage, setSignupMessage] = useState<string | null>(null);
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [emailUpdates, setEmailUpdates] = useState(false);
  const [userCredentials, setUserCredentials] = useState<{
    email: string;
    password: string;
    signupMethod: SignupMethod;
    title: string;
    gender: string;
  } | null>(null);
  const [otpLoading, setOtpLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(60); // 1 minute countdown
  const [canResend, setCanResend] = useState(false);
  const [touched, setTouched] = useState({
    name: false,
    email: false,
    password: false,
    confirmPassword: false,
    otp: false,
  });
  const [usePhone, setUsePhone] = useState(false);
  const [phoneCountryCode, setPhoneCountryCode] = useState("+1");
  const [phoneNumber, setPhoneNumber] = useState("");

  const {
    signup,
    confirmSignUp,
    resendConfirmationCode,
    loading,
    error,
    clearError,
  } = useAuth();
  const { isOnline } = useNetworkStatus();

  const returnUrl = returnUrlProp ?? (location.state as any)?.returnUrl;
  const bookingData = bookingDataProp ?? (location.state as any)?.bookingData;

  function ChevronDown() {
    return (
      <img
        alt="arrow-icon"
        src={arrownDownwardIcon}
        className="pointer-events-none absolute right-3 top-3/5"
      />
    );
  }

  // Countdown timer effect
  useEffect(() => {
    let interval: number;

    if (showOtpInput && countdown > 0) {
      interval = window.setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (countdown === 0) {
      setCanResend(true);
    }

    return () => window.clearInterval(interval);
  }, [showOtpInput, countdown]);

  // Reset countdown when OTP form is shown
  useEffect(() => {
    if (showOtpInput) {
      setCountdown(60);
      setCanResend(false);
    }
  }, [showOtpInput]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handlePopState = (event: PopStateEvent) => {
      const step = (event.state as { authStep?: string } | null)?.authStep;
      setShowOtpInput(step === "verify");
    };

    window.addEventListener("popstate", handlePopState);

    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const currentStep = showOtpInput ? "verify" : "signup";
    const state = window.history.state as { authStep?: string } | null;

    if (currentStep === "signup") {
      if (state?.authStep !== "signup") {
        window.history.replaceState(
          { ...(state || {}), authStep: "signup" },
          "",
          window.location.href,
        );
      }
      return;
    }

    if (state?.authStep !== "verify") {
      window.history.pushState(
        { ...(state || {}), authStep: "verify" },
        "",
        window.location.href,
      );
    }
  }, [showOtpInput]);

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

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!otpCode || !userCredentials) {
      setTouched((prev) => ({ ...prev, otp: true }));
      return;
    }

    setOtpLoading(true);
    // setSignupMessage(null);

    console.log("SignupForm - Sending to confirmSignUp:", {
      title: userCredentials.title,
      gender: userCredentials.gender,
    });

    const result = await confirmSignUp(
      userCredentials.email,
      otpCode,
      userCredentials.password,
      {
        signupMethod: userCredentials.signupMethod,
        contactValue: userCredentials.email,
        title: userCredentials.title,
        gender: userCredentials.gender,
      },
    );

    setOtpLoading(false);

    if (result.success) {
      // Fallback: if page doesn't reload in 2 seconds, close modal
      toast.success("Account verified successfully!");
      // If parent provided onSignupSuccess (e.g. modal flow), always prefer that so the modal can close.
      if (onSignupSuccess) {
        setTimeout(() => {
          onSignupSuccess();
        }, 600);
        return;
      }

      if (returnUrl && bookingData) {
        setTimeout(() => {
          navigate(returnUrl, { state: bookingData, replace: true });
        }, 1500);
        return;
      }

      // No modal callback and no return target: keep current state.
    } else {
      //useeffect error will handle this (useAuth)
      // toast.error(result.message || "Invalid verification code...");
    }
  };

  const handleResendCode = async () => {
    if (!userCredentials?.email || !canResend) return;

    setResendLoading(true);
    // setSignupMessage(null);

    const result = await resendConfirmationCode(userCredentials.email);

    setResendLoading(false);

    if (result.success) {
      toast.success("New verification code sent!");
      setCountdown(60);
      setCanResend(false);
    } else {
      toast.error(result.message || "Failed to resend code. Please try again.");
    }
  };

  // Validation logic
  const nameError = useMemo(() => {
    return formData.name.trim() === "" ? "Name is required." : null;
  }, [formData.name]);

  const emailError = useMemo(() => {
    if (usePhone) {
      return phoneNumber.trim() === "" ? "Phone number is required" : null;
    }
    return getEmailError(formData.email, false);
  }, [formData.email, usePhone, phoneNumber]);

  const passwordError = useMemo(() => {
    return getPasswordError(formData.password);
  }, [formData.password]);

  const confirmPasswordError = useMemo(() => {
    if (formData.confirmPassword.trim() === "")
      return "Confirm password is required.";
    if (formData.password !== formData.confirmPassword)
      return "Passwords do not match.";
    return null;
  }, [formData.password, formData.confirmPassword]);

  const isFormValid = useMemo(() => {
    if (nameError || passwordError || confirmPasswordError) return false;

    if (usePhone) {
      const phoneTrim = phoneNumber.trim();
      return phoneTrim.length > 0;
    } else {
      const emailTrim = formData.email.trim();
      if (!emailTrim) return false;
      return isEmailValid(emailTrim);
    }
  }, [
    nameError,
    emailError,
    passwordError,
    confirmPasswordError,
    usePhone,
    phoneNumber,
    formData.email,
  ]);

  const otpError = useMemo(() => {
    if (!otpCode.trim()) return "Verification code is required.";
    if (!/^[0-9]+$/.test(otpCode)) return "Code must contain only numbers.";
    if (otpCode.length !== 6) return "Code must be 6 digits.";
    return null;
  }, [otpCode]);

  const emailHasError = Boolean(emailError);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // setSignupMessage(null);

    if (!isOnline) {
      toast.error(
        "No internet connection. Check your connection and try again.",
      );
      return;
    }

    if (!isFormValid) {
      setTouched({
        name: true,
        email: true,
        password: true,
        confirmPassword: true,
        otp: false,
        // title: true,
        // gender: true,
      });
      return;
    }

    // Build identifier (email or phone in E.164)
    const phoneTrimmed = phoneNumber.trim();
    const signupMethod: SignupMethod = usePhone ? "PHONE" : "EMAIL";
    const signupIdentifier = usePhone
      ? `${phoneCountryCode}${phoneTrimmed}`
      : formData.email.trim();
    const signupData = {
      ...formData,
      email: signupIdentifier,
      signupMethod,
    };

    console.log("SignupForm - Signup Data:", {
      title: signupData.title,
      gender: signupData.gender,
      name: signupData.name,
    });

    const result = await signup(signupData);

    if (result.success) {
      const isPhone = signupData.email.startsWith("+");

      if (result.requiresConfirmation) {
        // User needs to confirm with OTP
        setShowOtpInput(true);
        setUserCredentials({
          email: signupData.email, // identifier used everywhere (email or +phone)
          password: formData.password,
          signupMethod,
          title: formData.title,
          gender: formData.gender,
        });
        toast.success(
          `Verification code sent to your ${isPhone ? "phone" : "email"}!`,
        );
      } else if (
        result.message &&
        result.message.includes("logged in successfully")
      ) {
        // Auto-login was successful
        toast.success("Account created and logged in successfully!");
        if (onSignupSuccess) {
          onSignupSuccess();
          return;
        }
        if (returnUrl && bookingData) {
          setTimeout(() => {
            navigate(returnUrl, { state: bookingData, replace: true });
          }, 1500);
        }
      } else {
        toast.success(result.message || "Account created successfully!");
        if (onSignupSuccess) {
          setTimeout(() => {
            onSignupSuccess();
          }, 400);
          return;
        }
        if (returnUrl && bookingData) {
          setTimeout(() => {
            navigate(returnUrl, { state: bookingData, replace: true });
          }, 1500);
        }
      }
    } else {
      // error already handled in useAuth.ts via `error`
      // setSignupMessage(result.message || 'Signup failed. Please try again.');
    }
  };

  useEffect(() => {
    clearError();
    setTouched({
      name: false,
      email: false,
      password: false,
      confirmPassword: false,
      otp: false,
    });

    setFormData({
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      gender: "M",
      title: "MR",
    });
    setPhoneNumber("");
    setPhoneCountryCode("+1");

    // setSignupMessage(null);
  }, [usePhone]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const PasswordRequirement = () => {
    return (
      <div className="flex items-center gap-1.5 text-[11px] text-[#3D495C] mt-1">
        {/* <svg
          width="16"
          height="16"
          viewBox="0 0 18 18"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="shrink-0"
        >
          <path
            d="M9 0.875C7.39303 0.875 5.82214 1.35152 4.486 2.24431C3.14985 3.1371 2.10844 4.40605 1.49348 5.8907C0.87852 7.37535 0.717618 9.00901 1.03112 10.5851C1.34463 12.1612 2.11846 13.6089 3.25476 14.7452C4.39106 15.8815 5.8388 16.6554 7.4149 16.9689C8.99099 17.2824 10.6247 17.1215 12.1093 16.5065C13.594 15.8916 14.8629 14.8502 15.7557 13.514C16.6485 12.1779 17.125 10.607 17.125 9C17.1227 6.84581 16.266 4.78051 14.7427 3.25727C13.2195 1.73403 11.1542 0.877275 9 0.875ZM12.5672 7.56719L8.19219 11.9422C8.13415 12.0003 8.06522 12.0464 7.98934 12.0779C7.91347 12.1093 7.83214 12.1255 7.75 12.1255C7.66787 12.1255 7.58654 12.1093 7.51067 12.0779C7.43479 12.0464 7.36586 12.0003 7.30782 11.9422L5.43282 10.0672C5.31554 9.94991 5.24966 9.79085 5.24966 9.625C5.24966 9.45915 5.31554 9.30009 5.43282 9.18281C5.55009 9.06554 5.70915 8.99965 5.875 8.99965C6.04086 8.99965 6.19992 9.06554 6.31719 9.18281L7.75 10.6164L11.6828 6.68281C11.7409 6.62474 11.8098 6.57868 11.8857 6.54725C11.9616 6.51583 12.0429 6.49965 12.125 6.49965C12.2071 6.49965 12.2884 6.51583 12.3643 6.54725C12.4402 6.57868 12.5091 6.62474 12.5672 6.68281C12.6253 6.74088 12.6713 6.80982 12.7027 6.88569C12.7342 6.96156 12.7504 7.04288 12.7504 7.125C12.7504 7.20712 12.7342 7.28844 12.7027 7.36431C12.6713 7.44018 12.6253 7.50912 12.5672 7.56719Z"
            fill="#22c55e"
          />
        </svg> */}
        Contains letters (A-Z, a-z), digits 0-9 AND special characters.
      </div>
    );
  };

  return (
    <div
      className={[
        "relative w-full max-w-[468px] rounded-xl border border-[#E4E4E7] bg-white shadow-lg transition-shadow sm:rounded-2xl",
        compact ? "space-y-2" : "space-y-4",
      ].join(" ")}
      style={{
        opacity: 1,
        width: "100%",
        minHeight: 0,
      }}
    >
      {/* Close button — inside the card, top-right corner */}
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full text-[#3D495C] hover:bg-[#F2F2F3] transition-colors z-10"
          aria-label="Close"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M11 3L3 11M3 3L11 11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </button>
      )}
      <div
        className={[
          "px-4",
          compact
            ? "py-2 sm:py-3 md:px-6 md:py-4"
            : "py-6 sm:py-8 md:px-8 md:py-10",
        ].join(" ")}
      >
        {!showOtpInput ? (
          <div>
            <div className={compact ? "flex justify-center mb-2" : "flex justify-center mb-6"}>
              <Link
                to="/"
                aria-label="Go to home page"
                className="cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
              >
                <img
                  src={logoSmall}
                  alt="Al Rais Travel"
                  className="h-11 w-[60px] object-contain"
                  style={{ opacity: 1 }}
                />
              </Link>
            </div>

            <h2 className={compact ? "mb-0.5 text-center text-xl font-semibold text-[#0A0C0F]" : "mb-1 text-center text-xl font-semibold text-[#0A0C0F] sm:text-2xl"}>
              Welcome
            </h2>
            <p className={compact ? "mb-2 text-center text-sm text-[#3D495C]" : "mb-6 text-center text-sm text-[#3D495C]"}>
              Let's setup an account
            </p>

            {/* Toggle Buttons */}
            <div className={compact ? "flex justify-center mb-2" : "flex justify-center mb-6"}>
              <div className="flex items-center rounded-xl ring-1 ring-[#C2CAD6] px-2 py-1">
                <button
                  type="button"
                  onClick={() => {
                    setUsePhone(false);
                    setTouched((prev) => ({ ...prev, email: false }));
                  }}
                  className={`px-6 py-1.5 text-[13px] rounded-xl transition-colors ${!usePhone ? "bg-[#2351A3] text-white" : "text-[#3D495C]"
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
                  className={`px-6 py-1.5 text-[13px] rounded-xl transition-colors ${usePhone ? "bg-[#2351A3] text-white" : "text-[#3D495C]"
                    }`}
                >
                  Phone
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className={compact ? "space-y-2.5" : "space-y-4"}>
              {/* <div>
                <Input
                  type="text"
                  name="name"
                  label="Full Name"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  touched={touched.name}
                  error={Boolean(nameError)}
                  rounded="xl"
                  required
                />
                {touched.name && nameError && (
                  <p
                    role="alert"
                    aria-live="assertive"
                    className="mt-1 text-sm text-red-600"
                  >
                    {nameError}
                  </p>
                )}
              </div> */}
              <div>
                <label className="text-sm text-xs font-normal text-[#3D495C] mb-1 block">
                  Full Name
                </label>
                <div className={compact ? "flex gap-1.5" : "flex gap-2"}>
                  <div className="relative flex items-center w-24">
                    <select
                      aria-label="Title"
                      className={compact ? "px-2.5 py-1.5 w-full h-9 appearance-none rounded-xl border border-[#C2CAD6] bg-white pr-6 text-sm text-[#3D495C] focus:outline-none focus:ring-1 focus:ring-[#C2CAD6] focus:border-transparent" : "px-3 py-2 w-full h-10 appearance-none rounded-xl border border-[#C2CAD6] bg-white pr-6 text-sm text-[#3D495C] focus:outline-none focus:ring-1 focus:ring-[#C2CAD6] focus:border-transparent"}
                      value={formData.title}
                      onChange={(e) => {
                        const newTitle = e.target.value;
                        setFormData((prev) => ({
                          ...prev,
                          title: newTitle,
                          gender: newTitle === "MR" ? "M" : "F",
                        }));
                      }}
                    >
                      <option value="MR">Mr.</option>
                      <option value="MS">Ms.</option>
                      <option value="MRS">Mrs.</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
                      <ChevronDown />
                    </div>
                  </div>
                  <div className="flex-1">
                    <Input
                      type="text"
                      name="name"
                      label=""
                      placeholder="Enter your full name"
                      value={formData.name}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      touched={touched.name}
                      error={Boolean(nameError)}
                      rounded="xl"
                      required
                    />
                  </div>
                </div>
                {touched.name && nameError && (
                  <p
                    role="alert"
                    aria-live="assertive"
                    className="mt-1 text-sm text-red-600"
                  >
                    {nameError}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <div>
                  <label className="text-sm text-xs font-normal text-[#3D495C]">
                    {usePhone ? "Phone" : "Email"}
                  </label>
                  {usePhone ? (
                    <div className="flex gap-2 mt-1">
                      <PhoneInput
                        defaultCountry="us"
                        value={`${phoneCountryCode}${phoneNumber}`}
                        onChange={(phone, meta) => {
                          setPhoneCountryCode(`+${meta.country.dialCode}`);
                          setPhoneNumber(
                            phone.replace(`+${meta.country.dialCode}`, ""),
                          );
                        }}
                        onBlur={handlePhoneBlur}
                        hideDropdown={false}
                        forceDialCode={true}
                        style={{
                          width: "100%",
                          display: "flex",
                          gap: "8px",
                        }}
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
                        }}
                      />
                    </div>
                  ) : (
                    <Input
                      type="email"
                      name="email"
                      label=""
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      touched={touched.email}
                      error={emailHasError}
                      rounded="xl"
                      required
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
                  )}
                  {touched.email && emailHasError && (
                    <p
                      role="alert"
                      aria-live="assertive"
                      className="mt-1 text-sm text-red-600"
                    >
                      {emailError}
                    </p>
                  )}
                </div>

                <div className={compact ? "flex items-center justify-between text-[10px] text-[#3D495C]" : "flex items-center justify-between text-[11px] text-[#3D495C]"}>
                  <p>
                    I would like to receive important updates and exciting deals
                  </p>
                  <CustomToggle
                    checked={emailUpdates}
                    onChange={() => setEmailUpdates((v) => !v)}
                  />
                </div>
              </div>
              <div>
                <label className="text-sm text-xs font-normal text-[#3D495C] mb-1 block">
                  Gender
                </label>
                <div className="relative flex items-center">
                  <select
                    aria-label="Gender"
                    className="px-3 py-2 w-full h-10 appearance-none rounded-xl border border-[#C2CAD6] bg-white pr-10 text-sm text-[#3D495C] focus:outline-none focus:ring-1 focus:ring-[#C2CAD6] focus:border-transparent"
                    value={formData.gender}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        gender: e.target.value,
                      }))
                    }
                  >
                    <option value="M">Male</option>
                    <option value="F">Female</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
                    <ChevronDown />
                  </div>
                </div>
              </div>
              <div className="space-y-1">
                <Input
                  type="password"
                  name="password"
                  label="New password"
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  touched={touched.password}
                  error={Boolean(passwordError)}
                  rounded="xl"
                  required
                />
                {touched.password && passwordError && (
                  <p
                    role="alert"
                    aria-live="assertive"
                    className="mt-1 text-sm text-red-600"
                  >
                    {passwordError}
                  </p>
                )}
                <PasswordRequirement />
              </div>
              <div className="space-y-1">
                <Input
                  type="password"
                  name="confirmPassword"
                  label="Confirm Password"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  touched={touched.confirmPassword}
                  error={Boolean(confirmPasswordError)}
                  rounded="xl"
                  required
                />
                {touched.confirmPassword && confirmPasswordError && (
                  <p
                    role="alert"
                    aria-live="assertive"
                    className="mt-1 text-sm text-red-600"
                  >
                    {confirmPasswordError}
                  </p>
                )}
              </div>

              {/* Auth/backend errors: User already exists, email already associated (Figma wording) */}
              {/* {error && (
                <p
                  role="alert"
                  aria-live="assertive"
                  className="text-center text-sm font-medium text-red-600"
                >
                  {error.toLowerCase().includes("already") &&
                  (error.toLowerCase().includes("email") ||
                    error.toLowerCase().includes("associated"))
                    ? "This email is already associated with another account."
                    : error.toLowerCase().includes("already") &&
                        error.toLowerCase().includes("exist")
                      ? "User already exists."
                      : error}
                </p>
              )}

              {signupMessage && !showOtpInput && (
                <div className="text-green-600 text-sm text-center">
                  {signupMessage}
                </div>
              )} */}

              <div className={compact ? "flex justify-center pt-0.5" : "flex justify-center pt-1"}>
                <button
                  type="submit"
                  disabled={!isFormValid || loading.signup || !isOnline}
                  // className="flex min-h-[47px] min-w-[142px] items-center justify-center gap-2.5 rounded-full px-10 py-3.5 font-medium text-white transition-opacity hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-70 sm:min-w-[142px]"
                  className={`
                    flex min-h-[42px] min-w-[140px] items-center justify-center gap-2
                    rounded-full px-8 py-2.5
                    font-semibold text-white tracking-[0.5px]
                    transition-opacity hover:opacity-95
                    ${!isFormValid || loading.signup || !isOnline
                      ? "bg-[#C2CAD6] cursor-not-allowed opacity-70"
                      : "auth-bg-btn"
                    }
                  `}
                  style={{
                    background: "var(--black-100, #C2CAD6)",
                    opacity: 1,
                  }}
                >
                  {loading.signup ? "Creating Account..." : "Sign up"}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <form onSubmit={handleOtpSubmit} className="space-y-4">
            {/* Figma: breadcrumb - "Sign up - Verify your email" top-left, light grey */}
            <p className="text-left text-xs text-[#9CA3AF] mb-2">
              Sign up - Verify your{" "}
              {userCredentials?.email?.includes("+") ? "phone" : "email"}
            </p>

            {/* Figma: logo at top center */}
            <div className="flex justify-center mb-6">
              <Link
                to="/"
                aria-label="Go to home"
                className="rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <img
                  src={logoSmall}
                  alt="Al Rais Travel"
                  className="h-11 w-[60px] object-contain"
                  style={{ opacity: 1 }}
                />
              </Link>
            </div>

            <h2 className="text-center text-xl font-bold text-[#0A0C0F] mb-1 sm:text-2xl">
              Verify your{" "}
              {userCredentials?.email?.includes("+") ? "phone" : "email"}
            </h2>
            <p className="text-center text-sm text-[#0A0C0F] mb-6">
              A code has been sent to{" "}
              <span className="font-medium text-[#5383DA]">
                {userCredentials?.email}
              </span>
            </p>

            <div className="space-y-1">
              <Input
                type="text"
                name="otpCode"
                label="Verification code"
                placeholder="Enter verification code"
                value={otpCode}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, ""); // Only allow digits
                  if (value.length <= 6) {
                    setOtpCode(value);
                  }
                  if (error) clearError();
                }}
                rounded="xl"
                required
                touched={touched.otp}
                error={Boolean(otpError)}
                onBlur={() => {
                  setTouched((prev) => ({ ...prev, otp: true }));
                }}
              />
              {/* Figma: error directly below input, red text */}
              {touched.otp && otpError && (
                <p
                  id="otp-error"
                  role="alert"
                  aria-live="assertive"
                  className="mt-1 text-sm text-red-600"
                >
                  {otpError}
                </p>
              )}
            </div>

            {/* {signupMessage && (
              <p className="text-center text-sm text-[#5383DA]">
                {signupMessage}
              </p>
            )} */}

            <div className="flex justify-center pt-1">
              <button
                type="submit"
                disabled={
                  !otpCode || otpCode.length !== 6 || otpLoading || !isOnline
                }
                className={`
                  flex min-h-[47px] min-w-[156px] items-center justify-center gap-2.5
                  rounded-full px-10 py-3.5
                  font-semibold text-white tracking-[0.5px]
                  transition-opacity hover:opacity-95
                  ${!otpCode || otpCode.length !== 6 || otpLoading || !isOnline
                    ? "bg-[#C2CAD6] cursor-not-allowed opacity-70"
                    : "auth-bg-btn"
                  }
                `}
                style={{ background: "var(--black-100, #C2CAD6)", opacity: 1 }}
              >
                {otpLoading ? "Verifying..." : "Verify now"}
              </button>
            </div>

            <div className="text-center pt-4">
              <p className="text-sm text-[#3D495C]">
                Haven&apos;t received the code?{" "}
                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={!canResend || resendLoading || !isOnline}
                  className={`text-sm font-medium underline ${canResend && !resendLoading ? "text-[#5383DA] hover:text-[#2351A3]" : "text-gray-400 cursor-not-allowed"}`}
                >
                  {resendLoading
                    ? "Sending..."
                    : canResend
                      ? "Resend"
                      : `Resend (${countdown}s)`}
                </button>
              </p>
              <button
                type="button"
                onClick={() => {
                  setShowOtpInput(false);
                  setOtpCode("");
                  // setSignupMessage(null);
                }}
                className="mt-4 block w-full text-center text-sm text-[#3D495C] hover:text-[#0A0C0F]"
              >
                Go Back to signup
              </button>
            </div>
          </form>
        )}

        {!showOtpInput && (
          <>
            <div className={compact ? "mt-2 text-center" : "mt-6 text-center"}>
              <p className="text-sm text-[#3D495C]">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={onLoginClick}
                  className="text-[#5383DA] hover:underline font-semibold"
                >
                  Login
                </button>
              </p>
            </div>
            <div className={compact ? "mt-2.5 text-center" : "mt-8 text-center"}>
              <p
                className="text-[#3D495C]"
                style={{
                  fontFamily: "Inter",
                  fontWeight: 400,
                  fontSize: "12px",
                  lineHeight: "100%",
                  letterSpacing: "0%",
                  textAlign: "center",
                  opacity: 1,
                }}
              >
                By continuing, you agree to our{" "}
                <button
                  type="button"
                  className="hover:underline font-medium"
                  style={{ color: "#5383DA" }}
                  onClick={() => {
                    if (onClose) onClose();
                    navigate("/terms-of-services");
                  }}
                >
                  Terms
                </button>{" "}
                and{" "}
                <button
                  type="button"
                  className="hover:underline font-medium"
                  onClick={() => {
                    if (onClose) onClose();
                    navigate("/privacy-policy");
                  }}
                  style={{ color: "#5383DA" }}
                >
                  Privacy policy
                </button>
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SignupForm;
