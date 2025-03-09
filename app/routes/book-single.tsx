import { useLoaderData } from "react-router";
import Book from "~/models/Book";
import type { LoaderArgs } from "./+types";
import type { Book as BookType } from "~/types/book";
import * as AuthService from "~/services/auth.server";
import { useState } from "react";
import { Link } from "react-router";

/*===============================================
=          Loader           =
===============================================*/

export async function loader({ request, params }: LoaderArgs) {
  const auth = await AuthService.requireAuth(request);
  const bookId = params.id;

  if (!bookId) {
    throw new Response("Book ID is required", { status: 400 });
  }

  // First try to find the book
  const book = await Book.findById(bookId).lean();

  if (!book) {
    return { book: null, bookId };
  }

  // Then find similar books, but use string comparison for _id
  const similarBooks = await Book.find({
    _id: { $ne: String(bookId) }, // Convert to string for comparison
    genres: { $in: book.genres },
  })
    .limit(5)
    .lean();

  // Convert all IDs to strings to ensure consistency
  const formattedSimilarBooks = similarBooks.map((book) => ({
    ...book,
    _id: String(book._id),
  }));

  return {
    book: { ...book, _id: String(book._id) },
    bookId,
    similarBooks: formattedSimilarBooks,
  };
}

/*===============================================
=          Component           =
===============================================*/

export default function BookSingle({
  loaderData,
}: {
  loaderData: {
    book: BookType | null;
    bookId: string;
    similarBooks: BookType[];
  };
}) {
  const { book, bookId, similarBooks } = loaderData;
  const [isExpanded, setIsExpanded] = useState(false);

  if (!book) {
    return (
      <div className="p-6">
        <h2>Book Not Found</h2>
        <p>We couldn't find a book with ID: {bookId}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header with back button and bookmark */}
      <header className="flex items-center justify-between p-4 border-b">
        <button className="p-2">
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
        <button className="p-2">
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
            />
          </svg>
        </button>
      </header>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        {/* Book cover and basic info */}
        <div className="p-4">
          <div className="flex flex-col items-center md:flex-row gap-8">
            {book.coverImage?.url && (
              <img
                src={book.coverImage.url}
                alt={`Cover for ${book.title}`}
                className="w-5/6 h-full object-fill rounded-lg shadow-lg max-w-[400px]"
              />
            )}
            <div className="flex flex-col justify-between">
              <div className="max-w-[90vw]">
                <h1 className="headline font-bold leading-tight">
                  {book.title}
                </h1>
                <p className="text-gray-600 mt-2">{book.author?.join(", ")}</p>
              </div>
              <div className="flex gap-2">
                <span className="px-3 py-1 bg-gray-100 rounded-full text-sm">
                  {book.genres?.[0] || "Drama"}
                </span>
                <div className="flex items-center gap-1">
                  <span>4.7</span>
                  <span className="text-gray-400">|</span>
                  <span>{book.pageCount} pages</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Reading mode and chat buttons */}
        <div className="flex gap-4 p-4">
          <button className="flex-1 py-2 px-4 bg-black text-white rounded-full">
            Reading mode
          </button>
          <button className="flex-1 py-2 px-4 border border-gray-300 rounded-full">
            Join the chat
          </button>
        </div>

        {/* Description */}
        <div className="p-4">
          <h2 className="font-semibold mb-2">Description</h2>
          <div className="relative">
            <p className={`text-gray-600 ${!isExpanded ? "line-clamp-2" : ""}`}>
              {book.description}
            </p>
            {book.description && book.description.length > 100 && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-blue-600 font-medium mt-1"
              >
                {isExpanded ? "Read less" : "Read more"}
              </button>
            )}
          </div>
        </div>

        {/* Similar books section */}
        <div className="p-4">
          <h2 className="font-semibold mb-2">Similar books</h2>
          <div className="flex gap-4 overflow-x-auto pb-4">
            {similarBooks.length > 0 ? (
              similarBooks.map((similarBook) => (
                <Link
                  key={similarBook._id}
                  to={`/books/${similarBook._id}`}
                  className="w-24 flex-shrink-0 group hover:opacity-90 transition-opacity"
                >
                  <div className="relative">
                    {similarBook.coverImage?.url ? (
                      <img
                        src={similarBook.coverImage.url}
                        alt={`Cover for ${similarBook.title}`}
                        className="w-full h-36 object-cover rounded-lg shadow-md group-hover:shadow-lg transition-shadow"
                      />
                    ) : (
                      <div className="w-full h-36 bg-gray-200 rounded-lg flex items-center justify-center">
                        <span className="text-gray-500 text-sm">No cover</span>
                      </div>
                    )}
                  </div>
                  <p className="text-sm mt-1 truncate font-medium group-hover:text-primary">
                    {similarBook.title}
                  </p>
                  <p className="text-xs text-gray-600 truncate">
                    {similarBook.author?.[0]}
                  </p>
                </Link>
              ))
            ) : (
              <p className="text-gray-500 italic">No similar books found</p>
            )}
          </div>
        </div>

        {/* Reviews section */}
        <div className="p-4">
          <h2 className="font-semibold mb-2">Reviews</h2>
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <img
                src="https://placeholder.com/32x32"
                alt="User avatar"
                className="w-8 h-8 rounded-full"
              />
              <div>
                <p className="font-medium">Laura Nielsen</p>
                <p className="text-sm text-gray-600">
                  What makes The Goldfinch so compelling is Tartt's
                  perspective...
                </p>
              </div>
            </div>
            {/* Add more reviews here */}
          </div>
        </div>
      </main>
    </div>
  );
}
