import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Logo from '../atoms/Logo';
import Button from '../atoms/Button';
import { useAuth } from '../../features/auth/hooks/useAuth';

interface HeaderProps {
  logoSrc: string;
  onLoginClick: () => void;
  onSignupClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ logoSrc, onLoginClick, onSignupClick }) => {
  const { isAuthenticated, user, signOut } = useAuth();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    setIsDropdownOpen(false);
    await signOut();
    navigate('/');
  };

  return (
    <header className="header-gradient">
      <div className="w-full flex items-center justify-between py-4 px-4 sm:px-6 lg:px-10">
        {/* Logo */}
        <div className="flex items-center flex-shrink-0">
          <Link to="/">
            <Logo
              src={logoSrc}
              alt="Al Rais Travel logo"
              size="small"
            />
          </Link>
        </div>

        {/* Navigation - Original Design */}
        <nav className="flex items-center mt-3 space-x-10 sm:space-x-6 lg:space-x-20 sm:hidden text-base font-normal leading-none tracking-normal text-center align-middle font-inter text-black-200">
          <Link to="/travel" className="hover:text-blue-700 whitespace-nowrap">
            Travel
          </Link>
          <Link to="/packages" className="hover:text-blue-700 transition-colors whitespace-nowrap">
            Packages
          </Link>
          <Link to="/about" className="hover:text-blue-700 transition-colors whitespace-nowrap">
            About
          </Link>
          {isAuthenticated && (
            <Link to="/my-bookings" className="hover:text-blue-700 transition-colors whitespace-nowrap">
              My bookings
            </Link>
          )}
        </nav>

        {/* Auth Section - Original Design */}
        <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0">
          {isAuthenticated && user ? (
            // Simple user display with dropdown
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center space-x-3 text-sm font-medium text-gray-800 hover:text-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-lg px-3 py-2"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-sm ring-2 ring-white">
                  <span className="text-white text-sm font-semibold">
                    {user.name?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
                <span className="truncate font-medium text-gray-800">
                  Welcome, {user.name?.split('@')[0] || 'User'}
                </span>
                <svg className="w-4 h-4 transition-transform duration-200 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                  <Link
                    to="/profile"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    View Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            // Original Login/Signup buttons
            <>
              <Button
                onClick={onLoginClick}
                variant="primary"
                className="px-4 py-2 sm:px-6 sm:py-2 lg:px-7 lg:py-2 text-xs sm:text-sm"
              >
                Login
              </Button>
              <Button
                onClick={onSignupClick}
                variant="secondary"
                className="px-3 py-2 sm:px-5 sm:py-2 lg:px-6 lg:py-2 text-xs sm:text-sm"
              >
                Sign up
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header; 