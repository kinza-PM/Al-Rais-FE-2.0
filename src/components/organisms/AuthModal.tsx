import React, { useState } from 'react';
import Logo from '../atoms/Logo';
import LoginForm from '../molecules/LoginForm';
import SignupForm from '../molecules/SignupForm';
import ForgotPasswordForm from '../molecules/ForgotPasswordForm';
import ResetPasswordForm from '../molecules/ResetPasswordForm';

type AuthMode = 'login' | 'signup' | 'forgot-password' | 'reset-password';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: AuthMode;
  onModeChange: (mode: AuthMode) => void;
  logoSrc: string;
}

const AuthModal: React.FC<AuthModalProps> = ({ 
  isOpen, 
  onClose, 
  mode,
  onModeChange,
  logoSrc 
}) => {
  // State for forgot password flow
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [forgotPasswordOTP, setForgotPasswordOTP] = useState('');

  if (!isOpen) return null;

  const handleModeSwitch = () => {
    onModeChange(mode === 'login' ? 'signup' : 'login');
  };

  const handleSuccess = () => {
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
    setForgotPasswordOTP('');
  };

  return (
    <div className="fixed inset-0 modal-overlay flex items-center justify-center z-50 p-4">
      <div 
        className="absolute inset-0" 
        onClick={onClose}
      ></div>
      <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md relative z-10">
        <div className="flex justify-center mb-6">
          <Logo
            src={logoSrc}
            alt="Al Rais Travel logo " // cspell:disable-line
            size="modal"
          />
        </div>
        
        <div className="flex justify-center items-center mb-6">
          <h2 className="text-[32px] font-medium text-gray-800 text-center leading-[100%] tracking-[0%]">
            {mode === 'login' ? 'Welcome Back' : 
             mode === 'signup' ? 'Welcome' : 
             mode === 'forgot-password' ? 'Password Reset' : 
             'Reset Password'}
          </h2>
        </div>
        
        {mode === 'login' ? (
          <LoginForm 
            onSignupClick={handleModeSwitch} 
            onLoginSuccess={handleSuccess} 
            onForgotPasswordClick={handleForgotPassword}
          />
        ) : mode === 'signup' ? (
          <SignupForm 
            onLoginClick={handleModeSwitch} 
            onSignupSuccess={handleSuccess} 
          />
        ) : mode === 'forgot-password' ? (
          <ForgotPasswordForm 
            onBackToLogin={handleBackToLogin}
            onOTPSent={handleOTPSent}
          />
        ) : mode === 'reset-password' ? (
          <ResetPasswordForm 
            email={forgotPasswordEmail}
            otp={forgotPasswordOTP}
            onPasswordReset={handlePasswordReset}
            onBackToOTP={handleBackToOTP}
          />
        ) : null}
      </div>
    </div>
  );
};

export default AuthModal; 