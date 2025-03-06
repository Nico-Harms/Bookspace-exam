import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  // Home route - both at / and /home
  index("routes/home.tsx"),
  // Auth routes
  route("login", "routes/login.tsx"),
  route("signup", "routes/signup.tsx"),
  route("logout", "routes/logout.tsx"),

  // Dashboard route
  route("dashboard", "routes/dashboard.tsx"),
] satisfies RouteConfig;
