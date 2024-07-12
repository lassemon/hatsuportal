import { v4 as _uuid } from 'uuid'

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
