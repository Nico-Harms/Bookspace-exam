import {
  Form,
  Link,
  useLoaderData,
  useActionData,
  useNavigation,
} from "react-router";
import * as AuthService from "~/services/auth.server";
import type { Route } from "./+types/home";
import User from "~/models/User";
import { Avatar } from "~/components/ui/avatar";
import BookReview from "~/models/BookReview";
import Book from "~/models/Book";
import { useState, useEffect } from "react";
import { Toaster, toast } from "sonner";
import { Types } from "mongoose";
import { motion, AnimatePresence } from "framer-motion";

export async function loader({ request }: Route.LoaderArgs) {
  // Require authentication
  const authUser = await AuthService.requireAuth(request);

  const user = await User.findById(authUser._id).lean();
  if (!user) {
    throw new Response("User not found", { status: 404 });
  }

  // Fetch user's reviews with book information
  const reviews = await BookReview.find({ userId: authUser._id })
    .sort({ createdAt: -1 }) // Most recent first
    .lean();

  // Get book information for each review
  const reviewsWithBooks = await Promise.all(
    reviews.map(async (review) => {
      const book = await Book.findById(review.bookId).lean();
      return {
        ...review,
        _id: String(review._id),
        book: book
          ? {
              _id: String(book._id),
              title: book.title,
              coverImage: book.coverImage,
              author: book.author,
            }
          : null,
      };
    }),
  );

  // Return the user and reviews
  return { user, reviews: reviewsWithBooks };
}

export async function action({ request }: Route.ActionArgs) {
  try {
    const authUser = await AuthService.requireAuth(request);
    const formData = await request.formData();
    const action = formData.get("action") as string;

    if (action === "deleteReview") {
      const reviewId = formData.get("reviewId") as string;

      if (!reviewId) {
        return { error: "Review ID is required" };
      }

      // Ensure we have a valid ObjectId for the review
      if (!Types.ObjectId.isValid(reviewId)) {
        return { error: "Invalid review ID format" };
      }

      const reviewObjectId = new Types.ObjectId(reviewId);

      // Check if the review belongs to the user
      const review = await BookReview.findById(reviewObjectId);

      if (!review) {
        return { error: "Review not found" };
      }

      if (String(review.userId) !== String(authUser._id)) {
        return { error: "You can only delete your own reviews" };
      }

      // Store book ID before deleting the review
      const bookId = review.bookId;

      // Delete the review - using findByIdAndDelete for better error handling
      const deletedReview = await BookReview.findByIdAndDelete(reviewObjectId);

      if (!deletedReview) {
        return { error: "Failed to delete review. Please try again." };
      }

      // Update the book's rating average
      if (bookId) {
        const book = await Book.findById(bookId);

        if (book) {
          // Get all remaining reviews for this book
          const remainingReviews = await BookReview.find({ bookId });

          if (remainingReviews.length > 0) {
            // Recalculate the average rating
            const totalRating = remainingReviews.reduce(
              (sum, rev) => sum + rev.rating,
              0,
            );
            book.rating = parseFloat(
              (totalRating / remainingReviews.length).toFixed(1),
            );
          } else {
            // No reviews left, reset rating
            book.rating = 0;
          }

          book.ratingsCount = remainingReviews.length;
          await book.save();

          console.log(
            `Updated book rating: ${book.rating}, count: ${book.ratingsCount}`,
          );
        }
      }

      return {
        success: true,
        message: "Review deleted successfully",
        deletedReviewId: reviewId,
      };
    }

    return { error: "Invalid action" };
  } catch (error) {
    console.error("Error in profile action:", error);
    return { error: "An error occurred while processing your request" };
  }
}

export default function Profile() {
  const { user, reviews } = useLoaderData<typeof loader>();
  const [reviewToDelete, setReviewToDelete] = useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const actionData = useActionData<{
    success?: boolean;
    error?: string;
    message?: string;
    deletedReviewId?: string;
  }>();
  const navigation = useNavigation();

  // Define how many reviews to show initially
  const initialReviewCount = 2;

  // Determine which reviews to display based on expanded state
  const displayedReviews = expanded
    ? reviews
    : reviews.slice(0, initialReviewCount);
  const hasMoreReviews = reviews.length > initialReviewCount;

  useEffect(() => {
    if (actionData) {
      if (actionData.success) {
        toast.success(actionData.message || "Review deleted successfully");
      } else if (actionData.error) {
        toast.error(actionData.error);
      }

      // Close the confirmation modal when action completes
      setShowConfirmation(false);
      setReviewToDelete(null);
    }
  }, [actionData]);

  const handleDeleteClick = (reviewId: string) => {
    setReviewToDelete(reviewId);
    setShowConfirmation(true);
  };

  const handleCancelDelete = () => {
    setReviewToDelete(null);
    setShowConfirmation(false);
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 300, damping: 24 },
    },
    exit: {
      opacity: 0,
      y: 20,
      transition: { duration: 0.2 },
    },
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { type: "spring", stiffness: 300, damping: 25 },
    },
    exit: {
      opacity: 0,
      scale: 0.9,
      transition: { duration: 0.2 },
    },
  };

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.2 } },
    exit: { opacity: 0, transition: { duration: 0.2 } },
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Toaster position="bottom-right" theme="light" closeButton richColors />
      <motion.h1
        className="text-2xl font-bold mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Profile
      </motion.h1>

      <motion.div
        className="bg-white rounded-lg shadow mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="p-6 flex gap-10 text-center border-b">
          <motion.div
            className="relative w-fit"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <Avatar
              src={user?.profileImage}
              name={user?.name || ""}
              size="xl"
            />
          </motion.div>
          <div className="flex flex-col justify-center items-start">
            <h2 className="text-xl font-semibold">{user?.name}</h2>
            <p className="text-gray-600">{user?.email}</p>
          </div>
        </div>

        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Account Information</h3>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">Name</p>
              <p>{user?.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p>{user?.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Account Created</p>
              <p>
                {user?.createdAt &&
                  new Date(user.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* My Reviews Section */}
      <motion.div
        className="bg-white rounded-lg shadow mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div className="p-6 border-b flex justify-between items-center">
          <h3 className="text-lg font-semibold">My Reviews</h3>
          <motion.p
            className="text-sm text-gray-500"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {reviews.length} {reviews.length === 1 ? "review" : "reviews"}
          </motion.p>
        </div>

        <div className="p-6">
          {reviews.length === 0 ? (
            <motion.div
              className="text-center py-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <p className="text-gray-500">
                You haven't written any reviews yet.
              </p>
              <Link
                to="/"
                className="mt-3 inline-block text-indigo-600 hover:text-indigo-800"
              >
                Browse books to review
              </Link>
            </motion.div>
          ) : (
            <>
              <motion.div
                className="space-y-6"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                <AnimatePresence>
                  {displayedReviews.map((review) => (
                    <motion.div
                      key={review._id}
                      className="border rounded-lg p-4 relative hover:shadow-md transition-shadow"
                      variants={itemVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      layout
                      whileHover={{ scale: 1.01 }}
                    >
                      {/* Book Info */}
                      <div className="flex gap-4">
                        {/* Book Cover */}
                        <motion.div
                          className="w-16 h-24 flex-shrink-0"
                          whileHover={{ scale: 1.05 }}
                          transition={{
                            type: "spring",
                            stiffness: 300,
                            damping: 10,
                          }}
                        >
                          {review.book?.coverImage?.url ? (
                            <img
                              src={review.book.coverImage.url}
                              alt={review.book.title}
                              className="w-full h-full object-cover rounded"
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-200 rounded flex items-center justify-center">
                              <span className="text-xs text-gray-500">
                                No cover
                              </span>
                            </div>
                          )}
                        </motion.div>

                        {/* Review Content */}
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <div>
                              <Link
                                to={`/books/${review.book?._id}`}
                                className="font-medium hover:text-indigo-600"
                              >
                                {review.book?.title || "Unknown Book"}
                              </Link>
                              <p className="text-sm text-gray-600">
                                {review.book?.author?.join(", ") ||
                                  "Unknown Author"}
                              </p>
                            </div>

                            {/* Rating */}
                            <motion.div
                              className="flex items-center gap-1"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: 0.3 }}
                            >
                              {[...Array(5)].map((_, i) => (
                                <motion.svg
                                  key={i}
                                  className={`w-4 h-4 ${i < review.rating ? "text-yellow-400" : "text-gray-300"}`}
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  transition={{ delay: 0.3 + i * 0.1 }}
                                >
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </motion.svg>
                              ))}
                            </motion.div>
                          </div>

                          {/* Review Title & Comment */}
                          {review.title && (
                            <motion.h4
                              className="font-medium mt-2"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: 0.4 }}
                            >
                              {review.title}
                            </motion.h4>
                          )}
                          {review.comment && (
                            <motion.p
                              className="text-sm mt-1"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: 0.5 }}
                            >
                              {review.comment}
                            </motion.p>
                          )}

                          {/* Review Date */}
                          <p className="text-xs text-gray-500 mt-2">
                            Posted on{" "}
                            {new Date(review.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="mt-3 flex justify-end">
                        <motion.button
                          onClick={() => handleDeleteClick(review._id)}
                          className="text-sm text-red-600 hover:text-red-800 flex items-center"
                          disabled={navigation.state === "submitting"}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <svg
                            className="w-4 h-4 mr-1"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                          Delete Review
                        </motion.button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>

              {/* Show more/less button */}
              {hasMoreReviews && (
                <motion.div
                  className="mt-6 text-center"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <motion.button
                    onClick={() => setExpanded(!expanded)}
                    className="px-4 py-2 bg-gray-100 rounded-md text-gray-700 hover:bg-gray-200 transition-colors"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    {expanded ? (
                      <>
                        <span>Show Less</span>
                        <motion.svg
                          className="w-4 h-4 ml-2 inline-block"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          animate={{ rotate: expanded ? 0 : 180 }}
                          transition={{ duration: 0.3 }}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M5 15l7-7 7 7"
                          />
                        </motion.svg>
                      </>
                    ) : (
                      <>
                        <span>
                          Show {reviews.length - initialReviewCount} More
                        </span>
                        <motion.svg
                          className="w-4 h-4 ml-2 inline-block"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          animate={{ rotate: expanded ? 180 : 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M19 9l-7 7-7-7"
                          />
                        </motion.svg>
                      </>
                    )}
                  </motion.button>
                </motion.div>
              )}
            </>
          )}
        </div>
      </motion.div>

      {/* Confirmation Dialog */}
      <AnimatePresence>
        {showConfirmation && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <motion.div
              className="bg-white rounded-lg p-6 max-w-md mx-4"
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <h3 className="text-lg font-semibold mb-4">Delete Review</h3>
              <p>
                Are you sure you want to delete this review? This action cannot
                be undone.
              </p>

              <div className="mt-6 flex justify-end gap-3">
                <motion.button
                  onClick={handleCancelDelete}
                  className="px-4 py-2 text-gray-700 hover:text-gray-900"
                  disabled={navigation.state === "submitting"}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Cancel
                </motion.button>

                <Form method="post" onSubmit={() => setShowConfirmation(false)}>
                  <input type="hidden" name="action" value="deleteReview" />
                  <input
                    type="hidden"
                    name="reviewId"
                    value={reviewToDelete || ""}
                  />
                  <motion.button
                    type="submit"
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                    disabled={navigation.state === "submitting"}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {navigation.state === "submitting"
                      ? "Deleting..."
                      : "Delete"}
                  </motion.button>
                </Form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        className="bg-white rounded-lg shadow"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Account Actions</h3>
          <div className="space-y-4">
            <motion.div
              whileHover={{ x: 5 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <Link
                to="/bookmarks"
                className="text-indigo-600 hover:text-indigo-800 flex items-center"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                  ></path>
                </svg>
                View Bookmarks
              </Link>
            </motion.div>
            <motion.div
              whileHover={{ x: 5 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <Link
                to="/progress"
                className="text-indigo-600 hover:text-indigo-800 flex items-center"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  ></path>
                </svg>
                View Reading Progress
              </Link>
            </motion.div>
            <motion.div
              whileHover={{ x: 5 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <Form action="/logout" method="post" className="block">
                <motion.button
                  type="submit"
                  className="text-red-600 hover:text-red-800 flex items-center"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    ></path>
                  </svg>
                  Logout
                </motion.button>
              </Form>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
