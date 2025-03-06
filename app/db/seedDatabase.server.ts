// // app/config/seedDatabase.server.ts
// import User from "~/models/User";
// import Post from "~/models/Post";

// export default async function seedDatabase() {
//   // Only seed if database is empty
//   const userCount = await User.countDocuments();

//   if (userCount === 0) {
//     console.log("Seeding database...");

//     // Create users
//     const user = await User.create({
//       name: "Test User",
//       email: "test@example.com",
//       password: "password123",
//     });

//     // Create posts
//     await Post.create({
//       title: "First Post",
//       content: "This is a test post",
//       author: user._id,
//     });

//     console.log("Database seeded successfully!");
//   }
// }
