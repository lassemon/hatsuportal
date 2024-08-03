import { InputLimits } from '@hatsuportal/contracts'
import { describe, expect, it } from 'vitest'
import { CommentBodyEmptyError } from '../errors/CommentBodyEmptyError'
import { CommentBodyTooLongError } from '../errors/CommentBodyTooLongError'
import { CommentBody } from './CommentBody'

describe('CommentBody', () => {
  it('creates from valid body', () => {
    const body = new CommentBody('A test comment.')
    expect(body.value).toBe('A test comment.')
  })

  it('trims whitespace before validation', () => {
    const body = new CommentBody('  A test comment.  ')
    expect(body.value).toBe('A test comment.')
  })

  it('rejects empty body', () => {
    expect(() => new CommentBody('')).toThrow(CommentBodyEmptyError)
    expect(() => new CommentBody('   ')).toThrow(CommentBodyEmptyError)
  })

  it('rejects over-limit body', () => {
    expect(() => new CommentBody('x'.repeat(InputLimits.commentBody + 1))).toThrow(CommentBodyTooLongError)
  })
})
