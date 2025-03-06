// app/config/seedDatabase.server.ts
import User from "~/models/User";
import Book from "~/models/Book";
import fs from "fs";
import path from "path";

export default async function seedDatabase() {
  // Only seed if database is empty
  const userCount = await User.countDocuments();
  const bookCount = await Book.countDocuments();

  if (userCount === 0) {
    console.log("Seeding users...");

    // Create users
    await User.create({
      name: "Test User",
      email: "test@example.com",
      password: "password123",
    });

    console.log("Users seeded successfully!");
  }

  if (bookCount === 0) {
    console.log("Seeding books...");
    try {
      // Read the books.json file
      const booksData = JSON.parse(
        fs.readFileSync(
          path.join(process.cwd(), "data", "books.json"),
          "utf-8",
        ),
      );

      // Insert all books
      await Book.insertMany(booksData);
      console.log(
        `Books seeded successfully! Added ${booksData.length} books.`,
      );
    } catch (error) {
      console.error("Error seeding books:", error);
      throw error;
    }
  }
}
