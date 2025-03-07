// Book cover image type
export interface CoverImage {
  url: string;
  width: number;
  height: number;
}

// Main Book type
export interface Book {
  _id: string;
  title: string;
  author: string[];
  description: string;
  releaseYear: number;
  slug: string;
  pageCount?: number | null;
  rating?: number | null;
  ratingsCount?: number | null;
  tags?: string[];
  moods?: string[];
  genres?: string[];
  coverImage?: CoverImage | null;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

// Props types for our components
export interface BookCardProps {
  book: Book;
}

export interface BookInfoProps {
  book: Book;
}

export interface BookRatingProps {
  rating?: number | null;
  ratingsCount?: number | null;
}
