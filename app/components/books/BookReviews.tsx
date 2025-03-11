import { useState } from "react";
import { StarRating } from "~/components/ui/StarRating";
import { BookReviewItem } from "./BookReviewItem";
import { BookReviewForm } from "./BookReviewForm";
import type { Book, BookReview } from "~/types/book";

interface BookReviewsProps {
  book: Book;
  userId?: string;
  hasReviewed: boolean;
}

export function BookReviews({ book, userId, hasReviewed }: BookReviewsProps) {
  const [sortOption, setSortOption] = useState<"newest" | "highest" | "lowest">(
    "newest",
  );

  // Calculate average rating
  const averageRating =
    book.reviews && book.reviews.length > 0
      ? book.reviews.reduce((sum, review) => sum + review.rating, 0) /
        book.reviews.length
      : 0;

  // Get rounded average for display
  const roundedAverage = Math.round(averageRating * 10) / 10;

  // Calculate rating distribution (how many 5 stars, 4 stars, etc.)
  const ratingDistribution =
    book.reviews?.reduce(
      (acc, review) => {
        const rating = Math.floor(review.rating);
        acc[rating] = (acc[rating] || 0) + 1;
        return acc;
      },
      {} as Record<number, number>,
    ) || {};

  // Get total review count
  const totalReviews = book.reviews?.length || 0;

  // Sort reviews based on selected option
  const sortedReviews = [...(book.reviews || [])].sort((a, b) => {
    if (sortOption === "newest") {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    } else if (sortOption === "highest") {
      return b.rating - a.rating;
    } else {
      return a.rating - b.rating;
    }
  });

  return (
    <div className="mt-10">
      <h2 className="text-2xl font-bold">Customer Reviews</h2>

      {/* Reviews Summary */}
      {totalReviews > 0 ? (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Summary Left Column */}
          <div>
            <div className="flex items-center">
              <div className="text-3xl font-bold">
                {roundedAverage.toFixed(1)}
              </div>
              <div className="ml-2">
                <StarRating value={averageRating} readOnly />
                <div className="text-sm text-gray-500 mt-1">
                  {totalReviews} {totalReviews === 1 ? "review" : "reviews"}
                </div>
              </div>
            </div>

            {/* Rating Distribution */}
            <div className="mt-6 space-y-2">
              {[5, 4, 3, 2, 1].map((rating) => {
                const count = ratingDistribution[rating] || 0;
                const percentage =
                  totalReviews > 0 ? (count / totalReviews) * 100 : 0;

                return (
                  <div key={rating} className="flex items-center">
                    <div className="text-sm w-14">{rating} stars</div>
                    <div className="ml-2 flex-1 bg-gray-200 rounded-full h-2.5 overflow-hidden">
                      <div
                        className="bg-yellow-400 h-full rounded-full"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <div className="ml-2 text-sm text-gray-500 w-10">
                      {count}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Add a Review */}
          <div>
            {userId && !hasReviewed ? (
              <div>
                <h3 className="text-lg font-medium mb-4">Write a Review</h3>
                <BookReviewForm bookId={book._id} />
              </div>
            ) : hasReviewed ? (
              <div className="bg-indigo-50 p-4 rounded-lg">
                <p className="text-indigo-700">
                  You have already reviewed this book.
                </p>
              </div>
            ) : (
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700">Sign in to write a review.</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="mt-4 bg-gray-50 p-6 rounded-lg text-center">
          <p className="text-gray-600">
            No reviews yet. Be the first to review this book!
          </p>

          {userId ? (
            <div className="mt-6">
              <h3 className="text-lg font-medium mb-4">Write a Review</h3>
              <BookReviewForm bookId={book._id} />
            </div>
          ) : (
            <p className="mt-4 text-gray-700">Sign in to write a review.</p>
          )}
        </div>
      )}

      {/* Reviews List */}
      {totalReviews > 0 && (
        <>
          <div className="mt-10 flex justify-between items-center">
            <h3 className="text-xl font-medium">Reviews</h3>
            <div>
              <label
                htmlFor="sort-reviews"
                className="mr-2 text-sm text-gray-600"
              >
                Sort by:
              </label>
              <select
                id="sort-reviews"
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value as any)}
                className="border border-gray-300 rounded-md text-sm py-1 px-2"
              >
                <option value="newest">Newest</option>
                <option value="highest">Highest Rating</option>
                <option value="lowest">Lowest Rating</option>
              </select>
            </div>
          </div>

          <div className="mt-4 space-y-4">
            {sortedReviews.map((review) => (
              <BookReviewItem key={review._id} review={review} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
