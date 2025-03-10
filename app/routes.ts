import {
  type RouteConfig,
  index,
  layout,
  route,
} from "@react-router/dev/routes";

export default [
  // Home route - both at / and /home
  layout("layouts/protected.tsx", [
    index("routes/home.tsx"),
    route("progress", "routes/progress.tsx"),
    route("progress/:id", "routes/progress-single.tsx"),
    route("bookmarks", "routes/bookmarks.tsx"),
    route("profile", "routes/profile.tsx"),
    route("books/:id", "routes/book-single.tsx"),
  ]),

  route("login", "routes/login.tsx"),
  route("signup", "routes/signup.tsx"),
  route("logout", "routes/logout.tsx"),
  route("reset-password", "routes/reset-password.tsx"),
  route("dashboard", "routes/dashboard.tsx"),
  route("auth/google", "routes/auth/google.ts"),
  route("auth/google/callback", "routes/auth/google-callback.ts"),
] satisfies RouteConfig;
