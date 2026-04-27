
interface LogoProps {
  src: string;
  alt: string;
  size?: "small" | "medium" | "large" | "modal";
  className?: string;
}

function Logo({
  src,
  alt,
  size = "medium",
  className = "",
}: LogoProps) {
  const sizeClasses = {
    // Keep consistent width scale and let image preserve its own aspect ratio for sharp rendering.
    small: "w-[142px] sm:w-[156px] lg:w-[176px] h-auto",
    medium: "w-[156px] lg:w-[176px] h-auto",
    large: "w-[176px] h-auto",
    modal: "w-[78px] h-auto",
  };

  const responsiveClasses = sizeClasses[size];

  return (
    <img
      src={src}
      alt={alt}
      className={`${responsiveClasses} object-contain ${className}`}
      loading="eager"
      decoding="async"
      style={{
        transform: "rotate(0deg)",
        opacity: 1,
        imageRendering: "auto",
      }}
    />
  );
}

export default Logo;