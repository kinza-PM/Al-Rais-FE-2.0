import React, { useMemo, useState } from 'react';
import Input from '../atoms/Input';
import Button from '../atoms/Button';
import { useAuth } from '../../features/auth/hooks/useAuth';
import Logo from '../atoms/Logo';
import logoImg from '../../assets/images/logo.jpg';
import { getEmailError } from '../../utils/validators';
import FlagUsa from '../../assets/images/Flag-usa.png';
import arrownDownwardIcon from '../../assets/svgs/arrow-downwards.svg';
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
  const [phoneCountryCode, setPhoneCountryCode] = useState('+1');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loginMessage, setLoginMessage] = useState<string | null>(null);
  const [touched, setTouched] = useState({ email: false, password: false });
  const { login, loading, error } = useAuth();

  function ChevronDown() {
    return (
      <img alt="arrow-icon" src={arrownDownwardIcon} className="pointer-events-none absolute right-3 top-3/5" />
    );
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
  };

  const handlePhoneBlur = () => {
    setTouched(prev => ({ ...prev, email: true }));
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

    // Combine phone country code and number if using phone
    const loginData = usePhone
      ? { email: `${phoneCountryCode}${phoneNumber}`, password: formData.password }
      : formData;

    if (!loginData.email || !loginData.password) return;

    const result = await login(loginData);
    if (result.success) {
      setTimeout(() => {
        onLoginSuccess?.();
      }, 2000);
    }
  };

  const isFormValid = useMemo(() => {
    const passTrim = formData.password.trim();
    if (!passTrim) return false;

    if (usePhone) {
      const phoneTrim = phoneNumber.trim();
      return phoneTrim.length > 0;
    } else {
      const emailTrim = formData.email.trim();
      if (!emailTrim) return false;
      return isEmailValid(emailTrim);
    }
  }, [formData, usePhone, phoneNumber]);

  const emailError = useMemo(() => {
    if (usePhone) {
      return phoneNumber.trim() === '' ? 'Phone number is required' : null;
    }
    return getEmailError(formData.email, usePhone);
  }, [formData.email, usePhone, phoneNumber]);

  const emailHasError = Boolean(emailError);

  return (
    <div className="flex items-center justify-center">
      <div className="bg-white rounded-xl border border-[#E4E4E7] w-full px-4 py-10">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <Logo src={logoImg} alt="Logo" size="modal" />
        </div>

        <h2 className="text-center text-2xl font-semibold mb-1">Welcome back</h2>
        <p className="text-center text-sm text-gray-500 mb-6">Please login to continue</p>

        {/* Toggle Buttons */}
        <div className="flex justify-center mb-6">
          <div className="flex items-center rounded-xl ring-1 ring-[#C2CAD6] px-2 py-1">
            <button
              type="button"
              onClick={() => {
                setUsePhone(false);
                setTouched(prev => ({ ...prev, email: false }));
              }}
              className={`px-7 py-2 text-[14px] rounded-xl transition-colors ${!usePhone
                ? "bg-[#2351A3] text-white"
                : "text-[#3D495C]"
                }`}
            >
              Email
            </button>
            <button
              type="button"
              onClick={() => {
                setUsePhone(true);
                setTouched(prev => ({ ...prev, email: false }));
              }}
              className={`px-7 py-2 text-[14px] rounded-xl transition-colors ${usePhone
                ? "bg-[#2351A3] text-white"
                : "text-[#3D495C]"
                }`}
            >
              Phone
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-normal text-[#3D495C]">
              {usePhone ? 'Phone' : 'Email'}
            </label>
            {usePhone ? (
              <div className="flex gap-2">
                <div className="relative">
                  <select
                    aria-label="Country code"
                    style={{ backgroundImage: `url(${FlagUsa})` }}
                    className="px-3 py-2 w-24 h-10 appearance-none rounded-xl border border-[#C2CAD6] bg-white pr-6 text-sm text-[#3D495C] focus:outline-none focus:ring-1 focus:ring-[#C2CAD6] focus:border-transparent bg-[var(--flag-url)] bg-no-repeat bg-[length:26px_26px] bg-[position:8px_center] pl-[40px]"
                    value={phoneCountryCode}
                    onChange={(e) => setPhoneCountryCode(e.target.value)}
                  >
                    <option value="+1">+1</option>
                    <option value="+92">+92</option>
                    <option value="+971">+971</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
                    <ChevronDown />
                  </div>
                </div>
                <div className="flex-1">
                  <Input
                    type="number"
                    placeholder="Phone"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    onBlur={handlePhoneBlur}
                    rounded="xl"
                  />
                </div>
              </div>
            ) : (
              <Input
                type="email"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleInputChange}
                onBlur={handleBlur}
                touched={touched.email}
                error={emailHasError}
                rounded="xl"
              />
            )}
            {touched.email && emailHasError && (
              <p role="alert" aria-live="assertive" className="mt-1 text-sm text-red-600">
                {emailError}
              </p>
            )}
          </div>

          <div>
            <label className="text-xs font-normal text-[#3D495C]">Password</label>
            <Input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleInputChange}
              onBlur={handleBlur}
              touched={touched.password}
              error={formData.password.trim() === ''}
              rounded="xl"
            />
            {touched.password && formData.password.trim() === '' && (
              <p role="alert" aria-live="assertive" className="mt-1 text-sm text-red-600">
                Password is required.
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

        <div className="mt-6 text-center text-sm text-[#3D495C]">
          Don’t have an account?{' '}
          <button onClick={onSignupClick} className="text-[#5383DA] hover:underline font-semibold">
            Sign up
          </button>
        </div>

        <p className="mt-6 text-xs text-center text-[#3D495C]">
          By continuing, you agree to our{' '}
          <a href="#" className="underline text-[#5383DA] font-medium">
            Terms
          </a>{' '}
          and{' '}
          <a href="#" className="underline text-[#5383DA] font-medium">
            Privacy policy
          </a>
        </p>
      </div>
    </div>
  );
};

export default LoginForm;