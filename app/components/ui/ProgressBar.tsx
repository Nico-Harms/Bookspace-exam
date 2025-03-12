/*===============================================
=            Progress bar component           =
===============================================*/

interface ProgressBarProps {
  percentage: number;
  variant?: "reading" | "wantToRead" | "goal";
  showLabels?: boolean;
  height?: "sm" | "md" | "lg";
  labelText?: string;
  additionalClasses?: string;
}

/**
 * A reusable progress bar component with different visual styles based on the variant
 */
export function ProgressBar({
  percentage,
  variant = "reading",
  showLabels = true,
  height = "sm",
  labelText,
  additionalClasses = "",
}: ProgressBarProps) {
  // Define height classes based on the height prop
  const heightClasses = {
    sm: "h-1.5",
    md: "h-2.5",
    lg: "h-4",
  };

  // Get the appropriate gradient based on the variant
  const getBarClasses = () => {
    switch (variant) {
      case "reading":
        return "bg-gradient-to-r from-indigo-500 to-purple-600";
      case "wantToRead":
        return "bg-gradient-to-r from-blue-400 to-teal-500";
      case "goal":
        // For the reading goal variant with warm colors
        return getProgressColorByPercentage(percentage);
      default:
        return "bg-blue-500";
    }
  };

  // Get color based on progress percentage for goal variant
  const getProgressColorByPercentage = (progress: number) => {
    if (progress >= 100) return "bg-amber-600";
    if (progress >= 75) return "bg-amber-500";
    if (progress >= 50) return "bg-amber-400";
    if (progress >= 25) return "bg-orange-300";
    return "bg-orange-200";
  };

  // Get the appropriate background color for the track
  const getTrackClasses = () => {
    if (variant === "goal") return "bg-[#3A2825]";
    return "bg-gray-200";
  };

  return (
    <div className={`w-full ${additionalClasses}`}>
      {/* Progress bar */}
      <div
        className={`w-full ${heightClasses[height]} ${getTrackClasses()} rounded-full overflow-hidden`}
      >
        {percentage > 0 ? (
          <div
            className={`h-full transition-all duration-300 ease-in-out ${getBarClasses()}`}
            style={{ width: `${percentage}%` }}
          ></div>
        ) : (
          <div className="h-full bg-gray-300 w-0"></div>
        )}
      </div>

      {/* Labels */}
      {showLabels && (
        <div className="flex justify-between mt-1">
          {labelText ? (
            <span className="text-xs text-gray-500">{labelText}</span>
          ) : (
            <>
              <span className="text-[10px] text-gray-500">
                {percentage > 0 ? `${percentage}%` : "Not started"}
              </span>
              {percentage > 0 && (
                <span className="text-[10px] text-indigo-600 font-medium">
                  {percentage}% complete
                </span>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
