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
    query.genres = { $in: [filterGenre] };
  }

  // Fetch books based on search criteria and sorting
  const books = await Book.find(query).sort(sortOption).lean();

  // Fetch unique genres from books for filter dropdown
  const uniqueGenres = await Book.aggregate([
    { $unwind: "$genres" }, // Unwind genres array to get individual genres
    { $group: { _id: "$genres" } }, // Group by genre to remove duplicates
    { $sort: { _id: 1 } }, // Sort genres alphabetically
    { $project: { genre: "$_id", _id: 0 } }, // Project only genre field
  ]);

  // Extract just the genres from the results
  const genres = uniqueGenres.map((genreDoc) => genreDoc.genre);

  return {
    user,
    books: books.map((book) => ({
      ...book,
      _id: String(book._id),
    })),
    genres,
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
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Our Books</h1>

      {/* Search and filter form */}
      <Form
        method="get"
        onChange={handleChange}
        className="mb-6 flex flex-wrap gap-3"
      >
        <div className="flex-1 min-w-[280px]">
          <input
            type="text"
            name="q"
            placeholder="Search by title or author..."
            defaultValue={q}
            className="w-full p-2 border rounded-lg"
          />
        </div>

        <select
          name="genre"
          defaultValue={filterGenre}
          className="p-2 border rounded-lg"
        >
          <option value="">All Genres</option>
          {genres.map((genre: string) => (
            <option key={genre} value={genre}>
              {genre}
            </option>
          ))}
        </select>

        <select
          name="sort-by"
          defaultValue={sortBy}
          className="p-2 border rounded-lg"
        >
          <option value="createdAt">Newest First</option>
          <option value="title">Alphabetical (A-Z)</option>
          <option value="rating">Highest Rated</option>
          <option value="releaseYear">Release Year</option>
        </select>
      </Form>

      {books.length > 0 ? (
        <div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-4 auto-rows-[1fr]">
          {books.map((book) => (
            <Link to={`/books/${book._id}`} key={String(book._id)}>
              <BookCard book={book as BookType} />
            </Link>
          ))}
        </div>
      ) : (
        <EmptyState message="No books found matching your search criteria." />
      )}
    </div>
  );
}
