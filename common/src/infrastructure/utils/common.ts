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
