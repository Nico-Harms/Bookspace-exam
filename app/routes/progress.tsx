import * as AuthService from "~/services/auth.server";
import type { Route } from "./+types/home";

export async function loader({ request }: Route.LoaderArgs) {
  // Require authentication
  const user = await AuthService.requireAuth(request);
  return { user };
}

export default function Progress() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Your Reading Progress</h1>
      <div className="bg-white rounded-lg shadow p-4">
        <p className="text-gray-600">
          Track your reading progress here. This feature is coming soon!
        </p>

        {/* Placeholder progress bars */}
        <div className="mt-4 space-y-4">
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium">The Goldfinch</span>
              <span className="text-sm font-medium">65%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-primary h-2.5 rounded-full"
                style={{ width: "65%" }}
              ></div>
            </div>
          </div>

          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium">Norwegian Wood</span>
              <span className="text-sm font-medium">32%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-primary h-2.5 rounded-full"
                style={{ width: "32%" }}
              ></div>
            </div>
          </div>

          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium">Exhalation</span>
              <span className="text-sm font-medium">89%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-primary h-2.5 rounded-full"
                style={{ width: "89%" }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
