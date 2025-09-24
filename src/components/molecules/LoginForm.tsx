import React, { useMemo, useState } from 'react';
import Input from '../atoms/Input';
import Button from '../atoms/Button';
import { useAuth } from '../../features/auth/hooks/useAuth';
import Logo from '../atoms/Logo';
import logoImg from '../../assets/images/logo.jpg';
import { getEmailError } from '../../utils/validators';
interface LoginFormProps {
  onSignupClick: () => void;
  onLoginSuccess?: () => void;
  onForgotPasswordClick?: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSignupClick, onLoginSuccess, onForgotPasswordClick }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [usePhone, setUsePhone] = useState(false);
  const [loginMessage, setLoginMessage] = useState<string | null>(null);
  const [touched, setTouched] = useState({ email: false, password: false });
  const { login, loading, error } = useAuth();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
  };

  const isEmailValid = (value: string) => {
    const trimmed = value.trim();
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginMessage(null);

    if (!isFormValid) {
      setTouched({ email: true, password: true });
      return;
    }

    if (!formData.email || !formData.password) return;

    const result = await login(formData);
    if (result.success) {
      setTimeout(() => {
        onLoginSuccess?.();
      }, 2000);
    }
  };

  const isFormValid = useMemo(() => {
    const emailTrim = formData.email.trim();
    const passTrim = formData.password.trim();

    if (!emailTrim || !passTrim) return false;
    if (!usePhone && !isEmailValid(emailTrim)) return false;
    return true;
  }, [formData, usePhone]);

  const emailError = useMemo(
    () => getEmailError(formData.email, usePhone),
    [formData.email, usePhone]
  );

  const emailHasError = Boolean(emailError);

  return (
    <div className="flex items-center justify-center">
      <div className="bg-white rounded-xl border border-gray-200 w-full px-4 py-10">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <Logo src={logoImg} alt="Logo" size="modal" />
        </div>

        <h2 className="text-center text-2xl font-semibold mb-1">Welcome back</h2>
        <p className="text-center text-sm text-gray-500 mb-6">Please login to continue</p>

        {/* Toggle Buttons */}
        <div className="flex justify-center mb-6">
          <button
            className={`px-6 py-2 text-sm rounded-l-full border ${!usePhone ? 'bg-primary text-white' : 'bg-white text-gray-700 border-gray-300'}`}
            onClick={() => setUsePhone(false)}
          >
            Email
          </button>
          <button
            className={`px-6 py-2 text-sm rounded-r-full border ${usePhone ? 'bg-primary text-white' : 'bg-white text-gray-700 border-gray-300'}`}
            onClick={() => setUsePhone(true)}
          >
            Phone
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">
              {usePhone ? 'Phone' : 'Email'}
            </label>
            <Input
              type={usePhone ? 'tel' : 'email'}
              name="email"
              placeholder={usePhone ? 'Enter your phone number' : 'Enter your email'}
              value={formData.email}
              onChange={handleInputChange}
              onBlur={handleBlur}
              touched={touched.email}
              error={emailHasError}
            />
            {touched.email && emailHasError && (
              <p role="alert" aria-live="assertive" className="mt-1 text-sm text-red-600">
                {emailError}
              </p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Password</label>
            <Input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleInputChange}
              onBlur={handleBlur}
              touched={touched.password}
              error={formData.password.trim() === ''}
            />
            {touched.password && formData.password.trim() === '' && (
              <p role="alert" aria-live="assertive" className="mt-1 text-sm text-red-600">
                This field is required.
              </p>
            )}
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}
          {loginMessage && <p className="text-green-500 text-sm">{loginMessage}</p>}

          <div className="text-right">
            <button
              type="button"
              onClick={onForgotPasswordClick}
              className="text-sm text-blue-600 hover:underline"
            >
              Forgot password?
            </button>
          </div>

          <Button type="submit" className="w-full"
            disabled={!isFormValid || !!loading?.login}
            aria-disabled={!isFormValid || !!loading?.login}
          >
            {loading?.login ? 'Logging in...' : 'Login'}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          Don’t have an account?{' '}
          <button onClick={onSignupClick} className="text-blue-600 hover:underline">
            Sign up
          </button>
        </div>

        <p className="mt-6 text-xs text-center text-gray-400">
          By continuing, you agree to our{' '}
          <a href="#" className="underline">
            Terms
          </a>{' '}
          and{' '}
          <a href="#" className="underline">
            Privacy policy
          </a>
        </p>
      </div>
    </div>
  );
};

export default LoginForm;