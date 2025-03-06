import bcrypt from "bcryptjs";
import User from "../models/User";
import { createCookie, redirect } from "react-router";

// Simple session cookie
export const authCookie = createCookie("auth", {
  maxAge: 60 * 60 * 24 * 7, // 1 week
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  path: "/",
});

// Login function
export async function login(email: string, password: string) {
  try {
    // Find user with password
    const user = await User.findOne({ email }).select("+password");

    if (!user || !user.password) {
      return { error: "Invalid email or password" };
    }

    // Check password
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return { error: "Invalid email or password" };
    }

    // Return user without password
    const userObj = user.toObject();
    delete userObj.password;

    return { user: userObj };
  } catch (error) {
    console.error("Login error:", error);
    return { error: "Login failed" };
  }
}

// Signup function
export async function signup(name: string, email: string, password: string) {
  try {
    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return { error: "Email already in use" };
    }

    // Create user
    const user = await User.create({ name, email, password });

    // Return user without password
    const userObj = user.toObject();
    delete userObj.password;

    return { user: userObj };
  } catch (error) {
    console.error("Signup error:", error);
    return { error: "Signup failed" };
  }
}

// Get current user without redirection (for public routes)
export async function getAuthenticatedUser(request: Request) {
  try {
    const cookie = request.headers.get("Cookie");
    const userId = await authCookie.parse(cookie);

    if (!userId) {
      return null;
    }

    return User.findById(userId);
  } catch (error) {
    return null;
  }
}

// Get current user WITH redirection (for protected routes)
export async function requireAuth(request: Request) {
  const user = await getAuthenticatedUser(request);

  if (!user) {
    throw redirect("/login");
  }

  return user;
}

// Create session
export async function createUserSession(userId: string) {
  return authCookie.serialize(userId);
}

// End session
export async function logout() {
  return authCookie.serialize("", { maxAge: 0 });
}
