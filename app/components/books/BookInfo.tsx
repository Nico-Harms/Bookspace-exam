import type { BookInfoProps } from "~/types/book";

export const BookInfo = ({ book }: BookInfoProps) => {
  return (
    <>
      <h3 className="font-medium text-sm mb-1 truncate">
        {book.title || "Untitled"}
      </h3>
      <p className="text-xs text-gray-600 truncate">
        {Array.isArray(book.author) && book.author.length > 0
          ? book.author.join(", ")
          : "Unknown Author"}
      </p>
    </>
  );
};
