import { unixtimeNow } from '@hatsuportal/common'
import { ILocalStorageService } from 'application/interfaces'
import _ from 'lodash'

export class LocalStorageService<T> implements ILocalStorageService<T> {
  constructor(private readonly localStorage: Storage) {}

  async findById(key: string): Promise<T> {
    const storedEntity = JSON.parse(this.localStorage.getItem(key) || '{}')
    return await Promise.resolve(!_.isEmpty(storedEntity) ? storedEntity : null)
  }

  async store(data: T, key: string) {
    this.localStorage.setItem(key, Array.isArray(data) ? JSON.stringify(data) : JSON.stringify({ ...data, updatedAt: unixtimeNow() }))
    return await Promise.resolve(JSON.parse(this.localStorage.getItem(key) || '{}'))
  }

  async delete(key: string) {
    const storedEntity: T = JSON.parse(this.localStorage.getItem(key) || '{}')
    this.localStorage.removeItem(key)
    return await Promise.resolve(storedEntity)
  }

  async clearAll() {
    return await Promise.resolve(this.localStorage.clear())
  }
}
