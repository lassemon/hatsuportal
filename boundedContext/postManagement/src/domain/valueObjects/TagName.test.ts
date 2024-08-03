import { InputLimits } from '@hatsuportal/contracts'
import { describe, expect, it } from 'vitest'
import { TagNameEmptyError } from '../errors/TagNameEmptyError'
import { TagNameTooLongError } from '../errors/TagNameTooLongError'
import { TagName } from './TagName'

describe('TagName', () => {
  it('creates from valid name', () => {
    const name = new TagName('Fantasy')
    expect(name.value).toBe('Fantasy')
  })

  it('trims whitespace before validation', () => {
    const name = new TagName('  Fantasy  ')
    expect(name.value).toBe('Fantasy')
  })

  it('rejects empty name', () => {
    expect(() => new TagName('')).toThrow(TagNameEmptyError)
    expect(() => new TagName('   ')).toThrow(TagNameEmptyError)
  })

  it('rejects over-limit name', () => {
    expect(() => new TagName('x'.repeat(InputLimits.tagName + 1))).toThrow(TagNameTooLongError)
  })

  it('accepts name at max length after trim', () => {
    const name = new TagName(`  ${'x'.repeat(InputLimits.tagName)}  `)
    expect(name.value).toBe('x'.repeat(InputLimits.tagName))
  })
})
