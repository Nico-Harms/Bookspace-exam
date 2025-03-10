import * as AuthService from "~/services/auth.server";
import type { Route } from "./+types/home";
import { Link } from "react-router";
import User from "~/models/User";
import Book from "~/models/Book";
import type { Book as BookType } from "~/types/book";
import { useLoaderData } from "react-router";
import { useState } from "react";

/*===============================================
=          Helper Functions          =
===============================================*/

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`w-4 h-4 ${
            star <= Math.round(rating) ? "text-yellow-400" : "text-gray-300"
          }`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

/*===============================================
=          Data Loading Functions          =
===============================================*/

export async function loader({ request }: Route.LoaderArgs) {
  const authUser = await AuthService.requireAuth(request);

  try {
    const user = await User.findById(authUser._id).lean();

    if (!user || !user.bookmarks || user.bookmarks.length === 0) {
      return { user, bookmarks: [], genres: [] };
    }

    // Fetch the actual book documents for the bookmarked books
    const bookmarks = await Book.find({
      _id: { $in: user.bookmarks },
    })
      .sort({ createdAt: -1 }) // Sort by most recently added
      .lean();

    // Get unique genres from bookmarked books
    const genres = [...new Set(bookmarks.flatMap((book) => book.genres || []))];

    // Convert to plain objects with string IDs
    const formattedBookmarks = bookmarks.map((book) => ({
      ...book,
      _id: String(book._id),
    }));

    return { user, bookmarks: formattedBookmarks, genres };
  } catch (error) {
    console.error("Error fetching bookmarks:", error);
    return {
      user: authUser,
      bookmarks: [],
      genres: [],
      error: "Failed to load bookmarks",
    };
  }
}

/*===============================================
=          Component Definition          =
===============================================*/

export default function Bookmarks() {
  const {
    bookmarks = [],
    genres = [],
    error,
  } = useLoaderData<{
    user: any;
    bookmarks: BookType[];
    genres: string[];
    error?: string;
  }>();

  const [selectedGenre, setSelectedGenre] = useState<string>("");
  const [sortBy, setSortBy] = useState<"recent" | "title">("recent");

  /*===============================================
  =          Filter & Sort Functions          =
  ===============================================*/

  const filteredAndSortedBookmarks = selectedGenre
    ? bookmarks
        .filter((book) => book.genres?.includes(selectedGenre))
        .sort((a, b) => {
          if (sortBy === "title") {
            return a.title.localeCompare(b.title);
          }
          return 0; // Keep original order for "recent"
        })
    : bookmarks.sort((a, b) => {
        if (sortBy === "title") {
          return a.title.localeCompare(b.title);
        }
        return 0; // Keep original order for "recent"
      });

  /*===============================================
  =          Render Functions          =
  ===============================================*/

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Your Reading List</h1>
        <p className="text-gray-600">
          {bookmarks.length} {bookmarks.length === 1 ? "book" : "books"} saved
          for later
        </p>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {/* Filter and Sort Section */}
      {genres.length > 0 && (
        <div className="mb-6 flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <label
              htmlFor="genre-filter"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Filter by Genre
            </label>
            <select
              id="genre-filter"
              value={selectedGenre}
              onChange={(e) => setSelectedGenre(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">All Genres</option>
              {genres.map((genre) => (
                <option key={genre} value={genre}>
                  {genre}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1 min-w-[200px]">
            <label
              htmlFor="sort-by"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Sort by
            </label>
            <select
              id="sort-by"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "recent" | "title")}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="recent">Recently Added</option>
              <option value="title">Title</option>
            </select>
          </div>
        </div>
      )}

      {/* Bookmarks List */}
      {filteredAndSortedBookmarks.length > 0 ? (
        <div className="space-y-4">
          {filteredAndSortedBookmarks.map((book) => (
            <Link
              key={book._id}
              to={`/books/${book._id}`}
              className="block bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200"
            >
              <div className="flex p-4 gap-4">
                {/* Book Cover */}
                <div className="flex-shrink-0 w-24 h-36 bg-gray-100 rounded-md overflow-hidden">
                  {book.coverImage?.url ? (
                    <img
                      src={book.coverImage.url}
                      alt={`Cover of ${book.title}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-gray-400 text-sm">No Cover</span>
                    </div>
                  )}
                </div>

                {/* Book Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-1">
                        {book.title}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">
                        {book.author?.join(", ") || "Unknown Author"}
                      </p>
                      {/* Rating Section */}
                      {book.rating && (
                        <div className="flex items-center gap-2 mb-2">
                          <StarRating rating={book.rating} />
                          <span className="text-sm text-gray-600">
                            {book.rating.toFixed(1)}
                            {book.ratingsCount && (
                              <span className="text-gray-400 ml-1">
                                ({book.ratingsCount})
                              </span>
                            )}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="ml-4 flex-shrink-0">
                      <svg
                        className="w-5 h-5 text-indigo-500"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
                      </svg>
                    </div>
                  </div>

                  {/* Book Metadata */}
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-gray-500">
                    {book.pageCount && (
                      <span className="flex items-center">
                        <svg
                          className="w-4 h-4 mr-1"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                          />
                        </svg>
                        {book.pageCount} pages
                      </span>
                    )}
                    {book.releaseYear && (
                      <span className="flex items-center">
                        <svg
                          className="w-4 h-4 mr-1"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        {book.releaseYear}
                      </span>
                    )}
                  </div>

                  {/* Genres */}
                  {book.genres && book.genres.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {book.genres.slice(0, 3).map((genre, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700"
                        >
                          {genre}
                        </span>
                      ))}
                      {book.genres.length > 3 && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-50 text-gray-600">
                          +{book.genres.length - 3} more
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="mb-4">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
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
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No bookmarks yet
          </h3>
          <p className="text-gray-600 mb-4">
            Start exploring books and save your favorites for later.
          </p>
          <Link
            to="/"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Discover Books
          </Link>
        </div>
      )}
    </div>
  );
}

/*===============================================
=          Section comment block           =
===============================================*/
