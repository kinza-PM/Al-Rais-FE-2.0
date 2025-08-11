import React, { useState, useEffect } from 'react';
import Input from '../atoms/Input';
import Button from '../atoms/Button';
import { useAuth } from '../../features/auth/hooks/useAuth';

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

  return (
    <div className="space-y-4">
      {!showOtpInput ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="text"
            name="name"
            label="Your Name"
            placeholder="Enter your name"
            value={formData.name}
            onChange={handleInputChange}
            rounded="xl"
            required
          />
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
              className={`text-sm underline ${
                canResend && !resendLoading 
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