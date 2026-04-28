
interface LogoProps {
  src: string;
  alt: string;
  size?: 'small' | 'medium' | 'large' | 'modal';
  className?: string;
}

function Logo({ 
  src, 
  alt, 
  size = 'medium', 
  className = '' 
}: LogoProps) {
  const sizeClasses = {
    small: 'w-[120px] h-[31px] sm:w-[140px] sm:h-[36px]',
    medium: 'w-[140px] h-[36px] lg:w-[172px] lg:h-[44px]',
    large: 'w-[172px] h-[44px]',
    modal: 'w-[60px] h-[44px]'
  };

  const responsiveClasses = size === 'small' 
    ? 'w-[120px] h-[31px] sm:w-[140px] sm:h-[36px] lg:w-[172px] lg:h-[44px]'
    : sizeClasses[size];

  return (
    <img 
      src={src}
      alt={alt}
      className={`${responsiveClasses} ${className}`}
      style={{
        transform: 'rotate(0deg)',
        opacity: 1
      }}
    />
  );
}

export default Logo;