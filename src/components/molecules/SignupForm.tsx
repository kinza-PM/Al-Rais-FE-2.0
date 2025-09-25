import React, { useState, useEffect } from 'react';
import Input from '../atoms/Input';
import Button from '../atoms/Button';
import { useAuth } from '../../features/auth/hooks/useAuth';
import Logo from '../atoms/Logo';
import logoImg from '../../assets/images/logo.jpg';
import CustomToggle from '../common/CustomToggle';

interface SignupFormProps {
  onLoginClick: () => void;
  onSignupSuccess?: () => void;
}

const SignupForm: React.FC<SignupFormProps> = ({ onLoginClick, onSignupSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [signupMessage, setSignupMessage] = useState<string | null>(null);
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [userCredentials, setUserCredentials] = useState<{ email: string; password: string } | null>(null);
  const [otpLoading, setOtpLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(60); // 1 minute countdown
  const [canResend, setCanResend] = useState(false);
  const [emailUpdates, setEmailUpdates] = useState(false);

  const { signup, confirmSignUp, resendConfirmationCode, loading, error } = useAuth();

  // Countdown timer effect
  useEffect(() => {
    let interval: number;

    if (showOtpInput && countdown > 0) {
      interval = window.setInterval(() => {
        setCountdown(prev => prev - 1);
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!otpCode || !userCredentials) {
      return;
    }

    setOtpLoading(true);
    setSignupMessage(null);

    const result = await confirmSignUp(userCredentials.email, otpCode, userCredentials.password);

    setOtpLoading(false);

    if (result.success) {
      // Fallback: if page doesn't reload in 2 seconds, close modal
      setTimeout(() => {
        onSignupSuccess?.();
      }, 2000);
    } else {
      setSignupMessage(result.message || 'Invalid verification code. Please try again.');
    }
  };

  const handleResendCode = async () => {
    if (!userCredentials?.email || !canResend) return;

    setResendLoading(true);
    setSignupMessage(null);

    const result = await resendConfirmationCode(userCredentials.email);

    setResendLoading(false);

    if (result.success) {
      setSignupMessage('New verification code sent to your email!');
      setCountdown(60);
      setCanResend(false);
    } else {
      setSignupMessage(result.message || 'Failed to resend code. Please try again.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignupMessage(null);

    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      return;
    }

    const result = await signup(formData);

    if (result.success) {
      if (result.requiresConfirmation) {
        // User needs to confirm with OTP
        setShowOtpInput(true);
        setUserCredentials({ email: formData.email, password: formData.password });
        setSignupMessage('Please check your email and enter the confirmation code below.');
      } else if (result.message && result.message.includes('logged in successfully')) {
        // Auto-login was successful
        onSignupSuccess?.();
      } else {
        // Signup successful but auto-login failed, show message
        setSignupMessage(result.message || 'Account created successfully!');

        // Still call onSignupSuccess after a delay to let user see the message
        setTimeout(() => {
          onSignupSuccess?.();
        }, 2000);
      }
    } else {
      setSignupMessage(result.message || 'Signup failed. Please try again.');
    }
  };

  const PasswordRequirement = () => {
    return (
      <div className='flex items-center gap-1 text-[11px] text-[#3D495C]'>
        <svg width="16" height="16" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M9 0.875C7.39303 0.875 5.82214 1.35152 4.486 2.24431C3.14985 3.1371 2.10844 4.40605 1.49348 5.8907C0.87852 7.37535 0.717618 9.00901 1.03112 10.5851C1.34463 12.1612 2.11846 13.6089 3.25476 14.7452C4.39106 15.8815 5.8388 16.6554 7.4149 16.9689C8.99099 17.2824 10.6247 17.1215 12.1093 16.5065C13.594 15.8916 14.8629 14.8502 15.7557 13.514C16.6485 12.1779 17.125 10.607 17.125 9C17.1227 6.84581 16.266 4.78051 14.7427 3.25727C13.2195 1.73403 11.1542 0.877275 9 0.875ZM12.5672 7.56719L8.19219 11.9422C8.13415 12.0003 8.06522 12.0464 7.98934 12.0779C7.91347 12.1093 7.83214 12.1255 7.75 12.1255C7.66787 12.1255 7.58654 12.1093 7.51067 12.0779C7.43479 12.0464 7.36586 12.0003 7.30782 11.9422L5.43282 10.0672C5.31554 9.94991 5.24966 9.79085 5.24966 9.625C5.24966 9.45915 5.31554 9.30009 5.43282 9.18281C5.55009 9.06554 5.70915 8.99965 5.875 8.99965C6.04086 8.99965 6.19992 9.06554 6.31719 9.18281L7.75 10.6164L11.6828 6.68281C11.7409 6.62474 11.8098 6.57868 11.8857 6.54725C11.9616 6.51583 12.0429 6.49965 12.125 6.49965C12.2071 6.49965 12.2884 6.51583 12.3643 6.54725C12.4402 6.57868 12.5091 6.62474 12.5672 6.68281C12.6253 6.74088 12.6713 6.80982 12.7027 6.88569C12.7342 6.96156 12.7504 7.04288 12.7504 7.125C12.7504 7.20712 12.7342 7.28844 12.7027 7.36431C12.6713 7.44018 12.6253 7.50912 12.5672 7.56719Z" fill="#C2CAD6" />
        </svg>
        Contains letters (A-Z, a-z), digits 0-9 AND special characters.
      </div>
    )
  }

  return (
    <div className="space-y-4 bg-white rounded-xl border border-[#E4E4E7] w-full px-4 py-10">
      {!showOtpInput ? (
        <div>
          <div className="flex justify-center mb-6">
            <Logo src={logoImg} alt="Logo" size="modal" />
          </div>

          <h2 className="text-center text-2xl font-semibold mb-1">Welcome</h2>
          <p className="text-center text-sm text-gray-500 mb-6">Let’s setup an account</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="text"
              name="name"
              label="Full Name"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={handleInputChange}
              rounded="xl"
              required
            />
            <div className="space-y-2">
              <Input
                type="email"
                name="email"
                label="Email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleInputChange}
                rounded="xl"
                required
              />

              <div className="flex items-center justify-between text-[11px] text-[#3D495C]">
                <p>
                  I would like to receive important updates and exciting deals
                </p>
                <CustomToggle
                  checked={emailUpdates}
                  onChange={() => setEmailUpdates((v) => !v)}
                />
              </div>
            </div>
            <div className='space-y-1'>
              <Input
                type="password"
                name="password"
                label="Password"
                placeholder="Create a password"
                value={formData.password}
                onChange={handleInputChange}
                rounded="xl"
                required
              />
              <PasswordRequirement />
            </div>
            <div className='space-y-1'>
              <Input
                type="password"
                name="confirmPassword"
                label="Confirm Password"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                rounded="xl"
                required
              />
              <PasswordRequirement />
            </div>

            {error && (
              <div className="text-red-500 text-sm text-center">{error}</div>
            )}

            {signupMessage && !showOtpInput && (
              <div className="text-green-600 text-sm text-center">{signupMessage}</div>
            )}

            {formData.password !== formData.confirmPassword && formData.confirmPassword && (
              <div className="text-red-500 text-sm text-center">
                Passwords do not match
              </div>
            )}

            <div className="flex justify-center">
              <Button
                type="submit"
                variant="primary"
                disabled={loading.signup || formData.password !== formData.confirmPassword}
              >
                {loading.signup ? 'Creating Account...' : 'Sign Up'}
              </Button>
            </div>
          </form>
        </div>
      ) : (
        <form onSubmit={handleOtpSubmit} className="space-y-4">
          <div className="text-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">Verify Your Email</h3>
            <p className="text-sm text-gray-600 mt-2">
              We sent a verification code to <strong>{userCredentials?.email}</strong>
            </p>
          </div>

          <Input
            type="text"
            name="otpCode"
            label="Verification Code"
            placeholder="Enter 6-digit code"
            value={otpCode}
            onChange={(e) => setOtpCode(e.target.value)}
            rounded="xl"
            required
          />

          {error && (
            <div className="text-red-500 text-sm text-center">{error}</div>
          )}

          {signupMessage && (
            <div className="text-blue-600 text-sm text-center">{signupMessage}</div>
          )}

          <div className="flex justify-center">
            <Button
              type="submit"
              variant="primary"
              disabled={!otpCode || otpCode.length !== 6 || otpLoading}
            >
              {otpLoading ? 'Verifying...' : 'Verify Account'}
            </Button>
          </div>

          <div className="text-center space-y-2">
            <button
              type="button"
              onClick={handleResendCode}
              disabled={!canResend || resendLoading}
              className={`text-sm underline ${canResend && !resendLoading
                ? 'text-blue-600 hover:text-blue-800'
                : 'text-gray-400 cursor-not-allowed'
                }`}
            >
              {resendLoading ? 'Sending...' : canResend ? 'Resend Code' : `Resend Code (${countdown}s)`}
            </button>
            <br />
            <button
              type="button"
              onClick={() => {
                setShowOtpInput(false);
                setOtpCode('');
                setSignupMessage(null);
              }}
              className="text-sm text-gray-600 hover:text-gray-800"
            >
              ← Back to signup
            </button>
          </div>
        </form>
      )}

      {!showOtpInput && (
        <>
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <button
                type="button"
                onClick={onLoginClick}
                className="text-[#5383DA] hover:underline"
              >
                Login
              </button>
            </p>
          </div>
          <div className="mt-8 text-center">
            <p
              className="text-gray-600"
              style={{
                fontFamily: 'Inter',
                fontWeight: 400,
                fontSize: '12px',
                lineHeight: '100%',
                letterSpacing: '0%',
                textAlign: 'center',
                opacity: 1
              }}
            >
              By continuing, you agree to our{' '}
              <button
                type="button"
                className="hover:underline"
                style={{ color: '#5383DA' }}
              >
                Terms
              </button>
              {' '}and{' '}
              <button
                type="button"
                className="hover:underline"
                style={{ color: '#5383DA' }}
              >
                Privacy policy
              </button>
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default SignupForm; 