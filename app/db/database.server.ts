import mongoose from "mongoose";

const { MONGODB_URL, NODE_ENV } = process.env;

if (!MONGODB_URL) {
  throw new Error(
    "Please define the MONGODB_URL environment variable in your .env file",
  );
}

export default async function connectDb() {
  try {
    // In development, overwrite models to pick up schema changes
    if (NODE_ENV === "development") {
      mongoose.set("overwriteModels", true);
    }

    // Reuse existing connection if available
    const readyState = mongoose.connection.readyState;
    if (readyState === 1) {
      return mongoose.connection;
    }

    // Set up connection options for better reliability
    const options = {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4,
      retryWrites: true,
    };

    // Create the connection
    const conn = await mongoose.connect(MONGODB_URL as string, options);

    console.log("Mongoose: Connected to MongoDB");

    return conn;
  } catch (error) {
    console.error("MongoDB connection error:", error);
    throw error;
  }
}
