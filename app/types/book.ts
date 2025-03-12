// Book cover image type
export interface CoverImage {
  url: string;
  width: number;
  height: number;
}

// Book review type
export interface BookReview {
  _id: string;
  userId: string;
  bookId: string;
  rating: number;
  comment?: string;
  title?: string;
  isVerifiedPurchase?: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
  user?: {
    name: string;
    profileImage?: string;
  };
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
  reviews?: BookReview[];
  averageRating?: number;
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

export interface BookReviewFormProps {
  bookId: string;
  onReviewSubmitted?: () => void;
}

export interface StarRatingProps {
  value: number;
  onChange?: (rating: number) => void;
  readOnly?: boolean;
  size?: "sm" | "md" | "lg";
}
