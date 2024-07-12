import { describe, expect, it } from 'vitest'
import { containsWhitespace, removeLeadingComma, removeStrings, removeTrailingComma } from './common'

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
})
