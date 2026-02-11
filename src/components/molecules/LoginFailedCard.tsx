import React from 'react';

interface LoginFailedCardProps {
  onTryAgain: () => void;
}

/**
 * Figma: Login failed card - error icon, heading, message, Try Again button
 * UI only - no backend logic
 */
const LoginFailedCard: React.FC<LoginFailedCardProps> = ({ onTryAgain }) => {
  return (
    <div className="w-full max-w-[368px] rounded-xl sm:rounded-2xl bg-white shadow-lg px-6 py-10 sm:px-9">
      {/* Figma: "Login failed" faint label top-left */}
      {/* <p className="text-left text-xs text-[#9CA3AF] mb-2">Login failed</p> */}

      {/* Figma: Error icon - 52x52, border-radius 16px, bg #FFB8C4 */}
      <div className="flex justify-center mb-4">
        <div
          className="flex shrink-0 items-center justify-center"
          style={{
            width: '52px',
            height: '52px',
            borderRadius: '16px',
            background: '#FFB8C4',
          }}
        >
          {/* Inner circle with "i" */}
          <div
            className="flex items-center justify-center"
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: '#FF5270',
            }}
          >
            <span className="text-xl font-bold text-white">i</span>
          </div>
        </div>
      </div>

      {/* Figma: "Login failed!" - bold dark */}
      <h2 className="text-center text-xl font-bold text-[#0A0C0F] mb-2 sm:text-2xl">
        Login failed!
      </h2>

      {/* Figma: Detailed message */}
      <p className="text-center text-sm text-[#3D495C] mb-6 max-w-[320px] mx-auto leading-relaxed">
        The combination of email and password you entered does not exist on Al-Rais
      </p>

      {/* Figma: Try Again button - 156x47, radius 100px, padding 14px 40px, gradient */}
      <div className="flex justify-center">
        <button
          type="button"
          onClick={onTryAgain}
          className="flex min-h-[47px] min-w-[156px] items-center justify-center gap-2.5 rounded-full px-10 py-3.5 font-medium text-white transition-opacity hover:opacity-95"
          style={{
            background: 'linear-gradient(90.59deg, #5383DA 0%, #2351A3 50%, #081326 100%)',
          }}
        >
          Try again
        </button>
      </div>
    </div>
  );
};

export default LoginFailedCard;
