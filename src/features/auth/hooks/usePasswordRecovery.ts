import { AuthService } from '../services/authService';
import type { ForgotPasswordForm, OTPVerificationForm, ResetPasswordForm } from '../types';

interface LoadingState {
  forgotPassword: boolean;
  verifyOTP: boolean;
  resetPassword: boolean;
}

interface PasswordRecoveryActions {
  updateLoading: (key: keyof LoadingState, value: boolean) => void;
  setError: (error: string | null) => void;
}

export const usePasswordRecovery = (actions: PasswordRecoveryActions) => {
  const { updateLoading, setError } = actions;

  // Forgot password
  const forgotPassword = async (forgotPasswordData: ForgotPasswordForm) => {
    setError(null);
    updateLoading('forgotPassword', true);
    
    try {
      const response = await AuthService.forgotPassword(forgotPasswordData);
      
      if (!response.success) {
        setError(response.message || 'Failed to send reset code');
      }
      
      return response;
    } catch (error) {
      console.error('Forgot password error:', error);
      const errorMessage = 'Failed to send reset code. Please try again.';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      updateLoading('forgotPassword', false);
    }
  };

  // Verify reset code
  const verifyResetCode = async (otpData: OTPVerificationForm) => {
    setError(null);
    updateLoading('verifyOTP', true);
    
    try {
      const response = await AuthService.verifyResetCode(otpData);
      
      if (!response.success) {
        setError(response.message || 'Invalid verification code');
      }
      
      return response;
    } catch (error) {
      console.error('Verify OTP error:', error);
      const errorMessage = 'Failed to verify code. Please try again.';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      updateLoading('verifyOTP', false);
    }
  };

  // Reset password
  const resetPassword = async (resetData: ResetPasswordForm) => {
    setError(null);
    updateLoading('resetPassword', true);
    
    try {
      const response = await AuthService.resetPasswordWithCode(resetData);
      
      if (!response.success) {
        setError(response.message || 'Failed to reset password');
      }
      
      return response;
    } catch (error) {
      console.error('Reset password error:', error);
      const errorMessage = 'Failed to reset password. Please try again.';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      updateLoading('resetPassword', false);
    }
  };

  return {
    forgotPassword,
    verifyResetCode,
    resetPassword,
  };
}; 