import React, { useState } from 'react';

interface InputProps {
  type?: 'text' | 'email' | 'password' | 'tel';
  placeholder?: string;
  label?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  rounded?: 'md' | 'xl';
  name?: string;
  required?: boolean;
}

const Input: React.FC<InputProps> = ({
  type = 'text',
  placeholder,
  label,
  value,
  onChange,
  className = '',
  rounded = 'md',
  name,
  required
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
          className={`w-full px-3 py-2 border border-gray-300 ${roundedClasses[rounded]} focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${isPasswordType ? 'pr-10' : ''}`}
        />
        {isPasswordType && (
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className="absolute inset-y-0 right-0 pr-3 flex items-center hover:bg-gray-50 focus:outline-none"
          >
            {showPassword ? (
              <svg 
                className="text-gray-400 hover:text-gray-600" 
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            ) : (
              <svg 
                className="text-gray-400 hover:text-gray-600" 
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L8.464 8.464m1.414 1.414L12 12m-3.122-3.122l1.415-1.414M12 12l2.122 2.122m0 0l2.122 2.122M12 12L9.878 9.878m8.586 8.586L16.95 16.95m1.414 1.414L21 21m-3.536-3.536l-1.414-1.414M16.95 16.95l1.414 1.414" />
              </svg>
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default Input; 