import {
  useLoaderData,
  Form,
  useSubmit,
  useNavigation,
  useActionData,
} from "react-router";
import type { LoaderFunctionArgs, ActionFunctionArgs } from "react-router";
import Book from "~/models/Book";
import UserBookProgress, { ReadingStatus } from "~/models/UserBookProgress";
import * as AuthService from "~/services/auth.server";
import { Types } from "mongoose";
import { useState, useEffect } from "react";
import { Toaster, toast } from "sonner";

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

    console.log("Progress data:", progress);

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
    let pagesRead = Number(formData.get("pagesRead") || 0);
    const notes = (formData.get("notes") as string) || "";

    // Ensure we're using ObjectIds
    const userId = new Types.ObjectId(auth._id);
    const bookObjectId = new Types.ObjectId(bookId);

    // Find existing progress
    let progress = await UserBookProgress.findOne({
      userId: userId,
      bookId: bookObjectId,
    });

    // Get the book to know its total pages
    const book = await Book.findById(bookObjectId);
    if (!book) {
      throw new Response("Book not found", { status: 404 });
    }

    // Store previous values for comparison
    const previousStatus = progress?.status;
    const previousPagesRead = progress?.pagesRead || 0;

    // If status is COMPLETED, set pages read to the book's total pages
    if (status === ReadingStatus.COMPLETED && book.pageCount) {
      pagesRead = book.pageCount;
    }

    // Calculate reading minutes based on pages read
    const readingMinutes = pagesRead * 2; // 2 minutes per page

    const now = new Date();

    // Prepare the update data
    const updateData: {
      status: ReadingStatus;
      pagesRead: number;
      readingMinutes: number;
      notes: string;
      lastReadDate: Date;
      startDate?: Date | null;
      completionDate?: Date | null;
    } = {
      status,
      pagesRead,
      readingMinutes,
      notes,
      lastReadDate: now,
    };

    // Handle start date
    if (status === ReadingStatus.READING) {
      // Only set start date if this is the first time the book is being read
      if (!progress?.startDate) {
        updateData.startDate = now;
      }
    }

    // Handle completion date
    if (status === ReadingStatus.COMPLETED) {
      // Always set completion date when marking as completed
      updateData.completionDate = now;
      console.log("Setting completion date:", now);
    }

    if (progress) {
      // Update existing progress
      console.log("Updating progress with:", updateData);
      await UserBookProgress.updateOne({ _id: progress._id }, updateData);
    } else {
      // Create new progress record
      const newProgress = new UserBookProgress({
        userId: userId,
        bookId: bookObjectId,
        ...updateData,
      });
      console.log("Creating new progress:", newProgress);
      await newProgress.save();
    }

    // Determine what aspects have changed for the success message
    const statusChanged = previousStatus !== status;
    const pagesReadChanged = previousPagesRead !== pagesRead;

    return {
      success: true,
      message: getSuccessMessage(
        status,
        statusChanged,
        pagesReadChanged,
        previousPagesRead,
        pagesRead,
        book.title,
      ),
    };
  } catch (error) {
    console.error("Error in progress-single action:", error);
    return {
      error: "Failed to update progress",
      message:
        "There was an error updating your reading progress. Please try again.",
    };
  }
}

// Helper function to get success message based on reading status and changes
function getSuccessMessage(
  status: ReadingStatus,
  statusChanged: boolean,
  pagesReadChanged: boolean,
  previousPages: number,
  newPages: number,
  bookTitle?: string,
): string {
  // If status changed, prioritize that message
  if (statusChanged) {
    switch (status) {
      case ReadingStatus.COMPLETED:
        return `Congratulations! "${bookTitle}" marked as completed. 🎉`;
      case ReadingStatus.READING:
        return `"${bookTitle}" marked as currently reading. Happy reading! 📚`;
      case ReadingStatus.WANT_TO_READ:
        return `"${bookTitle}" added to your reading list!`;
    }
  }

  // If only pages read changed, create a message about that
  if (pagesReadChanged) {
    const pagesAdded = newPages - previousPages;

    if (pagesAdded > 0) {
      return `Great progress! ${pagesAdded} page${pagesAdded !== 1 ? "s" : ""} added to your reading progress.`;
    } else if (pagesAdded < 0) {
      return `Reading progress updated. Pages read adjusted by ${Math.abs(pagesAdded)}.`;
    }
  }

  // Default message if nothing specific changed
  return "Reading progress updated successfully!";
}

export default function ProgressSingle() {
  const { book, progress } = useLoaderData<typeof loader>();
  const actionData = useActionData<{
    success?: boolean;
    error?: string;
    message?: string;
  }>();
  const [selectedStatus, setSelectedStatus] = useState(
    progress?.status || ReadingStatus.WANT_TO_READ,
  );
  const [pagesRead, setPagesRead] = useState(progress?.pagesRead || 0);
  const [calculatedReadingTime, setCalculatedReadingTime] = useState(0);
  const submit = useSubmit();
  const navigation = useNavigation();

  // Show toast when action data changes
  useEffect(() => {
    if (actionData) {
      if (actionData.success) {
        // Dismiss any loading toasts first
        toast.dismiss();

        // Show success toast with auto-dismiss after 4 seconds
        toast.success(actionData.message || "Progress updated successfully!", {
          duration: 4000,
          className:
            "bg-gradient-to-r from-green-50 to-green-100 border-l-4 border-green-600",
        });
      } else if (actionData.error) {
        // Dismiss any loading toasts first
        toast.dismiss();

        // Show error toast that stays until dismissed
        toast.error(actionData.message || "Failed to update progress", {
          duration: Infinity, // Stay until dismissed
          className:
            "bg-gradient-to-r from-red-50 to-red-100 border-l-4 border-red-600",
        });
      }
    }
  }, [actionData]);

  // Effect to set initial pages read
  useEffect(() => {
    setPagesRead(progress?.pagesRead || 0);
  }, [progress?.pagesRead]);

  // Recalculate reading time whenever pages read changes
  useEffect(() => {
    // Simple formula - 2 minutes per page
    const estimatedMinutes = pagesRead * 2;
    setCalculatedReadingTime(estimatedMinutes);
  }, [pagesRead]);

  // Calculate reading progress percentage for the progress bar
  const readingProgressPercentage = book.pageCount
    ? Math.min(100, Math.round((pagesRead / book.pageCount) * 100))
    : 0;

  // Handle status change to update UI accordingly
  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value as ReadingStatus;
    setSelectedStatus(newStatus);

    // If status is changed to COMPLETED, automatically set pages read to the book's total pages
    if (newStatus === ReadingStatus.COMPLETED && book.pageCount) {
      setPagesRead(book.pageCount);
    }
  };

  // Handle pages read change from slider or number input
  const handlePagesReadChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPagesRead(Number(e.target.value));
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Get the form
    const form = e.currentTarget;

    // Create FormData
    const formData = new FormData(form);
    const formStatus = formData.get("status") as ReadingStatus;
    const formPagesRead = Number(formData.get("pagesRead") || 0);

    // If status is COMPLETED, ensure pagesRead is set to book's total
    if (formStatus === ReadingStatus.COMPLETED && book.pageCount) {
      formData.set("pagesRead", book.pageCount.toString());
    }

    // Determine what's being updated for a more specific loading message
    let loadingMessage = "Updating reading progress...";

    // If status is changing
    if (formStatus !== progress?.status) {
      if (formStatus === ReadingStatus.COMPLETED) {
        loadingMessage = "Marking book as completed...";
      } else if (formStatus === ReadingStatus.READING) {
        loadingMessage = "Marking book as currently reading...";
      } else if (formStatus === ReadingStatus.WANT_TO_READ) {
        loadingMessage = "Adding book to your reading list...";
      }
    }
    // Otherwise if only pages are changing
    else if (formPagesRead !== progress?.pagesRead) {
      loadingMessage = "Updating page progress...";
    }

    // Show a loading toast
    toast.loading(loadingMessage);

    // Submit the form
    submit(formData, { method: "post" });
  };

  // Check if the pages read field should be read-only
  const isPagesReadDisabled = selectedStatus === ReadingStatus.COMPLETED;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Toaster
        position="bottom-right"
        theme="light"
        closeButton={true}
        richColors={true}
        toastOptions={{
          style: {
            borderRadius: "0.5rem",
            padding: "1rem",
            maxWidth: "400px",
            boxShadow:
              "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
          },
        }}
      />
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
          <Form method="post" className="space-y-6" onSubmit={handleSubmit}>
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

              {/* Progress Bar - Show only when status is READING */}
              {selectedStatus === ReadingStatus.READING && book.pageCount && (
                <div className="mb-4">
                  <div className="w-full bg-gray-200 rounded-full h-4 mb-1 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-300 ease-in-out"
                      style={{ width: `${readingProgressPercentage}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>0%</span>
                    <span>{readingProgressPercentage}% complete</span>
                    <span>100%</span>
                  </div>
                </div>
              )}

              {/* Slider and Input Combination */}
              <div className="space-y-2">
                {/* Slider */}
                <div className="flex items-center space-x-2">
                  <input
                    type="range"
                    id="pagesReadSlider"
                    min="0"
                    max={book.pageCount || 9999}
                    value={pagesRead}
                    onChange={handlePagesReadChange}
                    disabled={isPagesReadDisabled}
                    className={`w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer ${
                      isPagesReadDisabled ? "opacity-70" : ""
                    }`}
                  />
                </div>

                {/* Numeric display with increment/decrement */}
                <div className="flex items-center">
                  <input
                    type="number"
                    id="pagesRead"
                    name="pagesRead"
                    min="0"
                    max={book.pageCount || 9999}
                    value={pagesRead}
                    onChange={handlePagesReadChange}
                    disabled={isPagesReadDisabled}
                    className={`w-24 px-3 py-2 border border-gray-300 rounded-md shadow-sm ${
                      !isPagesReadDisabled
                        ? "focus:ring-indigo-500 focus:border-indigo-500"
                        : "bg-gray-100"
                    }`}
                  />
                  {book.pageCount && (
                    <span className="ml-2 text-sm text-gray-500">
                      of {book.pageCount} pages
                    </span>
                  )}
                </div>
              </div>

              {isPagesReadDisabled && (
                <p className="mt-1 text-sm text-gray-500 italic">
                  Book marked as completed, pages read set automatically to
                  total pages.
                </p>
              )}
            </div>

            {/* Reading Statistics (replaces Reading Minutes input) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estimated Reading Time
              </label>
              <div className="flex flex-col gap-2 bg-gray-50 p-3 rounded-md">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Minutes:</span>
                  <span className="font-medium">
                    {calculatedReadingTime} mins
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Hours:</span>
                  <span className="font-medium">
                    {(calculatedReadingTime / 60).toFixed(1)} hrs
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Based on an average reading speed of 2 minutes per page.
                </p>
              </div>

              {/* Hidden field to store the calculated reading minutes */}
              <input
                type="hidden"
                id="readingMinutes"
                name="readingMinutes"
                value={calculatedReadingTime}
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
                <h3 className="font-medium mb-2">Progress Info</h3>

                {/* Add reading progress percentage for READING status */}
                {selectedStatus === ReadingStatus.READING && book.pageCount && (
                  <p className="mb-2">
                    <span className="font-semibold">Progress:</span>{" "}
                    <span className="font-medium text-blue-600">
                      {readingProgressPercentage}% complete
                    </span>
                  </p>
                )}

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
                <p className="mt-2">
                  <span className="font-semibold">Current Status:</span>{" "}
                  <span
                    className={
                      progress.status === ReadingStatus.COMPLETED
                        ? "text-green-600 font-medium"
                        : progress.status === ReadingStatus.READING
                          ? "text-blue-600 font-medium"
                          : "text-gray-600"
                    }
                  >
                    {progress.status === ReadingStatus.COMPLETED
                      ? "Completed"
                      : progress.status === ReadingStatus.READING
                        ? "Reading"
                        : "Want to Read"}
                  </span>
                </p>
              </div>
            )}

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={navigation.state === "submitting"}
                className={`w-full py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                  navigation.state === "submitting"
                    ? "bg-indigo-400 cursor-not-allowed"
                    : "bg-indigo-600 text-white hover:bg-indigo-700"
                }`}
              >
                {navigation.state === "submitting"
                  ? "Saving..."
                  : "Save Progress"}
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
