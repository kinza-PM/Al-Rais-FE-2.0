import React, { useRef } from 'react';
import { useOutletContext } from 'react-router-dom';
import { MainLayout } from '../components';
import HeroSection from '../components/molecules/HeroSection';

interface LandingPageContext {
  onLoginClick: () => void;
  onSignupClick: () => void;
}

const LandingPage: React.FC = () => {
  const { onLoginClick, onSignupClick } = useOutletContext<LandingPageContext>();


  return (
    <MainLayout onLoginClick={onLoginClick} onSignupClick={onSignupClick}>
      <div className="relative justify-center flex flex-col max-w-full">
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-semibold text-black leading-tight mt-10 text-center">
          Experience the true <span className="text-[#EA0029]">richness</span> of travel.
        </h1>

        <HeroSection />
      </div>
    </MainLayout>
  );
};

export default LandingPage;
