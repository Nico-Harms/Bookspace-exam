import { useLoaderData, Form } from "react-router";
import type { LoaderFunctionArgs, ActionFunctionArgs } from "react-router";
import Book from "~/models/Book";
import UserBookProgress, { ReadingStatus } from "~/models/UserBookProgress";
import * as AuthService from "~/services/auth.server";
import { Types } from "mongoose";
import { useState } from "react";

// This page expects a route parameter: /progress/:id
export async function loader({ params, request }: LoaderFunctionArgs) {
  try {
    const auth = await AuthService.requireAuth(request);

    // Extract ID from the URL parameter
    const bookId = params.id;

    if (!bookId) {
      throw new Response("Book ID is required", { status: 400 });
    }

    const book = await Book.findById(bookId).lean();

    if (!book) {
      throw new Response("Book not found", { status: 404 });
    }

    // Convert IDs to ObjectIds to ensure proper Mongoose query
    const userId = new Types.ObjectId(auth._id);
    const bookObjectId = new Types.ObjectId(bookId);

    // Query for progress with proper ObjectIds
    const progress = await UserBookProgress.findOne({
      userId: userId,
      bookId: bookObjectId,
    }).lean();

    // Format data for client
    return {
      book: {
        ...book,
        _id: String(book._id),
      },
      progress: progress
        ? {
            ...progress,
            _id: String(progress._id),
            // Don't convert userId and bookId to strings
          }
        : null,
    };
  } catch (error) {
    console.error("Error in progress-single loader:", error);
    throw new Response("An error occurred loading the book progress", {
      status: 500,
    });
  }
}

export async function action({ request, params }: ActionFunctionArgs) {
  try {
    const auth = await AuthService.requireAuth(request);
    const bookId = params.id;

    if (!bookId) {
      throw new Response("Book ID is required", { status: 400 });
    }

    const formData = await request.formData();
    const status = formData.get("status") as ReadingStatus;
    const pagesRead = Number(formData.get("pagesRead") || 0);
    const readingMinutes = Number(formData.get("readingMinutes") || 0);
    const notes = (formData.get("notes") as string) || "";

    // Ensure we're using ObjectIds
    const userId = new Types.ObjectId(auth._id);
    const bookObjectId = new Types.ObjectId(bookId);

    // Find existing progress
    let progress = await UserBookProgress.findOne({
      userId: userId,
      bookId: bookObjectId,
    });

    const now = new Date();
    const updateData: {
      status: ReadingStatus;
      pagesRead: number;
      readingMinutes: number;
      notes: string;
      lastReadDate: Date;
      startDate: Date | null;
      completionDate: Date | null;
    } = {
      status,
      pagesRead,
      readingMinutes,
      notes,
      lastReadDate: now,
      startDate: null,
      completionDate: null,
    };

    // Set appropriate dates based on status
    if (status === ReadingStatus.READING && !progress?.startDate) {
      updateData.startDate = now;
    }

    if (status === ReadingStatus.COMPLETED && !progress?.completionDate) {
      updateData.completionDate = now;
    }

    if (progress) {
      // Update existing progress
      await UserBookProgress.updateOne({ _id: progress._id }, updateData);
    } else {
      // Create new progress record
      const newProgress = new UserBookProgress({
        userId: userId,
        bookId: bookObjectId,
        ...updateData,
      });
      await newProgress.save();
    }

    return { success: true };
  } catch (error) {
    console.error("Error in progress-single action:", error);
    return { error: "Failed to update progress" };
  }
}

export default function ProgressSingle() {
  const { book, progress } = useLoaderData<typeof loader>();
  const [selectedStatus, setSelectedStatus] = useState(
    progress?.status || ReadingStatus.WANT_TO_READ,
  );

  // Handle status change to update UI accordingly
  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedStatus(e.target.value as ReadingStatus);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Book Information */}
        <div className="flex flex-col items-center md:w-1/3">
          <h1 className="text-2xl font-bold text-center">{book.title}</h1>
          <p className="text-sm text-gray-500 mb-4">
            {book.author?.join(", ") || "Unknown Author"}
          </p>
          <div className="w-48 h-64 mb-4">
            {book.coverImage?.url ? (
              <img
                src={book.coverImage.url}
                alt={book.title}
                className="w-full h-full object-cover rounded-md shadow-md"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-200 rounded-md">
                <span className="text-gray-500">No Cover</span>
              </div>
            )}
          </div>

          {/* Book Details */}
          <div className="w-full mt-4 space-y-2">
            {book.genres && book.genres.length > 0 && (
              <div>
                <p className="text-sm font-semibold">Genres:</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {book.genres.map((genre, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-gray-100 rounded-full text-xs"
                    >
                      {genre}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {book.pageCount && (
              <p className="text-sm">
                <span className="font-semibold">Pages:</span> {book.pageCount}
              </p>
            )}
            {book.releaseYear && (
              <p className="text-sm">
                <span className="font-semibold">Published:</span>{" "}
                {book.releaseYear}
              </p>
            )}
          </div>
        </div>

        {/* Progress Form */}
        <div className="md:w-2/3">
          <h2 className="text-xl font-semibold mb-4">
            Update Reading Progress
          </h2>
          <Form method="post" className="space-y-6">
            {/* Reading Status */}
            <div>
              <label
                htmlFor="status"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Reading Status
              </label>
              <select
                id="status"
                name="status"
                value={selectedStatus}
                onChange={handleStatusChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value={ReadingStatus.WANT_TO_READ}>Want to Read</option>
                <option value={ReadingStatus.READING}>Currently Reading</option>
                <option value={ReadingStatus.COMPLETED}>Completed</option>
              </select>
            </div>

            {/* Pages Read */}
            <div>
              <label
                htmlFor="pagesRead"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Pages Read
              </label>
              <div className="flex items-center">
                <input
                  type="number"
                  id="pagesRead"
                  name="pagesRead"
                  min="0"
                  max={book.pageCount || 9999}
                  defaultValue={progress?.pagesRead || 0}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                />
                {book.pageCount && (
                  <span className="ml-2 text-sm text-gray-500">
                    of {book.pageCount}
                  </span>
                )}
              </div>
            </div>

            {/* Reading Minutes */}
            <div>
              <label
                htmlFor="readingMinutes"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Total Reading Time (minutes)
              </label>
              <input
                type="number"
                id="readingMinutes"
                name="readingMinutes"
                min="0"
                defaultValue={progress?.readingMinutes || 0}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            {/* Notes */}
            <div>
              <label
                htmlFor="notes"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Notes
              </label>
              <textarea
                id="notes"
                name="notes"
                rows={4}
                defaultValue={progress?.notes || ""}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            {/* Progress Information */}
            {progress && (
              <div className="bg-gray-50 p-4 rounded-md text-sm">
                {progress.startDate && (
                  <p>
                    <span className="font-semibold">Started:</span>{" "}
                    {new Date(progress.startDate).toLocaleDateString()}
                  </p>
                )}
                {progress.completionDate && (
                  <p>
                    <span className="font-semibold">Completed:</span>{" "}
                    {new Date(progress.completionDate).toLocaleDateString()}
                  </p>
                )}
                {progress.lastReadDate && (
                  <p>
                    <span className="font-semibold">Last Read:</span>{" "}
                    {new Date(progress.lastReadDate).toLocaleDateString()}
                  </p>
                )}
              </div>
            )}

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                Save Progress
              </button>
            </div>
          </Form>

          {/* Back to Progress Link */}
          <div className="mt-6 text-center">
            <a
              href="/progress"
              className="text-indigo-600 hover:text-indigo-800"
            >
              ← Back to All Books
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
