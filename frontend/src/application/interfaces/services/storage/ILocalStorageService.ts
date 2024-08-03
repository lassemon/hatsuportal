import { Maybe } from '@hatsuportal/foundation'

export interface ILocalStorageService<T> {
  findById(id?: string): Promise<Maybe<T>>
  store(entity: T | null, key?: string): Promise<T>
  delete(id: string): Promise<T>
  clearAll?(): Promise<void>
}
