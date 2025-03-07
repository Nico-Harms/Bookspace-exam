import { StarIcon } from "../ui/StarIcon";
import type { BookRatingProps } from "~/types/book";

export const BookRating = ({ rating, ratingsCount }: BookRatingProps) => {
  if (typeof rating !== "number" || rating <= 0) return null;

  return (
    <div className="flex items-center mt-2">
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <StarIcon key={i} filled={i < Math.round(rating)} />
        ))}
      </div>
      <span className="text-xs text-gray-600 ml-1">({ratingsCount || 0})</span>
    </div>
  );
};
