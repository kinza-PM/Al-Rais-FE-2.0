import React, { useState } from 'react';
import Input from '../atoms/Input';
import Button from '../atoms/Button';
import { AuthService } from '../../features/auth/services/authService';
import type { ResetPasswordForm as ResetPasswordFormType } from '../../features/auth/types';

interface ResetPasswordFormProps {
  email: string;
  otp: string;
  onPasswordReset: () => void;
  onBackToOTP: () => void;
}

const ResetPasswordForm: React.FC<ResetPasswordFormProps> = ({ 
  email, 
  otp, 
  onPasswordReset, 
  onBackToOTP 
}) => {
  const [formData, setFormData] = useState<ResetPasswordFormType>({
    email: email,
    otp: otp,
    newPassword: '',
    confirmPassword: '',
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError(null);
  };

  const validatePassword = (password: string): string | null => {
    if (password.length < 8) {
      return 'Password must be at least 8 characters long';
    }
    if (!/(?=.*[a-z])(?=.*[A-Z])/.test(password)) {
      return 'Password must contain both uppercase and lowercase letters';
    }
    if (!/(?=.*\d)/.test(password)) {
      return 'Password must contain at least one number';
    }
    if (!/(?=.*[!@#$%^&*])/.test(password)) {
      return 'Password must contain at least one special character (!@#$%^&*)';
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!formData.newPassword || !formData.confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    const passwordError = validatePassword(formData.newPassword);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    setLoading(true);
    
    try {
      const result = await AuthService.resetPasswordWithCode(formData);
      
      if (result.success) {
        onPasswordReset();
      } else {
        setError(result.message || 'Failed to reset password');
      }
    } catch (error) {
      console.error('ResetPasswordForm error:', error);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="text-center mb-6">
        <h3 className="text-lg font-medium text-gray-800 mb-2">Reset Password</h3>
        <p className="text-sm text-gray-600">
          Create a new password for your account
        </p>
      </div>

      <Input
        type="password"
        name="newPassword"
        label="New Password"
        placeholder="Enter new password"
        value={formData.newPassword}
        onChange={handleInputChange}
        rounded="xl"
        required
      />

      <Input
        type="password"
        name="confirmPassword"
        label="Confirm New Password"
        placeholder="Confirm new password"
        value={formData.confirmPassword}
        onChange={handleInputChange}
        rounded="xl"
        required
      />

      <div className="text-xs text-gray-500 space-y-1">
        <p>Password requirements:</p>
        <ul className="list-disc pl-4 space-y-1">
          <li>At least 8 characters long</li>
          <li>Contains uppercase and lowercase letters</li>
          <li>Contains at least one number</li>
          <li>Contains at least one special character (!@#$%^&*)</li>
        </ul>
      </div>
      
      {error && (
        <div className="text-red-500 text-sm text-center">{error}</div>
      )}

      <div className="flex justify-center">
        <Button
          type="submit"
          variant="primary"
          disabled={loading}
        >
          {loading ? 'Resetting...' : 'Reset Password'}
        </Button>
      </div>

      <div className="text-center">
        <button
          type="button"
          onClick={onBackToOTP}
          className="text-sm text-gray-600 hover:underline"
        >
          Back to Verification Code
        </button>
      </div>
    </form>
  );
};

export default ResetPasswordForm; 