import { Schema, model, Types, type InferSchemaType } from "mongoose";

// Define the cover image schema
const coverImageSchema = new Schema(
  {
    url: { type: String, required: [true, "Cover image URL is required"] },
    width: { type: Number, required: [true, "Cover image width is required"] },
    height: {
      type: Number,
      required: [true, "Cover image height is required"],
    },
  },
  { _id: false },
);

// Define the main book schema
const bookSchema = new Schema(
  {
    title: { type: String, required: [true, "Title is required"] },
    author: {
      type: [String],
      required: [true, "At least one author is required"],
    },
    description: { type: String, required: [true, "Description is required"] },
    releaseYear: { type: Number, required: [true, "Release year is required"] },
    slug: {
      type: String,
      required: [true, "Slug is required"],
      unique: true,
      index: true,
    },
    pageCount: { type: Number, default: 0 },
    rating: { type: Number, default: 0 },
    ratingsCount: { type: Number, default: 0 },
    tags: { type: [String], default: [] },
    moods: { type: [String], default: [] },
    genres: { type: [String], default: [] },
    coverImage: {
      type: coverImageSchema,
      required: false,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

// Create indexes for common queries
bookSchema.index({ slug: 1 });
bookSchema.index({ title: 1 });
bookSchema.index({ genres: 1 });

// Define the type for a Book document
export type BookType = InferSchemaType<typeof bookSchema> & {
  _id: Types.ObjectId | string;
};

// Create and export the model
const Book = model<BookType>("Book", bookSchema);
export default Book;
