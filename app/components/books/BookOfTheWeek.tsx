import { Link } from "react-router";
import type { Book as BookType } from "~/types/book";
import { StarRating } from "~/components/ui/StarRating";
import { Button } from "../ui/button";

interface BookOfTheWeekProps {
  book: BookType | null;
}

export function BookOfTheWeek({ book }: BookOfTheWeekProps) {
  if (!book) {
    return (
      <div className="bg-gray-50 rounded-lg p-6 mb-8 text-center">
        <h2 className="text-xl font-semibold text-gray-700 mb-2">
          No Book of the Week
        </h2>
        <p className="text-gray-500">
          Check back next week for our featured book!
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-[#48302D] to-[#8B786D] rounded-lg p-6 mb-8">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Book Cover */}
        <div className="w-full md:w-1/3 lg:w-1/4">
          <div className="aspect-[2/3] relative rounded-lg overflow-hidden shadow-lg">
            {book.coverImage?.url ? (
              <img
                src={book.coverImage.url}
                alt={book.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-200">
                <span className="text-gray-500">No Cover</span>
              </div>
            )}
          </div>
        </div>

        {/* Book Details */}
        <div className="flex-1">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">
                {book.title}
              </h2>
              <p className="text-gray-200 mb-4">by {book.author?.join(", ")}</p>
            </div>
            <div className="flex items-center gap-2">
              <StarRating value={book.averageRating || 0} readOnly size="lg" />
            </div>
          </div>

          <p className="text-gray-200 mb-4 line-clamp-3">{book.description}</p>

          <div className="flex flex-wrap gap-2 mb-4">
            {book.genres?.map((genre) => (
              <span
                key={genre}
                className="px-3 py-1 bg-white/10 text-white rounded-full text-sm"
              >
                {genre}
              </span>
            ))}
          </div>

          <Button asChild variant="secondary" className="hover:bg-white/90">
            <Link to={`/books/${book._id}`}>View Details</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
