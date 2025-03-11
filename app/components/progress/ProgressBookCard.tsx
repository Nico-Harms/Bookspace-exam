import { Link } from "react-router";
import type { Book as BookType } from "~/types/book";

interface ProgressBookCardProps {
  book: BookType & { progress?: any };
}

export function ProgressBookCard({ book }: ProgressBookCardProps) {
  // Extract completion date if available
  const completionDate = book.progress?.completionDate
    ? new Date(book.progress.completionDate).toLocaleDateString()
    : null;

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
        {completionDate && (
          <p className="text-xs text-green-600 mt-1">
            Completed: {completionDate}
          </p>
        )}
      </div>
    </Link>
  );
}
