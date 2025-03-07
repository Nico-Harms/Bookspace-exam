import type { Route } from "./+types/home";
import type { Book as BookType } from "~/types/book";
import * as AuthService from "~/services/auth.server";
import Book from "~/models/Book";
import { BookCard } from "~/components/books/BookCard";
import { EmptyState } from "~/components/ui/EmptyState";
import { Link } from "react-router";

// Loader
export async function loader({ request }: Route.LoaderArgs) {
  const user = await AuthService.requireAuth(request);
  const books = (await Book.find().lean()) as unknown as BookType[];

  return {
    user,
    books: books.map((book) => ({
      ...book,
      _id: String(book._id),
    })),
  };
}

// Main Component
export default function Home({ loaderData }: Route.ComponentProps) {
  const { books = [] } = loaderData;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Our Books</h1>

      {books.length > 0 ? (
        <div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-4 auto-rows-[1fr]">
          {books.map((book) => (
            <Link to={`/books/${book._id}`} key={String(book._id)}>
              <BookCard book={book as BookType} />
            </Link>
          ))}
        </div>
      ) : (
        <EmptyState />
      )}
    </div>
  );
}
