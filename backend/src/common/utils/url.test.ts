import { describe, expect, it } from 'vitest'
import { constructUrl } from './url'

describe('url', () => {
  it('constructs url', () => {
    expect(constructUrl(['foo', undefined, 'bar'])).toBe('/foo/bar')
  })
})
