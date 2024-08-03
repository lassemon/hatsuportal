/**
 * Generic cache interface for repository caching.
 * Allows swapping implementations (e.g. TTLCache, Redis) without changing consumers.
 */
export interface ICache<T> {
  has(key: string): boolean
  get(key: string): T | null | undefined
  set(key: string, value: T | null): void
  delete(key: string): boolean
  invalidateByPrefix(prefix: string): number
}
