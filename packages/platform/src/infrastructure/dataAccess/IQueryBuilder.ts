/**
 * Generic query builder interface for database operations.
 * Provides a fluent API for constructing database queries in a database-agnostic way.
 *
 * @template TRecord The record type for this query
 */
export interface IQueryBuilder<TRecord = any> extends PromiseLike<TRecord[]> {
  // Selection
  select(columns: string[]): IQueryBuilder<TRecord>
  select(...columns: string[]): IQueryBuilder<TRecord>
  distinct(): IQueryBuilder<TRecord>

  // Filtering
  where(field: string, value: any): IQueryBuilder<TRecord>
  where(field: string, operator: string, value: any): IQueryBuilder<TRecord>
  where(record: Record<string, any>): IQueryBuilder<TRecord>
  andWhere(field: string, value: any): IQueryBuilder<TRecord>
  andWhere(field: string, operator: string, value: any): IQueryBuilder<TRecord>
  andWhere(callback: (queryBuilder: IQueryBuilder<TRecord>) => void): IQueryBuilder<TRecord>
  orWhere(field: string, value: any): IQueryBuilder<TRecord>
  orWhere(field: string, operator: string, value: any): IQueryBuilder<TRecord>
  orWhere(callback: (queryBuilder: IQueryBuilder<TRecord>) => void): IQueryBuilder<TRecord>
  orWhereNot(record: Record<string, any>): IQueryBuilder<TRecord>
  whereIn(field: string, values: any[]): IQueryBuilder<TRecord>
  whereNotIn(field: string, values: any[]): IQueryBuilder<TRecord>
  whereNull(field: string): IQueryBuilder<TRecord>
  whereNot(field: string, value: any): IQueryBuilder<TRecord>
  whereNotNull(field: string): IQueryBuilder<TRecord>
  whereLike(field: string, value: string): IQueryBuilder<TRecord>
  whereILike(field: string, value: string): IQueryBuilder<TRecord>
  orWhereILike(field: string, value: string): IQueryBuilder<TRecord>
  andWhereRaw(sql: string, bindings?: any[]): IQueryBuilder<TRecord>

  // Joins
  leftJoin(table: string, first: string, operator: string, second: string): IQueryBuilder<TRecord>
  leftJoin(table: string, callback: (join: any) => void): IQueryBuilder<TRecord>
  innerJoin(table: string, first: string, operator: string, second: string): IQueryBuilder<TRecord>
  innerJoin(table: string, callback: (join: any) => void): IQueryBuilder<TRecord>
  joinRaw(sql: string, bindings?: any[]): IQueryBuilder<TRecord>

  // Sorting and limiting
  orderBy(column: string, direction?: 'asc' | 'desc'): IQueryBuilder<TRecord>
  limit(count: number): IQueryBuilder<TRecord>
  offset(count: number): IQueryBuilder<TRecord>

  // Aggregations
  count(column?: string): IQueryBuilder<{ count: number }>
  count(column: string, options: { as: string }): IQueryBuilder<any>

  // Mutations
  insert(data: Partial<TRecord> | Partial<TRecord>[]): IQueryBuilder<TRecord>
  update(data: Partial<TRecord>): IQueryBuilder<TRecord>
  delete(): IQueryBuilder<TRecord>

  // PostgreSQL specific (can be extended for other databases)
  returning(column: string | string[]): IQueryBuilder<TRecord>
  onConflict(column: string | string[]): IQueryBuilder<TRecord> & {
    ignore(): IQueryBuilder<TRecord>
    merge(): IQueryBuilder<TRecord>
  }

  // Query composition
  modify<T = TRecord>(callback: (queryBuilder: IQueryBuilder<T>) => void): IQueryBuilder<T>

  // Execution
  first(): Promise<TRecord | null>
  then<TResult1 = TRecord[], TResult2 = never>(
    onfulfilled?: ((value: TRecord[]) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null
  ): Promise<TResult1 | TResult2>
}
