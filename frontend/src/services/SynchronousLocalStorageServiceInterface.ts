export interface SynchronousLocalStorageServiceInterface<T> {
  findById(id?: string): T
  store(entity: T | null, key?: string): T
  delete(id: string): T
  clearAll?(): void
}
