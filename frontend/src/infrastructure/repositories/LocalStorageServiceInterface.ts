export interface LocalStorageServiceInterface<T> {
  findById(id?: string): Promise<T | null>
  store(entity: T | null, key?: string): Promise<T>
  delete(id: string): Promise<T>
  clearAll?(): Promise<void>
}
