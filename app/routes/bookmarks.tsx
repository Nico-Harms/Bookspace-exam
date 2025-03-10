import * as AuthService from "~/services/auth.server";
import type { Route } from "./+types/home";
import { Link, useLoaderData, useSearchParams } from "react-router";
import User from "~/models/User";
import Book from "~/models/Book";
import type { Book as BookType } from "~/types/book";
import { BookRating } from "~/components/books/BookRating";
import { BookFilter } from "~/components/filters/BookFilter";
import {
  buildBookQuery,
  formatBookDocuments,
  type SortOption,
} from "~/utils/bookFilters";

/*===============================================
=          Types          =
===============================================*/

interface LoaderData {
  user: {
    _id: string;
    name: string;
    email: string;
    bookmarks: string[];
  };
  books: BookType[];
  genres: string[];
  currentFilters: {
    genre: string;
    sortBy: SortOption;
    search: string;
  };
  error?: string;
}

function EmptyState() {
  return (
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
      return {
        user,
        books: [],
        genres: [],
        currentFilters: {
          genre: "",
          sortBy: "createdAt" as SortOption,
          search: "",
        },
      };
    }

    // Get filter options from URL
    const url = new URL(request.url);
    const filterOptions = {
      selectedGenre: url.searchParams.get("genre") || "",
      sortBy: (url.searchParams.get("sort-by") || "createdAt") as SortOption,
      searchQuery: url.searchParams.get("q") || "",
    };

    // Build query using our utility function
    const { query, sort } = buildBookQuery(filterOptions);

    // Add bookmarks filter to the query
    query._id = { $in: user.bookmarks };

    // Fetch the filtered and sorted bookmarked books
    const books = await Book.find(query).sort(sort).lean();

    // Get unique genres from bookmarked books
    const genres = [
      ...new Set(books.flatMap((book) => book.genres || [])),
    ].sort();

    return {
      user,
      books: formatBookDocuments(books),
      genres,
      currentFilters: {
        genre: filterOptions.selectedGenre,
        sortBy: filterOptions.sortBy,
        search: filterOptions.searchQuery,
      },
    };
  } catch (error) {
    console.error("Error fetching bookmarks:", error);
    return {
      user: authUser,
      books: [],
      genres: [],
      currentFilters: {
        genre: "",
        sortBy: "createdAt" as SortOption,
        search: "",
      },
      error: "Failed to load bookmarks",
    };
  }
}

/*===============================================
=          Component Definition          =
===============================================*/

export default function Bookmarks() {
  const { books, genres, currentFilters, error } = useLoaderData<LoaderData>();
  const [searchParams, setSearchParams] = useSearchParams();

  // Handle filter changes
  const handleGenreChange = (genre: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (genre) {
      newParams.set("genre", genre);
    } else {
      newParams.delete("genre");
    }
    setSearchParams(newParams);
  };

  const handleSortChange = (sort: SortOption) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set("sort-by", sort);
    setSearchParams(newParams);
  };

  const handleSearchChange = (query: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (query) {
      newParams.set("q", query);
    } else {
      newParams.delete("q");
    }
    setSearchParams(newParams);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Your Reading List</h1>
        <p className="text-gray-600">
          {books.length} {books.length === 1 ? "book" : "books"} saved for later
        </p>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {/* Filter Section */}
      <BookFilter
        genres={genres}
        selectedGenre={currentFilters.genre}
        onGenreChange={handleGenreChange}
        sortBy={currentFilters.sortBy}
        onSortChange={handleSortChange}
        showSearch={true}
        searchQuery={currentFilters.search}
        onSearchChange={handleSearchChange}
        className="mb-6"
      />

      {/* Bookmarks List */}
      {books.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-4">
          {books.map((book) => (
            <Link
              key={book._id}
              to={`/books/${book._id}`}
              className="block bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200"
            >
              <div className="flex p-4 gap-4 max-h-[180px]">
                {/* Book Cover */}
                <div className="flex-shrink-0 w-[90px] h-[135px] bg-gray-100 rounded-md overflow-hidden">
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
                <div className="flex-1 min-w-0 flex flex-col justify-between h-[135px]">
                  <div>
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-medium text-gray-900 truncate">
                          {book.title}
                        </h3>
                        <p className="text-sm text-gray-600 truncate">
                          {book.author?.join(", ") || "Unknown Author"}
                        </p>
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
                    <BookRating
                      rating={book.rating}
                      ratingsCount={book.ratingsCount}
                    />

                    {/* Book Metadata */}
                    <div className="flex items-center gap-3 text-sm text-gray-500 mt-2">
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
                          {book.pageCount}
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
                  </div>

                  {/* Genres */}
                  {book.genres && book.genres.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-auto">
                      {book.genres.slice(0, 3).map((genre, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700"
                        >
                          {genre}
                        </span>
                      ))}
                      {book.genres.length > 3 && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-50 text-gray-600">
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
      )}
    </div>
  );
}

/*===============================================
=          Section comment block           =
===============================================*/
