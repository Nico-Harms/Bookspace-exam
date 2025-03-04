import mongoose from "mongoose";

export default function connectDb() {
  if (process.env.NODE_ENV === "development") {
    mongoose.set("overwriteModels", true);
  }

  const readyState = mongoose.connection.readyState;
  if (readyState > 0) {
    console.log(
      "Mongoose: Re-using existing connection (readyState: %d)",
      readyState,
    );
    return;
  }

  mongoose.connection.on("error", (error: any) => {
    console.error("Mongoose: error %s", error);
  });

  for (const event of ["connected", "reconnected", "disconnected", "close"]) {
    mongoose.connection.on(event, () => console.log("Mongoose: %s", event));
  }

  if (!process.env.MONGODB_URL) {
    throw new Error("MONGODB_URL environment variable is not defined");
  }
  mongoose.connect(process.env.MONGODB_URL).catch((error: any) => {
    console.error(error);
  });
}
