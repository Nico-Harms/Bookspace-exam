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

  return (
    <div className="max-w-4xl mx-auto p-6">
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
                <span className="text-2xl text-gray-600">{user.name[0]}</span>
              </div>
            )}
          </div>
          <h2 className="text-xl font-semibold">{user.name}</h2>
          <p className="text-gray-600">{user.email}</p>
        </div>

        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Account Information</h3>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">Name</p>
              <p>{user.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p>{user.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Account Created</p>
              <p>
                {new Date(user.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Login Method</p>
              <p className="capitalize">{user.provider || "Email/Password"}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Account Actions</h3>
          <div className="space-y-4">
            <div>
              <Link
                to="/bookmarks"
                className="text-indigo-600 hover:text-indigo-800 flex items-center"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                  ></path>
                </svg>
                View Bookmarks
              </Link>
            </div>
            <div>
              <Link
                to="/progress"
                className="text-indigo-600 hover:text-indigo-800 flex items-center"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  ></path>
                </svg>
                View Reading Progress
              </Link>
            </div>
            <div>
              <Form action="/logout" method="post" className="block">
                <button
                  type="submit"
                  className="text-red-600 hover:text-red-800 flex items-center"
                >
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    ></path>
                  </svg>
                  Logout
                </button>
              </Form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
