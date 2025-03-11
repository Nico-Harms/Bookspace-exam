import { Schema, Types, model, type InferSchemaType } from "mongoose";

// Define the book review schema
const bookReviewSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
      index: true,
    },
    bookId: {
      type: Schema.Types.ObjectId,
      ref: "Book",
      required: [true, "Book ID is required"],
      index: true,
    },
    rating: {
      type: Number,
      required: [true, "Rating is required"],
      min: [1, "Rating must be at least 1"],
      max: [5, "Rating cannot exceed 5"],
    },
    comment: {
      type: String,
      required: false,
      maxlength: [1000, "Comment cannot exceed 1000 characters"],
    },
    title: {
      type: String,
      required: false,
      maxlength: [100, "Title cannot exceed 100 characters"],
    },
    isVerifiedPurchase: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

bookReviewSchema.index({ userId: 1, bookId: 1 }, { unique: true });

export type BookReviewType = InferSchemaType<typeof bookReviewSchema> & {
  _id: Types.ObjectId;
};

const BookReview = model<BookReviewType>("BookReview", bookReviewSchema);
export default BookReview;
