import { Form, Link } from "react-router";
import * as AuthService from "~/services/auth.server";
import type { Route } from "./+types/home";
import User from "~/models/User";

export async function loader({ request }: Route.LoaderArgs) {
  // Require authentication
  const authUser = await AuthService.requireAuth(request);

  const user = await User.findById(authUser._id).lean();

  // No need for manual conversion, lean() already gives us a plain object
  return { user };
}

export default function Profile({ loaderData }: { loaderData: { user: any } }) {
  const { user } = loaderData;
  console.log(user);
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Profile</h1>

      <div className="bg-white rounded-lg shadow mb-6">
        <div className="p-6 text-center border-b">
          <div className="relative mx-auto w-24 h-24 mb-4">
            {user.profileImage ? (
              <img
                src={user.profileImage}
                alt="Profile"
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-200 rounded-full flex items-center justify-center">
                <span className="text-2xl text-gray-600">{user.name}</span>
              </div>
            )}
          </div>
          <h2 className="text-xl font-semibold">{user.name}</h2>
          <p className="text-gray-600">{user.email}</p>
        </div>

        <div className="p-4 space-y-2">
          <Link to="/settings" className="block p-2 hover:bg-gray-50 rounded">
            <div className="flex items-center">
              <svg
                className="w-5 h-5 mr-3 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <span>Settings</span>
            </div>
          </Link>

          <Link
            to="/reading-history"
            className="block p-2 hover:bg-gray-50 rounded"
          >
            <div className="flex items-center">
              <svg
                className="w-5 h-5 mr-3 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>Reading History</span>
            </div>
          </Link>

          <Form action="/logout" method="post" className="block">
            <button
              type="submit"
              className="w-full text-left p-2 hover:bg-gray-50 rounded"
            >
              <div className="flex items-center text-red-600">
                <svg
                  className="w-5 h-5 mr-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                <span>Logout</span>
              </div>
            </button>
          </Form>
        </div>
      </div>

      <div className="p-4 bg-white rounded-lg shadow">
        <h3 className="font-medium mb-2">Reading Stats</h3>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-2">
            <div className="text-xl font-bold">12</div>
            <div className="text-xs text-gray-600">Books Read</div>
          </div>
          <div className="p-2">
            <div className="text-xl font-bold">3</div>
            <div className="text-xs text-gray-600">Currently Reading</div>
          </div>
          <div className="p-2">
            <div className="text-xl font-bold">23</div>
            <div className="text-xs text-gray-600">Want to Read</div>
          </div>
        </div>
      </div>
    </div>
  );
}
