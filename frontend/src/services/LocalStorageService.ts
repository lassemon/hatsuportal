import { unixtimeNow } from '@hatsuportal/common'
import { LocalStorageServiceInterface } from 'infrastructure/repositories/LocalStorageServiceInterface'
import _ from 'lodash'

export class LocalStorageService<T> implements LocalStorageServiceInterface<T> {
  async findById(key: string): Promise<T> {
    const storedItem = JSON.parse(localStorage.getItem(key) || '{}')
    return await Promise.resolve(!_.isEmpty(storedItem) ? storedItem : null)
  }

  async store(data: T, key: string) {
    localStorage.setItem(key, JSON.stringify({ ...data, updatedAt: unixtimeNow() }))
    return await Promise.resolve(JSON.parse(localStorage.getItem(key) || '{}'))
  }

  async delete(key: string) {
    const entity: T = JSON.parse(localStorage.getItem(key) || '{}')
    localStorage.removeItem(key)
    return await Promise.resolve(entity)
  }

  async clearAll() {
    return await Promise.resolve(localStorage.clear())
  }
}
