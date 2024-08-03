import { describe, it, expect } from 'vitest'
import { UniqueId } from './UniqueId'
import { InvalidUniqueIdError } from '../errors/InvalidUniqueIdError'

describe('UniqueId', () => {
  it('should create a UniqueId for a valid UUID string', () => {
    const uuid = '123e4567-e89b-12d3-a456-426614174000'
    const id = new UniqueId(uuid)
    expect(id.value).toBe(uuid)
    expect(id.toString()).toBe(uuid)
  })

  it('should throw InvalidUniqueIdError for an empty string', () => {
    expect(() => new UniqueId('')).toThrow(InvalidUniqueIdError)
  })

  it('should throw InvalidUniqueIdError for a non-UUID string', () => {
    expect(() => new UniqueId('not-a-uuid')).toThrow(InvalidUniqueIdError)
    expect(() => new UniqueId('123')).toThrow(InvalidUniqueIdError)
    expect(() => new UniqueId('123e4567e89b12d3a456426614174000')).toThrow(InvalidUniqueIdError)
  })

  it('should throw InvalidUniqueIdError for a non-string value', () => {
    // @ts-expect-error
    expect(() => new UniqueId(null)).toThrow(InvalidUniqueIdError)
    // @ts-expect-error
    expect(() => new UniqueId(undefined)).toThrow(InvalidUniqueIdError)
    // @ts-expect-error
    expect(() => new UniqueId(123)).toThrow(InvalidUniqueIdError)
    // @ts-expect-error
    expect(() => new UniqueId({})).toThrow(InvalidUniqueIdError)
  })

  it('should consider two UniqueId instances with the same value as equal', () => {
    const uuid = '123e4567-e89b-12d3-a456-426614174000'
    const a = new UniqueId(uuid)
    const b = new UniqueId(uuid)
    expect(a.equals(b)).toBe(true)
  })

  it('should consider two UniqueId instances with different values as not equal', () => {
    const a = new UniqueId('123e4567-e89b-12d3-a456-426614174000')
    const b = new UniqueId('123e4567-e89b-12d3-a456-426614174001')
    expect(a.equals(b)).toBe(false)
  })

  it('should return false when comparing with a non-UniqueId object', () => {
    const a = new UniqueId('123e4567-e89b-12d3-a456-426614174000')
    expect(a.equals('123e4567-e89b-12d3-a456-426614174000')).toBe(false)
  })

  describe('canCreate', () => {
    it('should return true for a valid UUID string', () => {
      expect(UniqueId.canCreate('123e4567-e89b-12d3-a456-426614174000')).toBe(true)
    })

    it('should return false for an empty string', () => {
      expect(UniqueId.canCreate('')).toBe(false)
    })

    it('should return false for a non-UUID string', () => {
      expect(UniqueId.canCreate('not-a-uuid')).toBe(false)
      expect(UniqueId.canCreate('123')).toBe(false)
    })

    it('should return false for a non-string value', () => {
      // @ts-expect-error
      expect(UniqueId.canCreate(null)).toBe(false)
      // @ts-expect-error
      expect(UniqueId.canCreate(undefined)).toBe(false)
      // @ts-expect-error
      expect(UniqueId.canCreate(123)).toBe(false)
    })

    it('should throw if value is invalid', () => {
      expect(() => UniqueId.assertCanCreate('')).toThrow(InvalidUniqueIdError)
      expect(() => UniqueId.assertCanCreate('not-a-uuid')).toThrow(InvalidUniqueIdError)
    })
  })
})
