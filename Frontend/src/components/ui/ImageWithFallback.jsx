import { useState } from "react";

export default function ImageWithFallback({
  src,
  fallbackSrc = "/images/categories/cat-community.jpg",
  alt = "CommunityConnect Image",
  className = "",
  aspectClassName = "aspect-4/3",
  overlay = false,
  overlayClassName = "bg-gradient-to-t from-black/60 via-black/20 to-transparent",
  priority = false,
  children
}) {
  const [imgSrc, setImgSrc] = useState(src);
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const handleError = () => {
    if (!hasError && fallbackSrc && imgSrc !== fallbackSrc) {
      setHasError(true);
      setImgSrc(fallbackSrc);
    }
  };

  return (
    <div className={`relative overflow-hidden ${aspectClassName} ${className}`}>
      {/* Skeleton placeholder while loading */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-gradient-to-r from-[#EAEFEA] via-[#F4F7F4] to-[#EAEFEA] animate-pulse" />
      )}

      <img
        src={imgSrc || fallbackSrc}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        onError={handleError}
        onLoad={() => setIsLoaded(true)}
        className={`h-full w-full object-cover transition-all duration-500 ease-out ${
          isLoaded ? "opacity-100 scale-100" : "opacity-0 scale-102"
        }`}
      />

      {/* Optional gradient overlay */}
      {overlay && (
        <div className={`absolute inset-0 pointer-events-none ${overlayClassName}`} />
      )}

      {/* Optional overlay children */}
      {children && (
        <div className="absolute inset-0 flex flex-col justify-end p-4 z-10">
          {children}
        </div>
      )}
    </div>
  );
}
