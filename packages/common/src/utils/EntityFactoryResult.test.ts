import { describe, it, expect } from 'vitest'
import { EntityFactoryResult } from './EntityFactoryResult'

class DummyDomainError extends Error {}

describe('EntityFactoryResult', () => {
  describe('ok', () => {
    it('should create a successful result', () => {
      const result = EntityFactoryResult.ok(42)
      expect(result).toBeInstanceOf(EntityFactoryResult)
      expect(result.value).toBe(42)
    })

    it('should throw when accessing error on success', () => {
      const result = EntityFactoryResult.ok('foo')
      expect(() => result.error).toThrow('Cannot get error from successful result')
    })
  })

  describe('fail', () => {
    it('should create a failed result', () => {
      const error = new DummyDomainError('fail')
      const result = EntityFactoryResult.fail(error)
      expect(result).toBeInstanceOf(EntityFactoryResult)
      expect(result.error).toBe(error)
    })

    it('should throw when accessing value on failure', () => {
      const result = EntityFactoryResult.fail('bad')
      expect(() => result.value).toThrow('Cannot get value from failed result')
    })
  })

  describe('match', () => {
    it('should call onSuccess for ok', () => {
      const result = EntityFactoryResult.ok('bar')
      const matched = result.match(
        (val) => `success:${val}`,
        () => 'fail'
      )
      expect(matched).toBe('success:bar')
    })

    it('should call onFailure for fail', () => {
      const result = EntityFactoryResult.fail('err')
      const matched = result.match(
        () => 'success',
        (err) => `fail:${err}`
      )
      expect(matched).toBe('fail:err')
    })
  })

  describe('tap', () => {
    it('should call fn for ok and return self', () => {
      const result = EntityFactoryResult.ok(123)
      let called = false
      const returned = result.tap((v) => {
        called = true
        expect(v).toBe(123)
      })
      expect(called).toBe(true)
      expect(returned).toBe(result)
    })

    it('should not call fn for fail and return self', () => {
      const result = EntityFactoryResult.fail('fail')
      let called = false
      const returned = result.tap(() => {
        called = true
      })
      expect(called).toBe(false)
      expect(returned).toBe(result)
    })
  })
})
