import { useEffect, useState } from "react";

/*===============================================
=  Avatar component for profile pictures   =
===============================================*/

interface AvatarProps {
  src?: string | null;
  alt?: string;
  name?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
}

export function Avatar({
  src,
  alt = "User avatar",
  name = "",
  size = "md",
  className = "",
}: AvatarProps) {
  const [imageError, setImageError] = useState(false);

  // Log the received src for debugging
  useEffect(() => {
    setImageError(false);
  }, [src]);

  // Get initials from name
  const getInitials = () => {
    if (!name) return "";
    return name
      .split(" ")
      .map((part) => part[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  // Process the image URL to handle special cases
  const getProcessedSrc = () => {
    if (!src) return null;

    // Remove @ prefix if present
    let processedSrc = src.startsWith("@") ? src.substring(1) : src;

    return processedSrc;
  };

  // Size classes
  const sizeClasses = {
    xs: "w-6 h-6 text-xs",
    sm: "w-8 h-8 text-sm",
    md: "w-10 h-10 text-base",
    lg: "w-16 h-16 text-xl",
    xl: "w-24 h-24 text-2xl",
  };

  const processedSrc = getProcessedSrc();

  return (
    <div
      className={`relative ${sizeClasses[size]} rounded-full overflow-hidden ${className}`}
    >
      {processedSrc && !imageError ? (
        <img
          src={processedSrc}
          alt={alt}
          className="w-full h-full object-cover"
          onError={(e) => {
            console.error("Image failed to load:", processedSrc);
            setImageError(true);
          }}
          loading="lazy"
        />
      ) : (
        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
          <span className="text-gray-600">{getInitials()}</span>
        </div>
      )}
    </div>
  );
}
