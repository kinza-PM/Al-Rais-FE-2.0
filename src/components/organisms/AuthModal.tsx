import React, { useState } from 'react';
import LoginForm from '../molecules/LoginForm';
import SignupForm from '../molecules/SignupForm';
import ForgotPasswordForm from '../molecules/ForgotPasswordForm';
import ResetPasswordForm from '../molecules/ResetPasswordForm';
import LoginFailedCard from '../molecules/LoginFailedCard';

type AuthMode = 'login' | 'signup' | 'forgot-password' | 'reset-password' | 'login-failed';

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
  // const [forgotPasswordOTP, setForgotPasswordOTP] = useState('');

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
    // In a full implementation, you'd collect the OTP here
    // For now, we'll just proceed to reset-password with empty OTP
    onModeChange('reset-password');
  };

  const handlePasswordReset = () => {
    // Show success message and redirect to login
    alert('Password reset successfully! Please log in with your new password.');
    handleBackToLogin();
  };

  const handleBackToOTP = () => {
    onModeChange('forgot-password');
    // setForgotPasswordOTP('');
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
          />
        ) : mode === 'reset-password' ? (
          <ResetPasswordForm
            email={forgotPasswordEmail}
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