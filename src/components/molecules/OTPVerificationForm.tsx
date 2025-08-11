import React, { useState } from 'react';
import Input from '../atoms/Input';
import Button from '../atoms/Button';
import { AuthService } from '../../features/auth/services/authService';
import type { OTPVerificationForm as OTPVerificationFormType } from '../../features/auth/types';

interface OTPVerificationFormProps {
  email: string;
  onBackToForgotPassword: () => void;
  onOTPVerified: (email: string, otp: string) => void;
}

const OTPVerificationForm: React.FC<OTPVerificationFormProps> = ({ 
  email, 
  onBackToForgotPassword, 
  onOTPVerified 
}) => {
  const [formData, setFormData] = useState<OTPVerificationFormType>({
    email: email,
    otp: '',
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    // Only allow numbers and limit to 6 digits
    if (name === 'otp') {
      const numericValue = value.replace(/\D/g, '');
      if (numericValue.length <= 6) {
        setFormData(prev => ({ ...prev, [name]: numericValue }));
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!formData.otp) {
      setError('Please enter the verification code');
      return;
    }

    if (formData.otp.length !== 6) {
      setError('Please enter a valid 6-digit code');
      return;
    }

    setLoading(true);
    
    try {
      const result = await AuthService.verifyResetCode(formData);
      
      if (result.success) {
        onOTPVerified(formData.email, formData.otp);
      } else {
        setError(result.message || 'Invalid verification code');
      }
    } catch (error) {
      console.error('OTPVerificationForm error:', error);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await AuthService.forgotPassword({ email });
      
      if (result.success) {
        setError(null);
        // You might want to show a success message here
        alert('New verification code sent to your email!');
      } else {
        setError(result.message || 'Failed to resend code');
      }
    } catch (error) {
      console.error('Resend code error:', error);
      setError('Failed to resend code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="text-center mb-6">
        <h3 className="text-lg font-medium text-gray-800 mb-2">Enter Verification Code</h3>
        <p className="text-sm text-gray-600">
          We've sent a 6-digit verification code to
        </p>
        <p className="text-sm font-medium text-gray-800">{email}</p>
      </div>

      <Input
        type="text"
        name="otp"
        label="Verification Code"
        placeholder="Enter 6-digit code"
        value={formData.otp}
        onChange={handleInputChange}
        rounded="xl"
        required
        className="text-center text-lg tracking-widest"
      />
      
      {error && (
        <div className="text-red-500 text-sm text-center">{error}</div>
      )}

      <div className="flex justify-center">
        <Button
          type="submit"
          variant="primary"
          disabled={loading}
        >
          {loading ? 'Verifying...' : 'Verify Code'}
        </Button>
      </div>

      <div className="text-center space-y-2">
        <button
          type="button"
          onClick={handleResendCode}
          disabled={loading}
          className="text-sm text-primary hover:underline disabled:opacity-50"
        >
          Resend Code
        </button>
        <div>
          <button
            type="button"
            onClick={onBackToForgotPassword}
            className="text-sm text-gray-600 hover:underline"
          >
            Change Email Address
          </button>
        </div>
      </div>
    </form>
  );
};

export default OTPVerificationForm; 