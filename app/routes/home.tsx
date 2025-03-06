import type { Route } from "./+types/home";
import mongoose from "mongoose";
// Import the entire module first
import * as AuthService from "~/services/auth.server";
import { Form } from "react-router";
export async function loader({ request }: Route.LoaderArgs) {
  // This will automatically redirect to login if not authenticated
  const user = await AuthService.requireAuth(request);

  return {
    // user,
    // dbName: mongoose.connection.name,
    // collections: await mongoose.connection.listCollections(),
    // models: mongoose.connection.modelNames(),
  };
}

export default function Home({ loaderData }: Route.ComponentProps) {
  return (
    <div>
      <h1>Home</h1>
      <Form method="post" action="/logout">
        <button type="submit">Logout</button>
      </Form>
    </div>
  );
}
