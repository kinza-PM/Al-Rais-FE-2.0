import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/atoms/Button';

const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">Page Not Found</h2>
          <p className="text-gray-600 mb-8">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>
        
        <div className="space-y-4">
          <Link to="/">
            <Button variant="primary" className="w-full">
              Go Back Home
            </Button>
          </Link>
          
          <Link to="/flights">
            <Button variant="secondary" className="w-full">
              Search Flights
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage; 