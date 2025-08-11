import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { MainLayout } from '../components';

interface LandingPageContext {
  onLoginClick: () => void;
  onSignupClick: () => void;
}

const LandingPage: React.FC = () => {
  const { onLoginClick, onSignupClick } = useOutletContext<LandingPageContext>();

  return (
    <MainLayout
      onLoginClick={onLoginClick}
      onSignupClick={onSignupClick}
    >
      <div className="relative justify-center items-center flex flex-col max-w-full">
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-semibold text-black leading-tight">
          Experience the true <span className="text-[#D90429]">richness</span> of travel.
        </h1>
        <div className="absolute w-full h-[1px] sm:h-[2px] bg-[#60A5FA] top-[52%] left-0 transform -translate-y-1/2 z-[-1]"></div>
      </div>
    </MainLayout>
  );
};

export default LandingPage; 