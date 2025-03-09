import * as AuthService from "~/services/auth.server";
import type { Route } from "./+types/home";
import { Link } from "react-router";

export async function loader({ request }: Route.LoaderArgs) {
  // Require authentication
  const user = await AuthService.requireAuth(request);
  return { user };
}

export default function Bookmarks() {
  // Placeholder bookmarked books
  const bookmarks = [
    {
      id: "1",
      title: "The Goldfinch",
      author: "Donna Tartt",
      coverUrl: "https://picsum.photos/100/150",
    },
    {
      id: "2",
      title: "Exhalation",
      author: "Ted Chiang",
      coverUrl: "https://picsum.photos/100/150",
    },
    {
      id: "3",
      title: "Norwegian Wood",
      author: "Haruki Murakami",
      coverUrl: "https://picsum.photos/100/150",
    },
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Your Bookmarks</h1>

      {bookmarks.length > 0 ? (
        <div className="space-y-4">
          {bookmarks.map((book) => (
            <Link
              key={book.id}
              to={`/book-single/${book.id}`}
              className="flex items-center p-4 bg-white rounded-lg shadow transition hover:shadow-md"
            >
              <img
                src={book.coverUrl}
                alt={`Cover of ${book.title}`}
                className="w-12 h-16 object-cover rounded mr-4"
              />
              <div>
                <h3 className="font-medium">{book.title}</h3>
                <p className="text-sm text-gray-600">{book.author}</p>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-gray-600 mb-4">
            You haven't bookmarked any books yet.
          </p>
          <Link to="/" className="text-primary font-medium">
            Discover books to bookmark
          </Link>
        </div>
      )}
    </div>
  );
}
