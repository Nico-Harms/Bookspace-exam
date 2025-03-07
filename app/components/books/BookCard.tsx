import { BookInfo } from "./BookInfo";
import { BookRating } from "./BookRating";
import type { BookCardProps } from "~/types/book";

export const BookCard = ({ book }: BookCardProps) => {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="aspect-[2/3] relative">
        <img
          src={book.coverImage?.url || "/placeholder.png"}
          alt={book.title || "Book cover"}
          className="absolute inset-0 w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.src = "/placeholder.png";
          }}
        />
      </div>
      <div className="p-4">
        <BookInfo book={book} />
        <BookRating rating={book.rating} ratingsCount={book.ratingsCount} />
      </div>
    </div>
  );
};
