import { unixtimeNow } from '@hatsuportal/common'
import { ILocalStorageService } from 'application'
import _ from 'lodash'

export class LocalStorageService<T> implements ILocalStorageService<T> {
  async findById(key: string): Promise<T> {
    const storedEntity = JSON.parse(localStorage.getItem(key) || '{}')
    return await Promise.resolve(!_.isEmpty(storedEntity) ? storedEntity : null)
  }

  async store(data: T, key: string) {
    localStorage.setItem(key, Array.isArray(data) ? JSON.stringify(data) : JSON.stringify({ ...data, updatedAt: unixtimeNow() }))
    return await Promise.resolve(JSON.parse(localStorage.getItem(key) || '{}'))
  }

  async delete(key: string) {
    const storedEntity: T = JSON.parse(localStorage.getItem(key) || '{}')
    localStorage.removeItem(key)
    return await Promise.resolve(storedEntity)
  }

  async clearAll() {
    return await Promise.resolve(localStorage.clear())
  }
}
