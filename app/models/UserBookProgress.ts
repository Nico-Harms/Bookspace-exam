import { Schema, Types, model, type InferSchemaType } from "mongoose";

// Define reading status enum
export enum ReadingStatus {
  WANT_TO_READ = "WANT_TO_READ",
  READING = "READING",
  COMPLETED = "COMPLETED",
}

// Define the schema with explicit types
const userBookProgressSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId, // Use Schema.Types.ObjectId instead of Types.ObjectId
      ref: "User",
      required: [true, "User ID is required"],
      index: true,
    },
    bookId: {
      type: Schema.Types.ObjectId, // Use Schema.Types.ObjectId instead of Types.ObjectId
      ref: "Book",
      required: [true, "Book ID is required"],
      index: true,
    },
    status: {
      type: String,
      enum: Object.values(ReadingStatus),
      default: ReadingStatus.WANT_TO_READ,
      required: true,
    },
    pagesRead: {
      type: Number,
      default: 0,
      min: [0, "Pages read cannot be negative"],
    },
    startDate: {
      type: Date,
      default: null,
    },
    completionDate: {
      type: Date,
      default: null,
    },
    readingMinutes: {
      type: Number,
      default: 0,
      min: [0, "Reading minutes cannot be negative"],
    },
    lastReadDate: {
      type: Date,
      default: null,
    },
    notes: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true, // Add createdAt and updatedAt fields
    versionKey: false, // Don't add __v field
  },
);

// Create compound index for userId and bookId to ensure unique combinations
userBookProgressSchema.index({ userId: 1, bookId: 1 }, { unique: true });

// Define the type for a UserBookProgress document
export type UserBookProgressType = InferSchemaType<
  typeof userBookProgressSchema
> & {
  _id: Types.ObjectId;
};

// Check if the model has already been compiled (for hot reloading scenarios)
const UserBookProgress = model<UserBookProgressType>(
  "UserBookProgress",
  userBookProgressSchema,
);

export default UserBookProgress;
