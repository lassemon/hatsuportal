import { ICache } from '../../application/cache/ICache'

/**
 * In-memory cache with time-to-live (TTL) expiration.
 * Entries are lazily evicted on access when expired.
 * Supports explicit invalidation (delete) for event-based invalidation.
 */
export class TTLCache<T> implements ICache<T> {
  private readonly entries = new Map<string, { value: T | null; expiresAt: number }>()
  private readonly ttlMs: number
  private lastCleanup = 0
  private readonly cleanupIntervalMs: number

  constructor(options: { ttlSeconds: number; cleanupIntervalSeconds?: number } = { ttlSeconds: 60 }) {
    this.ttlMs = options.ttlSeconds * 1000
    this.cleanupIntervalMs = (options.cleanupIntervalSeconds ?? options.ttlSeconds) * 1000
  }

  has(key: string): boolean {
    const entry = this.entries.get(key)
    if (!entry) return false
    if (Date.now() > entry.expiresAt) {
      this.entries.delete(key)
      return false
    }
    return true
  }

  get(key: string): T | null | undefined {
    const entry = this.entries.get(key)
    if (!entry) return undefined
    if (Date.now() > entry.expiresAt) {
      this.entries.delete(key)
      return undefined
    }
    return entry.value
  }

  set(key: string, value: T | null): void {
    this.entries.set(key, {
      value,
      expiresAt: Date.now() + this.ttlMs
    })
    this.maybeCleanup()
  }

  delete(key: string): boolean {
    return this.entries.delete(key)
  }

  /** Invalidate by key prefix (e.g. "findById:" to clear all findById entries) */
  invalidateByPrefix(prefix: string): number {
    const keysToDelete: string[] = []
    for (const key of this.entries.keys()) {
      if (key.startsWith(prefix)) keysToDelete.push(key)
    }
    for (const key of keysToDelete) {
      this.entries.delete(key)
    }
    return keysToDelete.length
  }

  private maybeCleanup(): void {
    const now = Date.now()
    if (now - this.lastCleanup < this.cleanupIntervalMs) return
    this.lastCleanup = now

    const keysToDelete: string[] = []
    for (const [key, entry] of this.entries) {
      if (now > entry.expiresAt) keysToDelete.push(key)
    }
    for (const key of keysToDelete) {
      this.entries.delete(key)
    }
  }
}
