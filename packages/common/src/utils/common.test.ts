import { describe, expect, it } from 'vitest'
import {
  containsWhitespace,
  omitNullAndUndefined,
  omitNullAndUndefinedAndEmpty,
  omitUndefined,
  removeLeadingComma,
  removeStrings,
  removeTrailingComma,
  truncateString
} from './common'

describe('common', () => {
  it('can remove a list of strings from string', () => {
    expect(removeStrings('The quick brown Fox jumps over the lazy dog and fox', ['dog', 'fox'])).toBe(
      'The quick brown  jumps over the lazy  and '
    )
    expect(removeStrings('ThequickbrownFoxjumpsoverthelazydogandfox', ['dog', 'fox'])).toBe('Thequickbrownjumpsoverthelazyand')
  })

  it('removes leading comma', () => {
    expect(removeLeadingComma(',test')).toBe('test')
    expect(removeLeadingComma(',,test')).toBe(',test')
    expect(removeLeadingComma('test,')).toBe('test,')
    expect(removeLeadingComma('te,st,')).toBe('te,st,')
    expect(removeLeadingComma(',te,st,')).toBe('te,st,')
  })

  it('removes trailing comma', () => {
    expect(removeTrailingComma('test,')).toBe('test')
    expect(removeTrailingComma('test,,')).toBe('test,')
    expect(removeTrailingComma(',test')).toBe(',test')
    expect(removeTrailingComma(',te,st')).toBe(',te,st')
    expect(removeTrailingComma(',te,st,')).toBe(',te,st')
  })

  it('checks if string contains a white space', () => {
    expect(containsWhitespace('test ')).toBe(true)
    expect(containsWhitespace('te st')).toBe(true)
    expect(containsWhitespace(' test')).toBe(true)
    expect(containsWhitespace('test')).toBe(false)
  })

  it('truncates string to default length (10)', () => {
    expect(truncateString('abcdefghijklmno')).toBe('abcdefg...')
    expect(truncateString('short')).toBe('short')
    expect(truncateString('')).toBe('')
    expect(truncateString(undefined)).toBe('')
  })

  it('truncates string to custom length', () => {
    expect(truncateString('abcdefghijklmno', 5)).toBe('ab...')
    expect(truncateString('abcdefghijklmno', 8)).toBe('abcde...')
    expect(truncateString('abc', 10)).toBe('abc')
    expect(truncateString('abc', 3)).toBe('abc')
  })

  it('returns empty string for undefined or empty input', () => {
    expect(truncateString(undefined)).toBe('')
    expect(truncateString('')).toBe('')
  })

  it('omitNullAndUndefinedAndEmpty omits null, undefined, and empty values', () => {
    const input = {
      a: 1,
      b: null,
      c: undefined,
      d: '',
      e: [],
      f: {},
      g: 'value',
      h: 0,
      i: false,
      j: [1, 2],
      k: { x: 1 }
    }
    // '' (empty string), [] (empty array), {} (empty object), null, undefined should be omitted
    expect(omitNullAndUndefinedAndEmpty(input)).toEqual({
      a: 1,
      g: 'value',
      h: 0,
      i: false,
      j: [1, 2],
      k: { x: 1 }
    })
  })

  it('omitNullAndUndefined omits null and undefined but keeps empty values', () => {
    const input = {
      a: 1,
      b: null,
      c: undefined,
      d: '',
      e: [],
      f: {},
      g: 'value',
      h: 0,
      i: false,
      j: [1, 2],
      k: { x: 1 }
    }
    // only null and undefined should be omitted
    expect(omitNullAndUndefined(input)).toEqual({
      a: 1,
      d: '',
      e: [],
      f: {},
      g: 'value',
      h: 0,
      i: false,
      j: [1, 2],
      k: { x: 1 }
    })
  })

  it('omitUndefined omits only undefined values', () => {
    const input = {
      a: 1,
      b: null,
      c: undefined,
      d: '',
      e: [],
      f: {},
      g: 'value',
      h: 0,
      i: false,
      j: [1, 2],
      k: { x: 1 }
    }
    // only undefined should be omitted
    expect(omitUndefined(input)).toEqual({
      a: 1,
      b: null,
      d: '',
      e: [],
      f: {},
      g: 'value',
      h: 0,
      i: false,
      j: [1, 2],
      k: { x: 1 }
    })
  })
})
