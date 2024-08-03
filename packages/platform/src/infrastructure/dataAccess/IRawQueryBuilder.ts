/**
 * Interface for executing raw SQL queries.
 * Provides escape hatch for database-specific features not covered by the query builder.
 */
export interface IRawQueryBuilder {
  /**
   * Execute a raw SQL query with optional parameter bindings.
   * @param sql The SQL query string
   * @param bindings Optional parameter bindings for the query
   * @returns The raw query result
   */
  raw(sql: string, bindings?: any[]): any
}
