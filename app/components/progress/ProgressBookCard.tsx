import { Link } from "react-router";
import { ReadingStatus } from "~/models/UserBookProgress";
import { ProgressBar } from "~/components/ui/ProgressBar";
import { calculateReadingProgress } from "~/utils/bookProgress";
import type { BookWithProgress } from "~/types/bookProgress";

interface ProgressBookCardProps {
  book: BookWithProgress;
}

export function ProgressBookCard({ book }: ProgressBookCardProps) {
  // Extract completion date if available
  const completionDate = book.progress?.completionDate
    ? new Date(book.progress.completionDate).toLocaleDateString()
    : null;

  // Determine reading status
  const isReading = book.progress?.status === ReadingStatus.READING;
  const isWantToRead = book.progress?.status === ReadingStatus.WANT_TO_READ;

  // Extract values for progress calculation
  const pagesRead = book.progress?.pagesRead || 0;
  const totalPages = book.pageCount || 0;

  // Calculate progress percentage
  const progressPercentage = calculateReadingProgress(pagesRead, totalPages);

  return (
    <Link
      to={`/progress/${book._id}`}
      className="block bg-white rounded-lg shadow overflow-hidden hover:shadow-md transition-shadow"
    >
      <div className="aspect-[2/3] relative">
        {book.coverImage?.url ? (
          <img
            src={book.coverImage.url}
            alt={book.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-200">
            <span className="text-gray-500 text-sm">No Cover</span>
          </div>
        )}
      </div>
      <div className="p-3">
        <h3 className="font-medium text-sm truncate">{book.title}</h3>
        <p className="text-xs text-gray-500 truncate">
          {book.author?.join(", ")}
        </p>

        {/* Show completion date for completed books */}
        {completionDate && (
          <p className="text-xs text-green-600 mt-1">
            Completed: {completionDate}
          </p>
        )}

        {/* Show progress bar for books being read */}
        {isReading && totalPages > 0 && (
          <div className="mt-2">
            <ProgressBar
              percentage={progressPercentage}
              variant="reading"
              labelText={`${pagesRead} of ${totalPages} pages (${progressPercentage}%)`}
            />
          </div>
        )}

        {/* Show progress bar for "Want to Read" books */}
        {isWantToRead && totalPages > 0 && (
          <div className="mt-2">
            <ProgressBar
              percentage={progressPercentage}
              variant="wantToRead"
              labelText={
                pagesRead > 0
                  ? `${pagesRead} of ${totalPages} pages`
                  : "Not started"
              }
            />
          </div>
        )}
      </div>
    </Link>
  );
}
