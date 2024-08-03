import { InputLimits } from '@hatsuportal/contracts'
import { describe, expect, it } from 'vitest'
import { StoryBodyEmptyError } from '../errors/StoryBodyEmptyError'
import { StoryBodyTooLongError } from '../errors/StoryBodyTooLongError'
import { StoryBody } from './StoryBody'

describe('StoryBody', () => {
  it('creates from valid body', () => {
    const body = new StoryBody('A test story body.')
    expect(body.value).toBe('A test story body.')
  })

  it('trims whitespace before validation', () => {
    const body = new StoryBody('  A test story body.  ')
    expect(body.value).toBe('A test story body.')
  })

  it('rejects empty body', () => {
    expect(() => new StoryBody('')).toThrow(StoryBodyEmptyError)
    expect(() => new StoryBody('   ')).toThrow(StoryBodyEmptyError)
  })

  it('rejects over-limit body', () => {
    expect(() => new StoryBody('x'.repeat(InputLimits.storyBody + 1))).toThrow(StoryBodyTooLongError)
  })
})
