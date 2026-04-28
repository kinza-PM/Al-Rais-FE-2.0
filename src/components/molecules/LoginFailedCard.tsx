import React from 'react';
import WarningIcon from '../../assets/images/Warning.png';

interface LoginFailedCardProps {
  onTryAgain: () => void;
}

const LoginFailedCard: React.FC<LoginFailedCardProps> = ({ onTryAgain }) => {
  return (
    <div
      className="w-full bg-white flex flex-col items-center justify-center"
      style={{
        maxWidth: '468px',
        height: '313px',
        borderRadius: '12px',
        boxShadow: '0 8px 32px rgba(10,12,15,0.12)',
      }}
    >
      {/* Warning icon — #FFB8C4 rounded square, Warning.png inside */}
      <div className="flex justify-center mb-5">
        <div
          style={{
            width: '52px',
            height: '52px',
            borderRadius: '16px',
            background: '#FFB8C4',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <img
            src={WarningIcon}
            alt="Warning"
            style={{
              width: '24px',
              height: '24px',
              objectFit: 'contain',
            }}
          />
        </div>
      </div>

      {/* Title */}
      <h2
        className="text-center text-[#0A0C0F] mb-3"
        style={{
          fontFamily: 'Inter, sans-serif',
          fontWeight: 600,
          fontSize: '18px',
          lineHeight: '100%',
          letterSpacing: '0%',
        }}
      >
        Login failed!
      </h2>

      {/* Message */}
      <p
        className="text-center mb-8"
        style={{
          fontFamily: 'Inter, sans-serif',
          fontWeight: 400,
          fontSize: '16px',
          lineHeight: '100%',
          letterSpacing: '0%',
          color: '#3D495C',
          maxWidth: '397px',
          width: '100%',
        }}
      >
        The combination of email and password you entered does not exist on Al-Rais
      </p>

      {/* Try again button */}
      <button
        type="button"
        onClick={onTryAgain}
        style={{
          width: '157px',
          height: '47px',
          borderRadius: '100px',
          paddingTop: '14px',
          paddingBottom: '14px',
          paddingLeft: '40px',
          paddingRight: '40px',
          background: 'linear-gradient(90.59deg, #5383DA 0%, #2351A3 50%, #081326 100%)',
          fontFamily: 'Inter, sans-serif',
          fontWeight: 600,
          fontSize: '16px',
          lineHeight: '100%',
          letterSpacing: '0.5px',
          color: '#FFFFFF',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          transition: 'opacity 0.2s',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.9'; }}
        onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
      >
        Try again
      </button>
    </div>
  );
};

export default LoginFailedCard;
