import { describe, expect, it } from 'vitest'
import { isBoolean, isEnumValue, isNonStringOrEmpty, isNumber, isString, validateAndCastEnum } from './validators'
import { UserRoleEnum } from '../enums/UserRoleEnum'
import InvalidEnumValueError from '../errors/InvalidEnumValueError'

describe('validators', () => {
  it('validates that variable is a boolean', () => {
    expect(isBoolean(true)).toBe(true)
    expect(isBoolean(false)).toBe(true)

    expect(isBoolean(0)).toBe(false)
    expect(isBoolean(undefined)).toBe(false)
    expect(isBoolean(null)).toBe(false)
    expect(isBoolean('')).toBe(false)
  })

  it('validates that variable is a string', () => {
    expect(isString('')).toBe(true)
    expect(isString('fubar')).toBe(true)
    expect(isString(String(0))).toBe(true)

    expect(isString(0)).toBe(false)
    expect(isString(undefined)).toBe(false)
    expect(isString(null)).toBe(false)
    expect(isString(true)).toBe(false)
    expect(isString(false)).toBe(false)
  })

  it('validates that variable is a number', () => {
    expect(isNumber(0)).toBe(true)
    expect(isNumber(100)).toBe(true)
    expect(isNumber(-100)).toBe(true)

    expect(isNumber('0')).toBe(false)
    expect(isNumber(undefined)).toBe(false)
    expect(isNumber(null)).toBe(false)
    expect(isNumber('')).toBe(false)
  })

  it('validates that variable is not an empty string', () => {
    expect(isNonStringOrEmpty('')).toBe(true)
    expect(isNonStringOrEmpty(' ')).toBe(true)
    expect(isNonStringOrEmpty('   ')).toBe(true)
    expect(isNonStringOrEmpty(true)).toBe(true)
    expect(isNonStringOrEmpty(false)).toBe(true)
    expect(isNonStringOrEmpty(null)).toBe(true)
    expect(isNonStringOrEmpty(undefined)).toBe(true)
    expect(isNonStringOrEmpty(0)).toBe(true)

    expect(isNonStringOrEmpty('asd')).toBe(false)
  })

  it('validates that variable is a type of an enum', () => {
    expect(isEnumValue(UserRoleEnum.Admin, UserRoleEnum)).toBe(true)
    expect(isEnumValue('super_admin', UserRoleEnum)).toBe(true)
    expect(isEnumValue('moderator', UserRoleEnum)).toBe(true)
    expect(isEnumValue('admin', UserRoleEnum)).toBe(true)

    expect(isEnumValue(0, UserRoleEnum)).toBe(false)
    expect(isEnumValue('0', UserRoleEnum)).toBe(false)
    expect(isEnumValue(undefined, UserRoleEnum)).toBe(false)
    expect(isEnumValue(null, UserRoleEnum)).toBe(false)
    expect(isEnumValue('', UserRoleEnum)).toBe(false)

    enum NumericEnum {
      Up = 1,
      Down,
      Left,
      Right
    }
    expect(isEnumValue(1, NumericEnum)).toBe(true)
    expect(isEnumValue('Up', NumericEnum)).toBe(true)
    expect(isEnumValue(5, NumericEnum)).toBe(false)
    expect(isEnumValue('Sideways', NumericEnum)).toBe(false)
  })

  it('validates and casts a variable into a type of an enum', () => {
    expect(validateAndCastEnum(UserRoleEnum.Admin, UserRoleEnum)).toBe(UserRoleEnum.Admin)
    expect(validateAndCastEnum('super_admin', UserRoleEnum)).toBe(UserRoleEnum.SuperAdmin)
    expect(validateAndCastEnum('moderator', UserRoleEnum)).toBe(UserRoleEnum.Moderator)
    expect(validateAndCastEnum('admin', UserRoleEnum)).toBe(UserRoleEnum.Admin)

    expect(() => validateAndCastEnum(0, UserRoleEnum)).toThrow(InvalidEnumValueError)
    expect(() => validateAndCastEnum('0', UserRoleEnum)).toThrow(InvalidEnumValueError)
    expect(() => validateAndCastEnum(undefined, UserRoleEnum)).toThrow(InvalidEnumValueError)
    expect(() => validateAndCastEnum(null, UserRoleEnum)).toThrow(InvalidEnumValueError)
    expect(() => validateAndCastEnum('', UserRoleEnum)).toThrow(InvalidEnumValueError)

    enum NumericEnum {
      Up = 1,
      Down,
      Left,
      Right
    }
    expect(validateAndCastEnum(1, NumericEnum)).toBe('Up')
    expect(validateAndCastEnum('Up', NumericEnum)).toBe(1)
    expect(() => validateAndCastEnum(5, NumericEnum)).toThrow(InvalidEnumValueError)
    expect(() => validateAndCastEnum('Sideways', NumericEnum)).toThrow(InvalidEnumValueError)
  })
})
