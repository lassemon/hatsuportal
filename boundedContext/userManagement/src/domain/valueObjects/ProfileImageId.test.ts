import { describe, expect, it } from 'vitest'
import { sampleImageId } from '../../__test__/testFactory'
import { InvalidProfileImageIdError } from '../errors/InvalidProfileImageIdError'
import { ProfileImageId } from './ProfileImageId'

describe('ProfileImageId', () => {
  it('exposes NOT_SET sentinel', () => {
    expect(ProfileImageId.NOT_SET.value).toBe('UNKNOWN_UNIQUE_ID')
  })

  it('creates from image id', () => {
    expect(new ProfileImageId(sampleImageId).value).toBe(sampleImageId)
  })

  it('canCreate reflects validity', () => {
    expect(ProfileImageId.canCreate(sampleImageId)).toBe(true)
    expect(ProfileImageId.canCreate('')).toBe(false)
  })

  it('fromOptional returns NOT_SET for unset values', () => {
    expect(ProfileImageId.fromOptional(null)).toBe(ProfileImageId.NOT_SET)
    expect(ProfileImageId.fromOptional(undefined)).toBe(ProfileImageId.NOT_SET)
    expect(ProfileImageId.fromOptional(ProfileImageId.NOT_SET)).toBe(ProfileImageId.NOT_SET)
  })

  it('fromOptional returns ProfileImageId for valid string or instance', () => {
    const fromString = ProfileImageId.fromOptional(sampleImageId)
    const existing = new ProfileImageId(sampleImageId)

    expect(fromString).toBeInstanceOf(ProfileImageId)
    expect(fromString.value).toBe(sampleImageId)
    expect(ProfileImageId.fromOptional(existing)).toBe(existing)
  })

  it('does not allow creating a profile image id with an empty value', () => {
    expect(() => {
      new ProfileImageId('')
    }).toThrow(InvalidProfileImageIdError)
    expect(() => {
      new ProfileImageId(undefined as any)
    }).toThrow(InvalidProfileImageIdError)
    expect(() => {
      new ProfileImageId(null as any)
    }).toThrow(InvalidProfileImageIdError)
  })

  it('does not allow creating a profile image id with an invalid value', () => {
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
        new ProfileImageId(id)
      }).toThrow(InvalidProfileImageIdError)
    })
  })
})
