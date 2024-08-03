import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { TTLCache } from './TTLCache'

describe('TTLCache', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(0)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns values within TTL on get and has', () => {
    const cache = new TTLCache<string>({ ttlSeconds: 10 })

    cache.set('key', 'value')

    expect(cache.has('key')).toBe(true)
    expect(cache.get('key')).toBe('value')
  })

  it('evicts expired entries on get and has', () => {
    const cache = new TTLCache<string>({ ttlSeconds: 10 })

    cache.set('key', 'value')
    vi.advanceTimersByTime(10_001)

    expect(cache.has('key')).toBe(false)
    expect(cache.get('key')).toBeUndefined()
  })

  it('proactively removes expired entries on set after cleanup interval', () => {
    const cache = new TTLCache<string>({ ttlSeconds: 10, cleanupIntervalSeconds: 5 })

    cache.set('expired-1', 'a')
    cache.set('expired-2', 'b')
    vi.advanceTimersByTime(10_001)

    cache.set('fresh', 'c')

    expect(cache.get('expired-1')).toBeUndefined()
    expect(cache.get('expired-2')).toBeUndefined()
    expect(cache.get('fresh')).toBe('c')
  })

  it('throttles proactive cleanup until the cleanup interval elapses', () => {
    vi.setSystemTime(0)
    const cache = new TTLCache<string>({ ttlSeconds: 5, cleanupIntervalSeconds: 10 })

    cache.set('stale', 'a')
    vi.advanceTimersByTime(5_001)
    vi.advanceTimersByTime(10_000)
    cache.set('run-cleanup', 'rc')

    cache.set('also-stale', 'b')
    vi.advanceTimersByTime(5_001)
    cache.set('no-cleanup-yet', 'nc')

    vi.advanceTimersByTime(4_998)
    cache.set('still-throttled', 'st')

    vi.advanceTimersByTime(5_002)
    cache.set('fresh', 'fresh-value')

    expect(cache.get('also-stale')).toBeUndefined()
    expect(cache.get('fresh')).toBe('fresh-value')
  })

  it('invalidates keys by prefix only', () => {
    const cache = new TTLCache<string>({ ttlSeconds: 60 })

    cache.set('findById:1', 'a')
    cache.set('findById:2', 'b')
    cache.set('list:all', 'c')

    expect(cache.invalidateByPrefix('findById:')).toBe(2)
    expect(cache.get('findById:1')).toBeUndefined()
    expect(cache.get('findById:2')).toBeUndefined()
    expect(cache.get('list:all')).toBe('c')
  })

  it('deletes a single key', () => {
    const cache = new TTLCache<string>({ ttlSeconds: 60 })

    cache.set('key', 'value')

    expect(cache.delete('key')).toBe(true)
    expect(cache.get('key')).toBeUndefined()
  })
})
