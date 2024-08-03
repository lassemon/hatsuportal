/**
 * Generic repository helper interface for database error handling.
 * Abstracts database-specific error handling to keep repositories database-agnostic.
 * Implementation is provided by the composition root (backend).
 */
export interface IRepositoryHelpers {
  /**
   * Check if an error is a unique constraint violation (e.g., duplicate key).
   * @param error The error to check
   * @returns true if the error is a unique violation error
   */
  isUniqueViolationError(error: unknown): boolean

  /**
   * Extract the constraint name from a database error.
   * @param error The database error
   * @returns The constraint name if available
   */
  getConstraintName(error: unknown): string | undefined

  /**
   * Parse unique violation details (columns and values) from error.
   * @param error The database error
   * @returns Parsed columns and values, or undefined if not parseable
   */
  tryParseUniqueViolationDetail(error: unknown): { columns: string[]; values: string[] } | undefined

  /**
   * Throw a standardized DataPersistenceError from any error.
   * @param error The error to wrap
   * @throws DataPersistenceError or ConcurrencyError
   */
  throwDataPersistenceError(error: unknown): never
}
