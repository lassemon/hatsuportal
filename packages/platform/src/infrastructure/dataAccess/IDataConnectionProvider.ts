export interface IDataConnectionProvider<T> {
  getConnection(): T
}
