import type { Book as BookType } from "~/types/book";
import type { FilterQuery, SortOrder } from "mongoose";
import Book from "~/models/Book";

export type SortOption = "createdAt" | "title" | "rating";

export interface FilterOptions {
  selectedGenre: string;
  sortBy: SortOption;
  searchQuery: string;
}

export function buildBookQuery(options: FilterOptions): {
  query: FilterQuery<typeof Book>;
  sort: { [key: string]: SortOrder };
} {
  const query: FilterQuery<typeof Book> = {};

  // Add genre filter if provided
  if (options.selectedGenre) {
    query.genres = options.selectedGenre;
  }

  // Add search filter if provided
  if (options.searchQuery) {
    query.$or = [
      { title: { $regex: options.searchQuery, $options: "i" } },
      { author: { $regex: options.searchQuery, $options: "i" } },
    ];
  }

  // Define sort options
  const sort: { [key: string]: SortOrder } = {};
  switch (options.sortBy) {
    case "title":
      sort.title = 1; // Ascending for alphabetical
      break;
    case "rating":
      sort.rating = -1; // Descending for rating
      break;
    case "createdAt":
    default:
      sort.createdAt = -1; // Descending for newest first
      break;
  }

  return { query, sort };
}

// Helper function to format MongoDB documents
export function formatBookDocuments(books: any[]): BookType[] {
  return books.map((book) => ({
    ...book,
    _id: String(book._id),
  }));
}

export function filterAndSortBooks(
  books: BookType[],
  options: FilterOptions,
): BookType[] {
  let filteredBooks = [...books];

  // Apply genre filter
  if (options.selectedGenre) {
    filteredBooks = filteredBooks.filter((book) =>
      book.genres?.includes(options.selectedGenre),
    );
  }

  // Apply search filter if provided
  if (options.searchQuery) {
    const query = options.searchQuery.toLowerCase();
    filteredBooks = filteredBooks.filter(
      (book) =>
        book.title.toLowerCase().includes(query) ||
        book.author?.some((author) => author.toLowerCase().includes(query)),
    );
  }

  // Apply sorting
  switch (options.sortBy) {
    case "title":
      filteredBooks.sort((a, b) => a.title.localeCompare(b.title));
      break;
    case "rating":
      filteredBooks.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      break;
    case "createdAt":
    default:
      // Assuming books are already sorted by recent in the database
      break;
  }

  return filteredBooks;
}

export function extractUniqueGenres(books: BookType[]): string[] {
  return [...new Set(books.flatMap((book) => book.genres || []))].sort();
}
