import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  // Home route - both at / and /home
  index("routes/home.tsx"),
  // Auth routes
  route("login", "routes/login.tsx"),
  route("signup", "routes/signup.tsx"),
  route("logout", "routes/logout.tsx"),
  route("dashboard", "routes/dashboard.tsx"),
  route("auth/google", "routes/auth/google.ts"),
  route("auth/google-callback", "routes/auth/google-callback.ts"),
] satisfies RouteConfig;
