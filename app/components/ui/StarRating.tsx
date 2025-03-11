import { useState } from "react";

interface StarRatingProps {
  value: number;
  onChange?: (rating: number) => void;
  readOnly?: boolean;
  size?: "sm" | "md" | "lg";
}

export function StarRating({
  value,
  onChange,
  readOnly = false,
  size = "md",
}: StarRatingProps) {
  const [hoverValue, setHoverValue] = useState<number | null>(null);

  // Size classes for the stars
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  // Determine the current display value (hover or actual value)
  const displayValue = hoverValue !== null ? hoverValue : value;

  // Handle mouse enter on a star
  const handleMouseEnter = (rating: number) => {
    if (readOnly) return;
    setHoverValue(rating);
  };

  // Handle mouse leave from the component
  const handleMouseLeave = () => {
    if (readOnly) return;
    setHoverValue(null);
  };

  // Handle click on a star
  const handleClick = (rating: number) => {
    if (readOnly || !onChange) return;
    onChange(rating);
  };

  return (
    <div className="flex items-center" onMouseLeave={handleMouseLeave}>
      {[1, 2, 3, 4, 5].map((rating) => (
        <span
          key={rating}
          className={`${!readOnly ? "cursor-pointer" : ""} text-yellow-400 mr-0.5`}
          onMouseEnter={() => handleMouseEnter(rating)}
          onClick={() => handleClick(rating)}
        >
          {rating <= displayValue ? (
            <svg
              className={sizeClasses[size]}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          ) : (
            <svg
              className={sizeClasses[size]}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
              />
            </svg>
          )}
        </span>
      ))}
      {!readOnly && (
        <span className="ml-2 text-sm text-gray-500">{displayValue}/5</span>
      )}
    </div>
  );
}
