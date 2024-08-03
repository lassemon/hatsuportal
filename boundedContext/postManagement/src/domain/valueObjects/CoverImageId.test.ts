import { describe, expect, it } from 'vitest'
import { InvalidCoverImageIdError } from '../errors/InvalidCoverImageIdError'
import { CoverImageId } from './CoverImageId'
import * as Fixture from '../../__test__/testFactory'

describe('CoverImageId', () => {
  it('exposes NOT_SET sentinel', () => {
    expect(CoverImageId.NOT_SET.value).toBe('UNKNOWN_UNIQUE_ID')
  })

  it('creates from image id', () => {
    expect(new CoverImageId(Fixture.sampleImageId).value).toBe(Fixture.sampleImageId)
  })

  it('canCreate reflects validity', () => {
    expect(CoverImageId.canCreate(Fixture.sampleImageId)).toBe(true)
    expect(CoverImageId.canCreate('')).toBe(false)
  })

  it('fromOptional returns NOT_SET for unset values', () => {
    expect(CoverImageId.fromOptional(null)).toBe(CoverImageId.NOT_SET)
    expect(CoverImageId.fromOptional(undefined)).toBe(CoverImageId.NOT_SET)
    expect(CoverImageId.fromOptional(CoverImageId.NOT_SET)).toBe(CoverImageId.NOT_SET)
  })

  it('fromOptional returns CoverImageId for valid string or instance', () => {
    const fromString = CoverImageId.fromOptional(Fixture.sampleImageId)
    const existing = new CoverImageId(Fixture.sampleImageId)

    expect(fromString).toBeInstanceOf(CoverImageId)
    expect(fromString.value).toBe(Fixture.sampleImageId)
    expect(CoverImageId.fromOptional(existing)).toBe(existing)
  })

  it('does not allow creating a cover image id with an empty value', () => {
    expect(() => {
      new CoverImageId('')
    }).toThrow(InvalidCoverImageIdError)
    expect(() => {
      new CoverImageId(undefined as any)
    }).toThrow(InvalidCoverImageIdError)
    expect(() => {
      new CoverImageId(null as any)
    }).toThrow(InvalidCoverImageIdError)
  })

  it('does not allow creating a cover image id with an invalid value', () => {
    const invalidIds = [
      '    ',
      '1',
      '1234',
      '1234567',
      '1234567891',
      '1234567891234',
      '1234567891234567',
      '1234567891234567891',
      '1234567891234567891234',
      '1234567891234567891234567',
      '1234567891234567891234567891',
      '1234567891234567891234567891234',
      1,
      0,
      -1
    ] as any[]

    invalidIds.forEach((id) => {
      expect(() => {
        new CoverImageId(id)
      }).toThrow(InvalidCoverImageIdError)
    })
  })
})
