import bcrypt from "bcryptjs";
import User from "../models/User";
import { Authenticator } from "remix-auth";
import { OAuth2Strategy, CodeChallengeMethod } from "remix-auth-oauth2";
import { FormStrategy } from "remix-auth-form";
import { createCookie, redirect } from "react-router";
import { sessionStorage } from "./session.server";

// ==================== Authenticator Setup ==================== //
// Create a new instance of the Authenticator
export const authenticator = new Authenticator<{ _id: string }>();

// ==================== Google Authentication ==================== //
authenticator.use(
  new OAuth2Strategy(
    {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorizationEndpoint: "https://accounts.google.com/o/oauth2/auth",
      tokenEndpoint: "https://oauth2.googleapis.com/token",
      redirectURI: process.env.GOOGLE_CALLBACK_URL!,
      scopes: ["openid", "email", "profile"],
      codeChallengeMethod: CodeChallengeMethod.S256, // Recommended security measure
    },
    async ({ tokens, request }) => {
      const googleUser = await getGoogleUser(tokens.accessToken());
      const userId = await createOrGetUser(
        googleUser.name,
        googleUser.email,
        googleUser.picture,
      );
      return { _id: userId };
    },
  ),
  "google",
);

// ==================== Form Authentication ==================== //
authenticator.use(
  new FormStrategy(async ({ form }) => {
    const email = form.get("email");
    const password = form.get("password");

    // Validate inputs
    if (!email || typeof email !== "string" || !email.trim()) {
      throw new Error("Email is required and must be a string");
    }

    if (!password || typeof password !== "string" || !password.trim()) {
      throw new Error("Password is required and must be a string");
    }

    // Verify the user
    const userId = await verifyUser(email, password);
    return { _id: userId };
  }),
  "email-pass",
);

async function verifyUser(email: string, password: string) {
  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    throw new Error("No user found with this email.");
  }

  if (!user.password) {
    throw new Error(
      "This email is associated with an OAuth account. Please sign in with Google.",
    );
  }

  const passwordMatch = await bcrypt.compare(password, user.password);
  if (!passwordMatch) {
    throw new Error("Invalid password.");
  }

  // Return the user id to be stored in the session
  return user._id.toString();
}

// ==================== Helper Functions ==================== //

/**
 * Retrieves the user from the Google API
 */
async function getGoogleUser(accessToken: string) {
  const response = await fetch(
    "https://www.googleapis.com/oauth2/v3/userinfo",
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    },
  );

  if (!response.ok) {
    throw new Error(
      `Google API Error: ${response.status} ${response.statusText}`,
    );
  }

  return response.json();
}

/**
 * Finds an existing user or creates a new one in the database
 */
async function createOrGetUser(name: string, email: string, picture: string) {
  let user = await User.findOne({ email });

  if (!user) {
    user = await User.create({
      name,
      email,
      picture,
      provider: "google",
    });
  }

  return user._id.toString();
}

// ==================== Authentication Utilities ==================== //

/**
 * Checks if a user is authenticated; otherwise, redirects to the login page
 */
export async function requireAuth(request: Request) {
  const user = await getAuthenticatedUser(request);
  if (!user) {
    throw redirect("/login");
  }
  return user;
}

/**
 * Retrieves the authenticated user from the session
 */
export async function getAuthenticatedUser(request: Request) {
  try {
    const session = await sessionStorage.getSession(
      request.headers.get("Cookie"),
    );
    const userId = session.get("authUser")?._id;

    if (!userId) {
      return null;
    }

    return User.findById(userId);
  } catch (error) {
    return null;
  }
}

/*===============================================
=          Login           =
===============================================*/

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

/*===============================================
=          Signin new user           =
===============================================*/

export async function signup(name: string, email: string, password: string) {
  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return { error: "User already exists" };
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    /*===============================================
=          Create new user           =
===============================================*/
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      provider: "local",
    });

    // Return user without password
    const userObj = user.toObject();
    delete userObj.password;

    return { user: userObj };
  } catch (error) {
    console.error("Signup error:", error);
    return { error: "Signup failed" };
  }
}

/*===============================================
=          Logout user           =
===============================================*/

export async function logout(request: Request) {
  const session = await sessionStorage.getSession(
    request.headers.get("cookie"),
  );
  return redirect("/login", {
    headers: { "Set-Cookie": await sessionStorage.destroySession(session) },
  });
}

/*===============================================
=          Session Management           =
===============================================*/

export async function getAuthUser(request: Request) {
  const session = await sessionStorage.getSession(
    request.headers.get("cookie"),
  );
  return session.get("authUser");
}
