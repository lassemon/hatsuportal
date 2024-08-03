import { InputLimits } from '@hatsuportal/contracts'
import { describe, expect, it } from 'vitest'
import { PostTitleEmptyError } from '../errors/PostTitleEmptyError'
import { PostTitleTooLongError } from '../errors/PostTitleTooLongError'
import { PostTitle } from './PostTitle'

describe('PostTitle', () => {
  it('creates from valid title', () => {
    const title = new PostTitle('Test Story')
    expect(title.value).toBe('Test Story')
  })

  it('trims whitespace before validation', () => {
    const title = new PostTitle('  Test Story  ')
    expect(title.value).toBe('Test Story')
  })

  it('rejects empty title', () => {
    expect(() => new PostTitle('')).toThrow(PostTitleEmptyError)
    expect(() => new PostTitle('   ')).toThrow(PostTitleEmptyError)
  })

  it('rejects over-limit title', () => {
    expect(() => new PostTitle('x'.repeat(InputLimits.postTitle + 1))).toThrow(PostTitleTooLongError)
  })

  it('accepts title at max length after trim', () => {
    const title = new PostTitle(`  ${'x'.repeat(InputLimits.postTitle)}  `)
    expect(title.value).toBe('x'.repeat(InputLimits.postTitle))
  })
})
