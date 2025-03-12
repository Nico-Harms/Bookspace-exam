import { ReadingStatus } from "~/models/UserBookProgress";
import type { Book } from "./book";

/**
 * Interface for book progress data attached to a book
 */
export interface BookProgress {
  _id: string;
  userId: string;
  bookId: string;
  status: ReadingStatus;
  pagesRead: number;
  startDate: Date | null;
  completionDate: Date | null;
  readingMinutes: number;
  lastReadDate: Date | null;
  notes: string;
}

/**
 * Interface for a book with its progress data
 */
export interface BookWithProgress extends Book {
  progress?: BookProgress | null;
}
