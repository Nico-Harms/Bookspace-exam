import type { Route } from "./+types/home";
import type { Book as BookType } from "~/types/book";
import * as AuthService from "~/services/auth.server";
import Book from "~/models/Book";
import { BookCard } from "~/components/books/BookCard";
import { EmptyState } from "~/components/ui/EmptyState";
import { Link, Form, useSubmit } from "react-router";
import type { SortOrder } from "mongoose";

// Loader
export async function loader({ request }: Route.LoaderArgs) {
  const user = await AuthService.requireAuth(request);

  /*===============================================
 =          Search and filter function           =
 ===============================================*/

  const url = new URL(request.url);
  const q = url.searchParams.get("q") || "";
  const sortBy = url.searchParams.get("sort-by") || "createdAt";
  const filterGenre = url.searchParams.get("genre") || "";

  // Define sorting option based on query parameter
  const sortOption: { [key: string]: SortOrder } = {
    [sortBy]: sortBy === "title" ? 1 : -1, // Alphabetical for title, newest first for others
  };

  // Construct query for case-insensitive search by title or author
  const query: any = {};

  // Add search term if provided
  if (q) {
    query.$or = [
      { title: { $regex: q, $options: "i" } },
      { author: { $regex: q, $options: "i" } },
    ];
  }

  // Add genre filter if provided
  if (filterGenre) {
    query.genres = filterGenre;
  }

  // Fetch books with search and filtering
  const books = await Book.find(query).sort(sortOption).lean();

  // Convert MongoDB documents to plain objects with string IDs
  const formattedBooks = books.map((book) => ({
    ...book,
    _id: String(book._id),
  }));

  // Get unique genres for filter dropdown
  const allGenres = await Book.distinct("genres");

  return {
    books: formattedBooks,
    genres: allGenres,
    q,
    sortBy,
    filterGenre,
  };
}

/*===============================================
=          Main component           =
===============================================*/

export default function Home({ loaderData }: Route.ComponentProps) {
  const {
    books = [],
    genres = [],
    q = "",
    sortBy = "createdAt",
    filterGenre = "",
  } = loaderData;
  const submit = useSubmit();

  // Function to handle form changes and auto-submit
  const handleChange = (event: React.ChangeEvent<HTMLFormElement>) => {
    submit(event.currentTarget);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Our Books</h1>

      {/* Search and filter form */}
      <Form method="get" onChange={handleChange} className="mb-8">
        <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
          <div className="flex-1">
            <input
              type="text"
              name="q"
              placeholder="Search books by title or author..."
              defaultValue={q}
              className="w-full px-4 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div className="flex space-x-4">
            <select
              name="genre"
              defaultValue={filterGenre}
              className="px-4 py-2 border border-gray-300 rounded-md"
            >
              <option value="">All Genres</option>
              {genres.map((genre) => (
                <option key={genre} value={genre}>
                  {genre}
                </option>
              ))}
            </select>
            <select
              name="sort-by"
              defaultValue={sortBy}
              className="px-4 py-2 border border-gray-300 rounded-md"
            >
              <option value="createdAt">Newest</option>
              <option value="title">A-Z</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>
        </div>
      </Form>

      {/* Book results */}
      {books.length === 0 ? (
        <EmptyState
          title="No books found"
          message="Try adjusting your search or filter criteria."
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {books.map((book) => (
            <Link to={`/books/${book._id}`} key={String(book._id)}>
              <BookCard book={book as BookType} />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
