import type { Route } from "./+types/home";
import mongoose from "mongoose";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export async function loader({}: Route.LoaderArgs) {
  return {
    dbName: mongoose.connection.name,
    collections: await mongoose.connection.listCollections(),
    models: mongoose.connection.modelNames(),
  };
}

export default function Home({ loaderData }: Route.ComponentProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center">
      <h1 className="text-2xl font-bold">📚 Book Space</h1>
      <pre className="mt-4 text-left text-gray-500">
        <code>{JSON.stringify(loaderData, null, 2)}</code>
      </pre>
    </div>
  );
}
