import mongoose from "mongoose";

const coverImageSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    width: { type: Number, required: true },
    height: { type: Number, required: true },
  },
  { _id: false },
);

const bookSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    author: { type: [String], required: true },
    description: { type: String, required: true },
    releaseYear: { type: Number, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    pageCount: { type: Number, required: false, default: 0 },
    rating: { type: Number, required: false, default: 0 },
    tags: { type: [String], default: [] },
    moods: { type: [String], default: [] },
    ratingsCount: { type: Number, default: 0 },
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

// Export types
export type BookType = mongoose.InferSchemaType<typeof bookSchema>;
export type BookModel = mongoose.Model<BookType>;

// Create and export the model
const Book =
  mongoose.models.Book || mongoose.model<BookType>("Book", bookSchema);
export default Book;
