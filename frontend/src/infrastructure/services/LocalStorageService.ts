import { unixtimeNow } from '@hatsuportal/common'
import { ILocalStorageService } from 'application'
import _ from 'lodash'

export class LocalStorageService<T> implements ILocalStorageService<T> {
  async findById(key: string): Promise<T> {
    const storedStory = JSON.parse(localStorage.getItem(key) || '{}')
    return await Promise.resolve(!_.isEmpty(storedStory) ? storedStory : null)
  }

  async store(data: T, key: string) {
    localStorage.setItem(key, JSON.stringify({ ...data, updatedAt: unixtimeNow() }))
    return await Promise.resolve(JSON.parse(localStorage.getItem(key) || '{}'))
  }

  async delete(key: string) {
    const post: T = JSON.parse(localStorage.getItem(key) || '{}')
    localStorage.removeItem(key)
    return await Promise.resolve(post)
  }

  async clearAll() {
    return await Promise.resolve(localStorage.clear())
  }
}
