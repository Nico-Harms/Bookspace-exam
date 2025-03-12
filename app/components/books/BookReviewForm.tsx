import { useState } from "react";
import { Form } from "react-router";
import { StarRating } from "~/components/ui/StarRating";
import type { BookReviewFormProps } from "~/types/book";
import { Button } from "../ui/button";

export function BookReviewForm({
  bookId,
  onReviewSubmitted,
}: BookReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    if (rating === 0) {
      e.preventDefault();
      setError("Please select a rating");
      return;
    }

    // Allow the form to submit naturally - don't prevent default
    setIsSubmitting(true);
    setError("");
  };

  return (
    <div className="bg-white rounded-lg p-4 border border-gray-200">
      <h3 className="text-lg font-semibold mb-3">Write a Review</h3>

      <Form method="post" onSubmit={handleSubmit} className="space-y-4">
        <input type="hidden" name="action" value="addReview" />
        {/* Don't need to pass bookId as it's part of the URL already */}

        <div>
          <label
            htmlFor="rating"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Rating
          </label>
          <div id="rating">
            <StarRating
              value={rating}
              onChange={(newRating) => {
                setRating(newRating);
                setError("");
              }}
              size="lg"
            />
          </div>
          <input type="hidden" name="rating" value={rating} />
          {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
        </div>

        <div>
          <label
            htmlFor="title"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Review Title (Optional)
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Summarize your thoughts"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            maxLength={100}
          />
        </div>

        <div>
          <label
            htmlFor="comment"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Review (Optional)
          </label>
          <textarea
            id="comment"
            name="comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your experience with this book"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            rows={4}
            maxLength={1000}
          />
        </div>

        <div>
          <Button
            type="submit"
            disabled={isSubmitting || rating === 0}
            className="w-full"
          >
            {isSubmitting ? "Submitting..." : "Submit Review"}
          </Button>
        </div>
      </Form>
    </div>
  );
}
