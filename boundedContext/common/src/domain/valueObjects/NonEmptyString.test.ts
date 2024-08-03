import { describe, it, expect } from 'vitest'
import { NonEmptyString } from './NonEmptyString'
import { InvalidNonEmptyStringError } from '../errors/InvalidNonEmptyStringError'

describe('NonEmptyString', () => {
  it('should create a NonEmptyString for a valid non-empty string', () => {
    const value = 'Hello, world!'
    const nonEmpty = new NonEmptyString(value)
    expect(nonEmpty.value).toBe(value)
    expect(nonEmpty.toString()).toBe(value)
  })

  it('should throw InvalidNonEmptyStringError for an empty string', () => {
    expect(() => new NonEmptyString('')).toThrow(InvalidNonEmptyStringError)
  })

  it('should throw InvalidNonEmptyStringError for a string with only spaces', () => {
    expect(() => new NonEmptyString('   ')).toThrow(InvalidNonEmptyStringError)
  })

  it('should throw InvalidNonEmptyStringError for a non-string value', () => {
    // @ts-expect-error
    expect(() => new NonEmptyString(null)).toThrow(InvalidNonEmptyStringError)
    // @ts-expect-error
    expect(() => new NonEmptyString(undefined)).toThrow(InvalidNonEmptyStringError)
    // @ts-expect-error
    expect(() => new NonEmptyString(123)).toThrow(InvalidNonEmptyStringError)
    // @ts-expect-error
    expect(() => new NonEmptyString({})).toThrow(InvalidNonEmptyStringError)
  })

  it('should consider two NonEmptyString instances with the same value as equal', () => {
    const a = new NonEmptyString('foo')
    const b = new NonEmptyString('foo')
    expect(a.equals(b)).toBe(true)
  })

  it('should consider two NonEmptyString instances with different values as not equal', () => {
    const a = new NonEmptyString('foo')
    const b = new NonEmptyString('bar')
    expect(a.equals(b)).toBe(false)
  })

  it('should return false when comparing with a non-NonEmptyString object', () => {
    const a = new NonEmptyString('foo')

    expect(a.equals('foo')).toBe(false)
  })

  describe('canCreate', () => {
    it('should return true for a valid non-empty string', () => {
      expect(NonEmptyString.canCreate('abc')).toBe(true)
    })

    it('should return false for an empty string', () => {
      expect(NonEmptyString.canCreate('')).toBe(false)
    })

    it('should return false for a string with only whitespace', () => {
      expect(NonEmptyString.canCreate('   ')).toBe(false)
    })

    it('should return false for a non-string value', () => {
      // @ts-expect-error
      expect(NonEmptyString.canCreate(null)).toBe(false)
      // @ts-expect-error
      expect(NonEmptyString.canCreate(undefined)).toBe(false)
      // @ts-expect-error
      expect(NonEmptyString.canCreate(123)).toBe(false)
    })

    it('should throw if throwError is true and value is invalid', () => {
      expect(() => NonEmptyString.canCreate('', { throwError: true })).toThrow(InvalidNonEmptyStringError)
    })
  })
})
