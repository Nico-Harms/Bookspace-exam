import { Link } from "react-router";
import type { Book as BookType } from "~/types/book";
import { ReadingStatus } from "~/models/UserBookProgress";

interface ProgressBookCardProps {
  book: BookType & { progress?: any };
}

export function ProgressBookCard({ book }: ProgressBookCardProps) {
  // Extract completion date if available
  const completionDate = book.progress?.completionDate
    ? new Date(book.progress.completionDate).toLocaleDateString()
    : null;

  // Calculate reading progress percentage
  const isReading = book.progress?.status === ReadingStatus.READING;
  const isWantToRead = book.progress?.status === ReadingStatus.WANT_TO_READ;
  const pagesRead = book.progress?.pagesRead || 0;
  const totalPages = book.pageCount || 0;
  const progressPercentage =
    totalPages > 0
      ? Math.min(100, Math.round((pagesRead / totalPages) * 100))
      : 0;

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
            <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-600"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-[10px] text-gray-500">
                {pagesRead} pages
              </span>
              <span className="text-[10px] text-indigo-600 font-medium">
                {progressPercentage}%
              </span>
            </div>
          </div>
        )}

        {/* Show progress bar for "Want to Read" books */}
        {isWantToRead && totalPages > 0 && (
          <div className="mt-2">
            <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
              {pagesRead > 0 ? (
                <div
                  className="h-full bg-gradient-to-r from-blue-400 to-teal-500"
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              ) : (
                <div className="h-full bg-gray-300 w-0"></div>
              )}
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-[10px] text-gray-500">
                {pagesRead > 0 ? `${pagesRead} pages` : "Not started"}
              </span>
              {pagesRead > 0 && (
                <span className="text-[10px] text-blue-600 font-medium">
                  {progressPercentage}%
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </Link>
  );
}
