import mongoose from "mongoose";

const { MONGODB_URL, NODE_ENV } = process.env;

if (!MONGODB_URL) {
  throw new Error(
    "Please define the MONGODB_URL environment variable in your .env file",
  );
}

export default function connectDb() {
  // In development, overwrite models to pick up schema changes
  if (NODE_ENV === "development") {
    mongoose.set("overwriteModels", true);
  }

  // Reuse existing connection if available
  const readyState = mongoose.connection.readyState;
  if (readyState > 0) {
    console.log("Mongoose: Re-using existing connection");
    return;
  }

  // Set up connection event handlers
  mongoose.connection.on("error", (error) => {
    console.error("Mongoose error:", error);
  });

  mongoose.connection.on("connected", () => {
    console.log("Mongoose: Connected to MongoDB");
  });

  mongoose.connection.on("disconnected", () => {
    console.log("Mongoose: Disconnected from MongoDB");
  });

  // Create the connection
  mongoose.connect(MONGODB_URL as string).catch((error) => {
    console.error("Connection error:", error);
  });

  console.log("Mongoose: Connection attempt initiated to", MONGODB_URL);
}
