/*===============================================
=            Calculate reading progress           =
===============================================*/

/**
 * Calculate the reading progress percentage
 * @param pagesRead - Number of pages read
 * @param totalPages - Total number of pages in the book
 * @returns Progress percentage (0-100)
 */
export function calculateReadingProgress(
  pagesRead: number,
  totalPages: number,
): number {
  return totalPages > 0
    ? Math.min(100, Math.round((pagesRead / totalPages) * 100))
    : 0;
}

/**
 * Calculate the pages left to read
 * @param pagesRead - Number of pages read
 * @param totalPages - Total number of pages in the book
 * @returns Number of pages left to read
 */
export function calculatePagesLeft(
  pagesRead: number,
  totalPages: number,
): number {
  return Math.max(0, totalPages - pagesRead);
}

/**
 * Calculate daily reading target to complete a reading goal
 * @param pagesLeft - Number of pages left to read
 * @param daysLeft - Number of days left to complete the goal
 * @returns Daily page target (pages per day)
 */
export function calculateDailyTarget(
  pagesLeft: number,
  daysLeft: number,
): number {
  return daysLeft > 0 ? Math.ceil(pagesLeft / daysLeft) : 0;
}
