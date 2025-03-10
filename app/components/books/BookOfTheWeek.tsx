import { Link } from "react-router";
import type { Book } from "~/types/book";

interface BookOfTheWeekProps {
  books: Book[];
}

export const BookOfTheWeek = ({ books }: BookOfTheWeekProps) => {
  const chosenBook = books[4];
  return (
    <div>
      {/* Book of the Week Banner */}
      {books.length > 0 && (
        <div className="mb-8 bg-gradient-to-r from-[#48302D] to-[#A7958B] rounded-lg shadow-lg overflow-hidden md:shadow-none">
          <div className="p-6 flex flex-col md:flex-row gap-6 items-center">
            {/* Book Cover */}
            <div className="w-40 h-56 flex-shrink-0 bg-white rounded-md shadow-md overflow-hidden">
              <img
                src={chosenBook.coverImage?.url || "/placeholder.png"}
                alt={chosenBook.title}
                className="w-full h-full object-cover"
              />
            </div>
            {/* Book Info */}
            <div className="flex-1 text-white text-center md:text-left">
              <div className="text-lg md:text-xl font-semibold mb-2">
                Book of the Week
              </div>
              <h2 className="text-2xl md:text-3xl font-bold mb-3">
                {chosenBook.title}
              </h2>
              <p className="text-lg mb-3 text-white/90">
                {chosenBook.author?.join(", ") || "Unknown Author"}
              </p>
              {chosenBook.genres && chosenBook.genres.length > 0 && (
                <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                  {chosenBook.genres.slice(0, 3).map((genre, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 rounded-full text-sm font-medium bg-white/20 text-white"
                    >
                      {genre}
                    </span>
                  ))}
                </div>
              )}
              <Link
                to={`/books/${chosenBook._id}`}
                className="inline-block mt-4 px-6 py-2 bg-white text-[#48302D] rounded-full font-medium hover:bg-white/90 transition-colors"
              >
                Read More
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
