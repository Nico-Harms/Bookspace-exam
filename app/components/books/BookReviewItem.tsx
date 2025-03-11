import { useState } from "react";
import { StarRating } from "~/components/ui/StarRating";
import type { BookReview } from "~/types/book";

interface BookReviewItemProps {
  review: BookReview;
}

export function BookReviewItem({ review }: BookReviewItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Format date with a consistent format to avoid hydration mismatch
  const formatDate = (dateString: string | Date) => {
    const date = new Date(dateString);
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();

    // Ensure consistent format between server and client
    return `${day} ${month} ${year}`;
  };

  // Get date as string to avoid hydration issues
  const formattedDate =
    typeof review.createdAt === "string"
      ? formatDate(new Date(review.createdAt))
      : formatDate(review.createdAt);

  // Determine if comment is long and needs expansion
  const isLongComment = review.comment && review.comment.length > 150;

  // Get user avatar placeholder if no profile image
  const userInitial = review.user?.name?.charAt(0) || "?";

  return (
    <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
      <div className="flex items-start gap-3">
        {/* User Avatar */}
        {review.user?.profileImage ? (
          <img
            src={review.user.profileImage}
            alt={`${review.user.name}'s avatar`}
            className="w-10 h-10 rounded-full object-cover"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-medium">
            {userInitial}
          </div>
        )}

        {/* Review Content */}
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <div>
              <p className="font-medium">{review.user?.name}</p>
              <div className="flex items-center mt-1">
                <StarRating value={review.rating} readOnly size="sm" />
                <span className="ml-2 text-sm text-gray-500">
                  {formattedDate}
                </span>
              </div>
            </div>

            {review.isVerifiedPurchase && (
              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                Verified
              </span>
            )}
          </div>

          {/* Review Title */}
          {review.title && <p className="font-medium mt-2">{review.title}</p>}

          {/* Review Comment */}
          {review.comment && (
            <div className="mt-2">
              <p
                className={`text-gray-700 ${isLongComment && !isExpanded ? "line-clamp-3" : ""}`}
              >
                {review.comment}
              </p>

              {isLongComment && (
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="text-indigo-600 text-sm mt-1 hover:underline"
                >
                  {isExpanded ? "Show less" : "Read more"}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
