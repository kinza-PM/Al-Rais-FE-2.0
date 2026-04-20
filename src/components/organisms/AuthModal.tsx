import React, { useState } from 'react';
import toast from 'react-hot-toast';
import LoginForm from '../molecules/LoginForm';
import SignupForm from '../molecules/SignupForm';
import ForgotPasswordForm from '../molecules/ForgotPasswordForm';
import OTPVerificationForm from '../molecules/OTPVerificationForm';
import ResetPasswordForm from '../molecules/ResetPasswordForm';
import LoginFailedCard from '../molecules/LoginFailedCard';
import type { AuthMode } from '../../types/AuthTypes';

// type AuthMode = 'login' | 'signup' | 'forgot-password' | 'reset-password' | 'login-failed';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess?: () => void;
  mode: AuthMode;
  onModeChange: (mode: AuthMode) => void;
  logoSrc?: string;
}

const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onAuthSuccess,
  mode,
  onModeChange,
}) => {
  // State for forgot password flow
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [forgotPasswordOtp, setForgotPasswordOtp] = useState('');

  if (!isOpen) return null;

  const handleModeSwitch = () => {
    onModeChange(mode === 'login' ? 'signup' : 'login');
  };

  const handleSuccess = () => {
    onAuthSuccess?.();
    onClose();
  };

  const handleForgotPassword = () => {
    onModeChange('forgot-password');
  };

  const handleBackToLogin = () => {
    onModeChange('login');
    setForgotPasswordEmail('');
    setForgotPasswordOtp('');
  };

  const handleOTPSent = (email: string) => {
    setForgotPasswordEmail(email);
    setForgotPasswordOtp('');
    onModeChange('otp-verification');
  };

  const handleOTPVerified = (email: string, otp: string) => {
    setForgotPasswordEmail(email);
    setForgotPasswordOtp(otp);
    onModeChange('reset-password');
  };

  const handleChangeEmailFromOtp = () => {
    setForgotPasswordOtp('');
    onModeChange('forgot-password');
  };

  const handlePasswordReset = () => {
    toast.success('Password reset successfully! Please log in with your new password.');
    setForgotPasswordEmail('');
    setForgotPasswordOtp('');
    onModeChange('login');
  };

  const handleBackToOTP = () => {
    onModeChange('otp-verification');
  };

  return (
    <div className="fixed inset-0 modal-overlay z-50 overflow-y-auto">
      {/* Backdrop click to close */}
      <div
        className="absolute inset-0"
        onClick={onClose}
      ></div>
      {/* Centering wrapper — allows vertical scroll on small screens */}
      <div className="relative flex min-h-full items-center justify-center p-4 py-8">

        {/* Form container */}
        <div className="relative z-10 w-full max-w-[468px] mx-auto">

          {mode === 'login' ? (
            <LoginForm
              onSignupClick={handleModeSwitch}
              onLoginSuccess={handleSuccess}
              onForgotPasswordClick={handleForgotPassword}
              onLoginFailed={() => onModeChange('login-failed')}
              onClose={onClose}
            />
          ) : mode === 'login-failed' ? (
            <LoginFailedCard onTryAgain={() => onModeChange('login')} />
          ) : mode === 'signup' ? (
            <SignupForm
              onLoginClick={handleModeSwitch}
              onSignupSuccess={handleSuccess}
              onClose={onClose}
            />
          ) : mode === 'forgot-password' ? (
            <ForgotPasswordForm
              onBackToLogin={handleBackToLogin}
              onOTPSent={handleOTPSent}
              prefillEmail={forgotPasswordEmail}
            />
          ) : mode === 'otp-verification' ? (
            <OTPVerificationForm
              email={forgotPasswordEmail}
              initialOtp={forgotPasswordOtp}
              onBackToForgotPassword={handleChangeEmailFromOtp}
              onOTPVerified={handleOTPVerified}
            />
          ) : mode === 'reset-password' ? (
            <ResetPasswordForm
              email={forgotPasswordEmail}
              otp={forgotPasswordOtp}
              onPasswordReset={handlePasswordReset}
              onBackToOTP={handleBackToOTP}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default AuthModal; 