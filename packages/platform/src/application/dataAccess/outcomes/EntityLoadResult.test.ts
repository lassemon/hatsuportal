import { describe, expect, it } from 'vitest'
import { EntityLoadError } from '../errors/EntityLoadError'
import { EntityLoadResult } from './EntityLoadResult'

describe('EntityLoadResult', () => {
  it('creates a success result and returns the value', () => {
    const result = EntityLoadResult.success({ id: 'entity-1' })

    expect(result.isSuccess()).toBe(true)
    expect(result.isFailed()).toBe(false)
    expect(result.isSkipped()).toBe(false)
    expect(result.value).toEqual({ id: 'entity-1' })
    expect(() => result.error).toThrow()
  })

  it('creates a failed result and returns the error', () => {
    const result = EntityLoadResult.failure(new EntityLoadError({ entityId: 'entity-1', error: new Error('Load failed') }))

    expect(result.isFailed()).toBe(true)
    expect(result.error).toBeInstanceOf(EntityLoadError)
    expect(result.error.error.message).toBe('Load failed')
    expect(() => result.value).toThrow()
  })

  it('creates a failure result from a typed error', () => {
    const typedError = { code: 'missing', message: 'Not found' }
    const result = EntityLoadResult.failure(typedError)

    expect(result.isFailed()).toBe(true)
    expect(result.error).toEqual(typedError)
  })

  it('creates a skipped result', () => {
    const result = EntityLoadResult.skipped()

    expect(result.isSkipped()).toBe(true)
    expect(result.isSuccess()).toBe(false)
    expect(result.isFailed()).toBe(false)
    expect(() => result.value).toThrow()
    expect(() => result.error).toThrow()
  })

  it('matches on success, failure, and skipped', () => {
    expect(
      EntityLoadResult.success('ok').match(
        (value) => `success:${value}`,
        () => 'failure',
        () => 'skipped'
      )
    ).toBe('success:ok')

    expect(
      EntityLoadResult.failure(new EntityLoadError({ entityId: 'entity-1', error: new Error('boom') })).match(
        () => 'success',
        (error) => `failure:${error.error.message}`,
        () => 'skipped'
      )
    ).toBe('failure:boom')

    expect(
      EntityLoadResult.skipped().match(
        () => 'success',
        () => 'failure',
        () => 'skipped'
      )
    ).toBe('skipped')
  })

  it('runs tap only on success', () => {
    let called = false

    EntityLoadResult.success('ok').tap((value) => {
      called = true
      expect(value).toBe('ok')
    })
    expect(called).toBe(true)

    called = false
    EntityLoadResult.failure(new EntityLoadError({ entityId: 'entity-1', error: new Error('x') })).tap(() => {
      called = true
    })
    expect(called).toBe(false)

    EntityLoadResult.skipped().tap(() => {
      called = true
    })
    expect(called).toBe(false)
  })

  it('runs tapError only on failure', () => {
    let called = false

    EntityLoadResult.failure(new EntityLoadError({ entityId: 'entity-1', error: new Error('fail') })).tapError((error) => {
      called = true
      expect(error).toBeInstanceOf(EntityLoadError)
    })
    expect(called).toBe(true)

    called = false
    EntityLoadResult.success('ok').tapError(() => {
      called = true
    })
    expect(called).toBe(false)

    EntityLoadResult.skipped().tapError(() => {
      called = true
    })
    expect(called).toBe(false)
  })

  it('stringifies with the current state', () => {
    expect(EntityLoadResult.success('ok').toString()).toContain('success')
    expect(
      EntityLoadResult.failure(new EntityLoadError({ entityId: 'entity-1', error: new Error('fail') })).toString()
    ).toContain('failure')
    expect(EntityLoadResult.skipped().toString()).toContain('skipped')
  })
})
