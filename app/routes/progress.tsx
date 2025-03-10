import { Link, useLoaderData } from "react-router";
import type { LoaderFunctionArgs } from "react-router";
import * as AuthService from "~/services/auth.server";
import UserBookProgress, { ReadingStatus } from "~/models/UserBookProgress";
import Book from "~/models/Book";
import type { Book as BookType } from "~/types/book";
import User from "~/models/User";

type LoaderData = {
  stats: {
    totalPagesRead: number;
    totalReadingMinutes: number;
    currentStreak: number;
    booksCompletedThisMonth: number;
  };
  collections: {
    wantToRead: Array<BookType>;
    reading: Array<BookType>;
    completed: Array<BookType>;
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
    wantToRead: [] as Array<BookType>,
    reading: [] as Array<BookType>,
    completed: [] as Array<BookType>,
  };

  // For each book, find its progress and add it to the appropriate collection
  formattedBooks.forEach((book) => {
    const progress = allProgress.find(
      (p) => String(p.bookId) === String(book._id),
    );

    if (progress) {
      switch (progress.status) {
        case ReadingStatus.WANT_TO_READ:
          collections.wantToRead.push(book);
          break;
        case ReadingStatus.READING:
          collections.reading.push(book);
          break;
        case ReadingStatus.COMPLETED:
          collections.completed.push(book);
          break;
      }
    } else {
      // If no progress exists, default to "Want to Read"
      collections.wantToRead.push(book);
    }
  });

  // Calculate stats
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const stats = {
    totalPagesRead: allProgress.reduce((sum, p) => sum + (p.pagesRead || 0), 0),
    totalReadingMinutes: allProgress.reduce(
      (sum, p) => sum + (p.readingMinutes || 0),
      0,
    ),
    currentStreak: calculateStreak(allProgress),
    booksCompletedThisMonth: allProgress.filter(
      (p) =>
        p.status === ReadingStatus.COMPLETED &&
        p.completionDate &&
        p.completionDate >= startOfMonth,
    ).length,
  };

  return { stats, collections };
}

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

function StatsCard({
  title,
  value,
  unit,
}: {
  title: string;
  value: number;
  unit: string;
}) {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="text-sm text-gray-500 mb-1">{title}</h3>
      <div className="flex items-baseline">
        <span className="text-2xl font-bold">{value}</span>
        <span className="ml-1 text-gray-600">{unit}</span>
      </div>
    </div>
  );
}

function BookList({ title, books }: { title: string; books: Array<BookType> }) {
  if (books.length === 0) return null;

  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-4">{title}</h2>
      <div className="space-y-4">
        {books.map((book) => {
          console.log("Book ID:", book._id);
          return (
            <Link
              to={`/progress/${book._id}`}
              key={book._id}
              className="flex items-center p-4 bg-white rounded-lg shadow"
            >
              <div className="flex-shrink-0 w-16 h-24 bg-gray-200 rounded overflow-hidden mr-4">
                {book.coverImage?.url ? (
                  <img
                    src={book.coverImage.url}
                    alt={`Cover of ${book.title}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-200">
                    <span className="text-gray-500 text-xs">No Cover</span>
                  </div>
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-medium">{book.title}</h3>
                <p className="text-sm text-gray-600">
                  {book.author?.join(", ") || "Unknown Author"}
                </p>
                {book.genres && book.genres.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {book.genres.slice(0, 2).map((genre, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-gray-100 rounded-full text-xs"
                      >
                        {genre}
                      </span>
                    ))}
                    {book.genres.length > 2 && (
                      <span className="text-xs text-gray-500">
                        +{book.genres.length - 2} more
                      </span>
                    )}
                  </div>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export default function Progress() {
  const { stats, collections } = useLoaderData<LoaderData>();

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Reading Progress</h1>

      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatsCard
          title="Total Pages Read"
          value={stats.totalPagesRead}
          unit="pages"
        />
        <StatsCard
          title="Reading Time"
          value={Math.round(stats.totalReadingMinutes / 60)}
          unit="hours"
        />
        <StatsCard
          title="Current Streak"
          value={stats.currentStreak}
          unit="days"
        />
        <StatsCard
          title="Completed This Month"
          value={stats.booksCompletedThisMonth}
          unit="books"
        />
      </section>

      <BookList title="Currently Reading" books={collections.reading} />
      <BookList title="Want to Read" books={collections.wantToRead} />
      <BookList title="Completed Books" books={collections.completed} />
    </div>
  );
}
