import { v4 as _uuid } from 'uuid'
import { EnumType } from './typeutils'
import truncate from 'lodash/truncate'
import isEmpty from 'lodash/isEmpty'
import isObject from 'lodash/isObject'

export const uuid = (): string => {
  return _uuid()
}

export const removeStrings = (stringToParse: string, stringsToRemove: string[]): string => {
  let modifiedString = stringToParse
  stringsToRemove.forEach((str) => {
    const regex = new RegExp(str, 'gi')
    modifiedString = modifiedString.replace(regex, '')
  })
  return modifiedString || ''
}

export const removeLeadingComma = (stringToParse: string): string => {
  return stringToParse.replace(/^,/, '')
}

export const removeTrailingComma = (stringToParse: string): string => {
  return stringToParse.replace(/,$/, '')
}

export const containsWhitespace = (string: string): boolean => {
  return /\s/.test(string)
}

export const toHumanReadableJson = (data: unknown) => {
  return JSON.stringify(data, undefined, 2)
}

export const toHumanReadableEnum = (data: EnumType) => {
  return JSON.stringify(Object.values(data))
}

export function omitNullAndUndefinedAndEmpty<T extends Record<string, any>>(obj: T): Partial<T> {
  const result: Partial<T> = {}
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const value = obj[key]
      if (isObject(value)) {
        if (!isEmpty(value)) result[key] = value
      } else if (value !== null && typeof value !== 'undefined' && value !== '') {
        result[key] = value
      }
    }
  }
  return result
}

export function omitNullAndUndefined<T extends Record<string, any>>(obj: T): Partial<T> {
  const result: Partial<T> = {}
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const value = obj[key]
      if (value !== null && typeof value !== 'undefined') {
        result[key] = value
      }
    }
  }
  return result
}

export function omitUndefined<T extends Record<string, any>>(obj: T): Partial<T> {
  const result: Partial<T> = {}
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const value = obj[key]
      if (typeof value !== 'undefined') {
        result[key] = value
      }
    }
  }
  return result
}

export const truncateString = (text?: string, length: number = 10): string => {
  if (text) {
    return truncate(text, { length, omission: '...' })
  }
  return ''
}

/**
 * Returns a new object with the specified field set to the given value, if the value is not undefined.
 * If the value is undefined, returns the original object unchanged.
 *
 * @template T - The type of the object.
 * @template K - The key of the field to set.
 * @param {Partial<T>} base - The base object to extend.
 * @param {K} key - The key of the field to set.
 * @param {T[K] | undefined} value - The value to set for the field. If undefined, the field is not set.
 * @returns {Partial<T>} A new object with the field set if value is not undefined, otherwise the original object.
 */
export const withField = <T, K extends keyof T>(base: Partial<T>, key: K, value: T[K] | undefined): Partial<T> => {
  return value === undefined ? base : { ...base, [key]: value }
}
