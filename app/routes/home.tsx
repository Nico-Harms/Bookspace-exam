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

/*===============================================
=          Types          =
===============================================*/

interface LoaderData {
  books: BookType[];
  genres: string[];
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

    // Build query using our utility function
    const { query, sort } = buildBookQuery(filterOptions);

    // Fetch filtered and sorted books
    const books = await Book.find(query).sort(sort).lean();

    // Get unique genres for filter dropdown
    const allGenres = await Book.distinct("genres");

    return {
      books: formatBookDocuments(books),
      genres: allGenres,
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
  const { books, genres, currentFilters } = useLoaderData<LoaderData>();
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
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Our Books</h1>

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
      {books.length === 0 ? (
        <EmptyState
          title="No books found"
          message="Try adjusting your search or filter criteria."
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
