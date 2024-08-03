import { describe, expect, it } from 'vitest'
import { InvalidTagSlugError } from '../errors/InvalidTagSlugError'
import { TagSlug } from './TagSlug'

describe('TagSlug', () => {
  it('creates from valid slug', () => {
    const slug = new TagSlug('test-tag')
    expect(slug.value).toBe('test-tag')
  })

  it('rejects empty slug', () => {
    expect(() => new TagSlug('')).toThrow(InvalidTagSlugError)
  })
})
