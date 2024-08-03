import { ICache } from '@hatsuportal/platform'

export class MapCache<T> implements ICache<T> {
  readonly store = new Map<string, T | null>()

  has(key: string): boolean {
    return this.store.has(key)
  }

  get(key: string): T | null | undefined {
    if (!this.store.has(key)) return undefined
    return this.store.get(key) as T | null
  }

  set(key: string, value: T | null): void {
    this.store.set(key, value)
  }

  delete(key: string): boolean {
    return this.store.delete(key)
  }

  invalidateByPrefix(prefix: string): number {
    let count = 0
    for (const key of [...this.store.keys()]) {
      if (key.startsWith(prefix)) {
        this.store.delete(key)
        count++
      }
    }
    return count
  }
}
