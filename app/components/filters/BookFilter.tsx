import type { SortOption } from "~/utils/bookFilters";

interface BookFilterProps {
  genres: string[];
  selectedGenre: string;
  onGenreChange: (genre: string) => void;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  showSearch?: boolean;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  className?: string;
}

export function BookFilter({
  genres,
  selectedGenre,
  onGenreChange,
  sortBy,
  onSortChange,
  showSearch = false,
  searchQuery = "",
  onSearchChange,
  className = "",
}: BookFilterProps) {
  return (
    <div className={`flex flex-wrap gap-4 ${className}`}>
      {/* Genre Filter */}
      <div className="flex-1 min-w-[200px]">
        <label
          htmlFor="genre-filter"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Filter by Genre
        </label>
        <select
          id="genre-filter"
          value={selectedGenre}
          onChange={(e) => onGenreChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="">All Genres</option>
          {genres.map((genre) => (
            <option key={genre} value={genre}>
              {genre}
            </option>
          ))}
        </select>
      </div>

      {/* Sort Options */}
      <div className="flex-1 min-w-[200px]">
        <label
          htmlFor="sort-by"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Sort by
        </label>
        <select
          id="sort-by"
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value as SortOption)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="recent">Recently Added</option>
          <option value="title">Title</option>
          <option value="rating">Rating</option>
        </select>
      </div>

      {/* Search Input (Optional) */}
      {showSearch && onSearchChange && (
        <div className="flex-1 min-w-[200px]">
          <label
            htmlFor="search-filter"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Search Books
          </label>
          <input
            type="text"
            id="search-filter"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by title or author..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
      )}
    </div>
  );
}
