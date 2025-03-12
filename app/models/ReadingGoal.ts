import { Schema, Types, model, type InferSchemaType } from "mongoose";

// Define the schema with explicit types
const readingGoalSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
    },
    pagesPerWeek: {
      type: Number,
      required: [true, "Pages per week is required"],
      min: [1, "Pages per week must be at least 1"],
      default: 60,
    },
    weekStartDate: {
      type: Date,
      required: [true, "Week start date is required"],
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true, // Add createdAt and updatedAt fields
    versionKey: false, // Don't add __v field
  },
);

// Create index on userId to ensure fast lookups
readingGoalSchema.index({ userId: 1 });

// Define the type for a ReadingGoal document
export type ReadingGoalType = InferSchemaType<typeof readingGoalSchema> & {
  _id: Types.ObjectId;
};

// Check if the model has already been compiled (for hot reloading scenarios)
const ReadingGoal = model<ReadingGoalType>("ReadingGoal", readingGoalSchema);

export default ReadingGoal;
