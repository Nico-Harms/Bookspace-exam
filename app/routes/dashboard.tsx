import type { Route } from "./+types/dashboard";
import * as AuthService from "~/services/auth.server";
import type { LoaderFunctionArgs } from "react-router";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  // This will automatically redirect to login if not authenticated
  const user = await AuthService.requireAuth(request);

  return { user };
};

export default function Dashboard({
  loaderData,
}: {
  loaderData: Route.LoaderData;
}) {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      {loaderData.user && (
        <p className="mb-4">Welcome, {loaderData.user.name}!</p>
      )}
      <div className="bg-gray-100 p-4 rounded">
        <p>This is your protected dashboard.</p>
      </div>
    </div>
  );
}
