import type { Route } from "./+types/home";
import type { Book as BookType } from "~/types/book";
import * as AuthService from "~/services/auth.server";
import Book from "~/models/Book";
import { BookCard } from "~/components/books/BookCard";
import { EmptyState } from "~/components/ui/EmptyState";
import { Link, useLoaderData, useSearchParams, useSubmit } from "react-router";
import { BookFilter } from "~/components/filters/BookFilter";
import {
  buildBookQuery,
  formatBookDocuments,
  type SortOption,
} from "~/utils/bookFilters";
import { BookOfTheWeek } from "~/components/books/BookOfTheWeek";

/*===============================================
=          Types          =
===============================================*/

interface LoaderData {
  books: BookType[];
  genres: string[];
  bookOfTheWeek: BookType | null;
  currentFilters: {
    genre: string;
    sortBy: SortOption;
    search: string;
  };
}

/*===============================================
=          Data Loading          =
===============================================*/

export async function loader({ request }: Route.LoaderArgs) {
  await AuthService.requireAuth(request);

  try {
    const url = new URL(request.url);
    const filterOptions = {
      selectedGenre: url.searchParams.get("genre") || "",
      sortBy: (url.searchParams.get("sort-by") || "createdAt") as SortOption,
      searchQuery: url.searchParams.get("q") || "",
    };

    // Calculate date range for past week
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    // Find book of the week based on review popularity
    const booksWithReviews = await Book.aggregate([
      {
        $lookup: {
          from: "bookreviews", // Collection name for reviews
          localField: "_id",
          foreignField: "bookId",
          as: "allReviews",
        },
      },
      {
        $addFields: {
          weeklyReviews: {
            $filter: {
              input: "$allReviews",
              as: "review",
              cond: { $gte: ["$$review.createdAt", oneWeekAgo] },
            },
          },
        },
      },
      {
        $addFields: {
          reviewCount: { $size: "$weeklyReviews" },
          averageRating: { $avg: "$weeklyReviews.rating" },
        },
      },
      {
        $match: {
          reviewCount: { $gt: 0 }, // Only include books with reviews
        },
      },
      {
        $sort: {
          reviewCount: -1, // Sort by number of reviews
        },
      },
      {
        $limit: 1,
      },
    ]);

    const bookOfTheWeek =
      booksWithReviews.length > 0
        ? formatBookDocuments(booksWithReviews)[0]
        : null;

    // Build query using our utility function for regular book listing
    const { query, sort } = buildBookQuery(filterOptions);

    // Fetch filtered and sorted books
    const books = await Book.find(query).sort(sort).lean();

    // Get unique genres for filter dropdown
    const allGenres = await Book.distinct("genres");

    return {
      books: formatBookDocuments(books),
      genres: allGenres,
      bookOfTheWeek,
      currentFilters: {
        genre: filterOptions.selectedGenre,
        sortBy: filterOptions.sortBy,
        search: filterOptions.searchQuery,
      },
    };
  } catch (error) {
    console.error("Error fetching books:", error);
    return {
      books: [],
      genres: [],
      bookOfTheWeek: null,
      currentFilters: {
        genre: "",
        sortBy: "createdAt" as SortOption,
        search: "",
      },
    };
  }
}

/*===============================================
=          Component Definition          =
===============================================*/

export default function Home() {
  const { books, genres, bookOfTheWeek, currentFilters } =
    useLoaderData<LoaderData>();
  const [searchParams, setSearchParams] = useSearchParams();
  const submit = useSubmit();

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
    <div className="max-w-4xl mx-auto p-6 ">
      <img
        src="/logo.png"
        alt="Book of the Week"
        className="w-[150px] h-auto mx-auto"
      />

      <h1 className="headline font-bold mb-6">Book of the week</h1>
      <BookOfTheWeek book={bookOfTheWeek} />
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
        className="mb-8"
      />

      {/* Book results */}
      <div>
        <h2 className="headline py-5">Look for your next favorite book</h2>
      </div>
      {books.length === 0 ? (
        <EmptyState
          title="No books found"
          message="Try adjusting your search or filter criteria."
        />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-6">
          {books.map((book: BookType) => (
            <Link to={`/books/${book._id}`} key={book._id}>
              <BookCard book={book} />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
