export interface IDatabaseConnectionProvider<T> {
  getConnection(): Promise<T>
}
