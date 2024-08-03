import _ from 'lodash'
import { EnumType, EnumValue } from './typeutils'
import InvalidEnumValueError from '../errors/InvalidEnumValueError'

export const isBoolean = (arg: unknown) => _.isBoolean(arg)
export const isString = (arg: unknown): arg is string => _.isString(arg)
export const isNumber = (arg: unknown): arg is number => _.isNumber(arg)
export const isNonStringOrEmpty = (arg: unknown) => !arg || !isString(arg) || arg.trim().length <= 0
export const isEnumValue = <T extends EnumType>(value: unknown, enumType: T): value is EnumValue<T> => {
  if (!isString(value) && !isNumber(value)) {
    return false
  }
  const enumValues = Object.values(enumType)
  return enumValues.includes(value)
}
export const validateAndCastEnum = <T extends { [key: string]: string | number }>(value: unknown, enumType: T): T[keyof T] => {
  if (!isString(value) && !isNumber(value)) {
    throw new InvalidEnumValueError('Value is required.')
  }

  // Attempt to match the value as a string key
  if (value in enumType) {
    return enumType[value as keyof T]
  }

  // Attempt to match the value as an enum value
  const enumValues = Object.values(enumType) as Array<string | number>

  // Check if the value matches an enum value (string or number)
  if (enumValues.includes(value)) {
    return value as EnumValue<T>
  }

  // Attempt to parse the value as a number and check
  const numericValue = Number(value)
  if (!isNaN(numericValue) && enumValues.includes(numericValue)) {
    return numericValue as EnumValue<T>
  }

  throw new InvalidEnumValueError(`Invalid enum value: ${value}, should be one of ${Object.values(enumType)}`)
}
