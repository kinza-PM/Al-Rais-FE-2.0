import React, { useState } from 'react';
import toast from 'react-hot-toast';
import LoginForm from '../molecules/LoginForm';
import SignupForm from '../molecules/SignupForm';
import ForgotPasswordForm from '../molecules/ForgotPasswordForm';
import OTPVerificationForm from '../molecules/OTPVerificationForm';
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
  };

  const handleOTPSent = (email: string) => {
    setForgotPasswordEmail(email);
    onModeChange('otp-verification');
  };

  const handleChangeEmailFromOtp = () => {
    onModeChange('forgot-password');
  };

  const handleForgotPasswordResetSuccess = () => {
    toast.success('Password reset successfully! Please log in with your new password.');
    setForgotPasswordEmail('');
    onModeChange('login');
  };

  return (
    <div className="fixed inset-0 modal-overlay z-900 overflow-y-auto">
      {/* Backdrop click to close */}
      <div
        className="absolute inset-0"
        onClick={onClose}
        aria-hidden
      />
      {/* Centering wrapper: pointer-events-none so clicks outside the card hit the backdrop */}
      <div className="relative flex min-h-full items-center justify-center p-4 py-8 pointer-events-none">

        {/* Form container */}
        <div className="relative z-10 w-full max-w-[468px] mx-auto pointer-events-auto">

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
              onBackToForgotPassword={handleChangeEmailFromOtp}
              onResetSuccess={handleForgotPasswordResetSuccess}
              onCloseModal={onClose}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default AuthModal; 