import React, { useState } from 'react';

interface InputProps {
  type?: 'text' | 'email' | 'password' | 'tel';
  placeholder?: string;
  label?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  className?: string;
  rounded?: 'md' | 'xl';
  name?: string;
  required?: boolean;
  touched?: boolean;
  error?: boolean;
}

const Input: React.FC<InputProps> = ({
  type = 'text',
  placeholder,
  label,
  value,
  onChange,
  onBlur,
  className = '',
  rounded = 'md',
  name,
  required,
  touched,
  error
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const roundedClasses = {
    md: 'rounded-md',
    xl: 'rounded-xl'
  };

  const isPasswordType = type === 'password';
  const inputType = isPasswordType ? (showPassword ? 'text' : 'password') : type;

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const hasError = Boolean(touched && error);

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          type={inputType}
          name={name}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required={required}
          onBlur={onBlur}
          className={`w-full px-3 py-2 border ${hasError ? 'border-red-500 focus:ring-red-200' : 'border-gray-300'} ${roundedClasses[rounded]} focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${isPasswordType ? 'pr-10' : ''}`}
        />
        {isPasswordType && (
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <svg
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                style={{
                  width: '20px',
                  height: '20px',
                  transform: 'rotate(0deg)',
                  opacity: 1
                }}
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
              </svg>
            ) : (
              <svg width="18" height="9" viewBox="0 0 18 9" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M16.8125 6.67193C16.7411 6.71264 16.6624 6.73887 16.5808 6.74912C16.4993 6.75937 16.4165 6.75344 16.3373 6.73167C16.258 6.7099 16.1839 6.67272 16.119 6.62225C16.0542 6.57178 15.9999 6.50902 15.9593 6.43755L14.475 3.8438C13.612 4.4273 12.66 4.86687 11.6562 5.14537L12.1148 7.89693C12.1283 7.97793 12.1258 8.06081 12.1073 8.14082C12.0887 8.22083 12.0546 8.29641 12.0069 8.36323C11.9592 8.43006 11.8987 8.48681 11.829 8.53027C11.7593 8.57372 11.6818 8.60301 11.6007 8.61646C11.5674 8.62191 11.5337 8.62479 11.5 8.62505C11.3521 8.62483 11.2091 8.5722 11.0964 8.47651C10.9837 8.38081 10.9085 8.24826 10.8843 8.1024L10.4336 5.40084C9.48293 5.53313 8.51856 5.53313 7.56793 5.40084L7.11715 8.1024C7.09289 8.24852 7.01753 8.38129 6.90449 8.47701C6.79145 8.57274 6.64809 8.6252 6.49996 8.62505C6.46541 8.62491 6.43093 8.62204 6.39684 8.61646C6.31582 8.60301 6.23825 8.57372 6.16856 8.53027C6.09887 8.48681 6.03843 8.43006 5.99068 8.36323C5.94294 8.29641 5.90884 8.22083 5.89032 8.14082C5.87181 8.06081 5.86924 7.97793 5.88277 7.89693L6.34371 5.14537C5.3403 4.86599 4.38887 4.42563 3.52652 3.84146L2.04684 6.43755C1.96396 6.58197 1.8271 6.68755 1.66637 6.73107C1.50565 6.77458 1.33422 6.75247 1.1898 6.66959C1.04539 6.58671 0.939806 6.44985 0.896291 6.28913C0.852777 6.1284 0.874893 5.95697 0.957773 5.81255L2.52027 3.07818C1.97144 2.60402 1.46677 2.08105 1.01246 1.51568C0.955803 1.45242 0.912632 1.37828 0.885582 1.29778C0.858532 1.21728 0.84817 1.13211 0.85513 1.04748C0.862089 0.962842 0.886224 0.880512 0.926061 0.805514C0.965898 0.730515 1.0206 0.664422 1.08683 0.611268C1.15306 0.558114 1.22943 0.519015 1.31127 0.496357C1.39311 0.473698 1.47872 0.467957 1.56285 0.479482C1.64699 0.491008 1.72789 0.519559 1.80063 0.563393C1.87336 0.607226 1.9364 0.665422 1.9859 0.734429C3.28277 2.33912 5.55152 4.25005 8.99996 4.25005C12.4484 4.25005 14.7171 2.33677 16.014 0.734429C16.063 0.66401 16.1259 0.604413 16.1988 0.559345C16.2718 0.514277 16.3532 0.484704 16.4381 0.472464C16.5229 0.460224 16.6094 0.46558 16.6921 0.488199C16.7749 0.510818 16.852 0.550215 16.9189 0.60394C16.9857 0.657665 17.0408 0.724568 17.0806 0.800487C17.1205 0.876406 17.1443 0.959716 17.1506 1.04524C17.1569 1.13075 17.1455 1.21665 17.1172 1.29759C17.0888 1.37852 17.0442 1.45276 16.9859 1.51568C16.5316 2.08105 16.0269 2.60402 15.4781 3.07818L17.0406 5.81255C17.0825 5.88383 17.1099 5.96273 17.1211 6.04466C17.1324 6.1266 17.1272 6.20995 17.106 6.28989C17.0848 6.36982 17.0479 6.44475 16.9975 6.51033C16.9471 6.57591 16.8842 6.63084 16.8125 6.67193Z" fill="#2351A3" />
              </svg>
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default Input; 