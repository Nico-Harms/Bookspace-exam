import type { Route } from "./+types/home";
import mongoose from "mongoose";
// Import the entire module first
import * as AuthService from "~/services/auth.server";
import { redirect } from "react-router";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export async function loader({ request }: Route.LoaderArgs) {
  // This will automatically redirect to login if not authenticated
  const user = await AuthService.requireAuth(request);

  return {
    user,
    dbName: mongoose.connection.name,
    collections: await mongoose.connection.listCollections(),
    models: mongoose.connection.modelNames(),
  };
}

export default function Home({ loaderData }: Route.ComponentProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center">
      <h1 className="text-2xl font-bold">📚 Book Space</h1>
      {loaderData.user && (
        <p className="mt-2">Welcome, {loaderData.user.name}!</p>
      )}
      <pre className="mt-4 text-left text-gray-500">
        <code>{JSON.stringify(loaderData, null, 2)}</code>
      </pre>
    </div>
  );
}
