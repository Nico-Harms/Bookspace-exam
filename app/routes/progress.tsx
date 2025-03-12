import { Link, useLoaderData } from "react-router";
import type { LoaderFunctionArgs } from "react-router";
import * as AuthService from "~/services/auth.server";
import UserBookProgress, { ReadingStatus } from "~/models/UserBookProgress";
import Book from "~/models/Book";
import type { Book as BookType } from "~/types/book";
import User from "~/models/User";
import { StatsCard } from "~/components/progress/StatsCard";
import { ProgressBookCard } from "~/components/progress/ProgressBookCard";

type LoaderData = {
  stats: {
    totalPagesRead: number;
    totalReadingMinutes: number;
    totalReadingHours: number;
    averageReadingSpeed: number;
    currentStreak: number;
    booksCompletedTotal: number;
  };
  collections: {
    wantToRead: Array<BookType & { progress?: any }>;
    reading: Array<BookType & { progress?: any }>;
    completed: Array<BookType & { progress?: any }>;
  };
};

export async function loader({ request }: LoaderFunctionArgs) {
  const auth = await AuthService.requireAuth(request);

  // Get all user's reading progress
  const allProgress = await UserBookProgress.find({ userId: auth._id }).lean();

  // Get the user's bookmarked books
  const user = await User.findById(auth._id).lean();
  const bookmarkIds = user?.bookmarks || [];

  // Fetch all bookmarked books
  const books = await Book.find({
    _id: { $in: bookmarkIds },
  }).lean();

  // Convert MongoDB documents to plain objects with string IDs
  const formattedBooks = books.map((book) => ({
    ...book,
    _id: String(book._id),
  }));

  // Organize books by reading status
  const collections = {
    wantToRead: [] as Array<BookType & { progress?: any }>,
    reading: [] as Array<BookType & { progress?: any }>,
    completed: [] as Array<BookType & { progress?: any }>,
  };

  /*===============================================
=          Book categories for its state            =
===============================================*/
  formattedBooks.forEach((book) => {
    const progress = allProgress.find(
      (p) => String(p.bookId) === String(book._id),
    );

    if (progress) {
      const bookWithProgress = {
        ...book,
        progress,
      };

      switch (progress.status) {
        case ReadingStatus.WANT_TO_READ:
          collections.wantToRead.push(bookWithProgress);
          break;
        case ReadingStatus.READING:
          collections.reading.push(bookWithProgress);
          break;
        case ReadingStatus.COMPLETED:
          collections.completed.push(bookWithProgress);
          break;
      }
    } else {
      // If no progress exists, default to "Want to Read"
      collections.wantToRead.push({ ...book, progress: null });
    }
  });

  // Calculate stats
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  /*===============================================
  =    Famcy pancy calucations for total reading time (2 minutes per page)           =
  ===============================================*/

  const totalPagesRead = allProgress.reduce(
    (sum, p) => sum + (p.pagesRead || 0),
    0,
  );
  const totalReadingMinutes = totalPagesRead * 2; // Standard estimate of 2 minutes per page
  const totalReadingHours = totalReadingMinutes / 60;

  // Calculate average reading speed (pages per hour)
  const averageReadingSpeed =
    totalReadingHours > 0 ? Math.round(totalPagesRead / totalReadingHours) : 0;

  const stats = {
    totalPagesRead,
    totalReadingMinutes,
    totalReadingHours,
    averageReadingSpeed,
    currentStreak: calculateStreak(allProgress),

    booksCompletedTotal: collections.completed.length, // Use the collection length which should be accurate
  };

  return { stats, collections };
}

/*===============================================
=          Streak calucations / stats           =
===============================================*/

function calculateStreak(progress: any[]): number {
  const dates = progress
    .map((p) => p.lastReadDate)
    .filter((date): date is Date => date !== null)
    .sort((a, b) => b.getTime() - a.getTime());

  if (dates.length === 0) return 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const lastRead = new Date(dates[0]);
  lastRead.setHours(0, 0, 0, 0);

  // If last read date is not today or yesterday, streak is broken
  if (lastRead < today && lastRead < new Date(today.getTime() - 86400000)) {
    return 0;
  }

  let streak = 1;
  for (let i = 1; i < dates.length; i++) {
    const current = new Date(dates[i]);
    const prev = new Date(dates[i - 1]);
    current.setHours(0, 0, 0, 0);
    prev.setHours(0, 0, 0, 0);

    // Check if dates are consecutive
    if (current.getTime() === prev.getTime() - 86400000) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

function BookList({
  title,
  books,
}: {
  title: string;
  books: Array<BookType & { progress?: any }>;
}) {
  if (books.length === 0) return null;

  return (
    <section className="mt-8">
      <h2 className="text-xl font-bold mb-4">{title}</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {books.map((book) => (
          <ProgressBookCard key={book._id} book={book} />
        ))}
      </div>
    </section>
  );
}

export default function Progress() {
  const { stats, collections } = useLoaderData<LoaderData>();

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Reading Progress</h1>

      {/* Reading Statistics */}
      <section>
        <h2 className="text-lg font-semibold mb-3">Reading Statistics</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatsCard
            title="Total Pages Read"
            value={stats.totalPagesRead}
            unit="pages"
          />
          <StatsCard
            title="Reading Time"
            value={Math.round(stats.totalReadingHours * 10) / 10}
            unit="hours"
          />
          <StatsCard
            title="Reading Speed"
            value={stats.averageReadingSpeed}
            unit="pgs/hr"
          />
          <StatsCard
            title="Books Completed"
            value={stats.booksCompletedTotal}
            unit={stats.booksCompletedTotal === 1 ? "book" : "books"}
          />
        </div>
      </section>

      {/* Book Collections */}
      <div className="mt-8">
        {collections.reading.length > 0 && (
          <BookList title="Currently Reading" books={collections.reading} />
        )}
        {collections.wantToRead.length > 0 && (
          <BookList title="Want to Read" books={collections.wantToRead} />
        )}
        {collections.completed.length > 0 && (
          <BookList title="Completed Books" books={collections.completed} />
        )}

        {collections.reading.length === 0 &&
          collections.wantToRead.length === 0 &&
          collections.completed.length === 0 && (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-medium text-gray-600 mb-2">
                No books in your collection yet
              </h3>
              <p className="text-gray-500 mb-4">
                Explore the library and add books to your reading list
              </p>
              <Link
                to="/"
                className="inline-block px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Explore Books
              </Link>
            </div>
          )}
      </div>
    </div>
  );
}
