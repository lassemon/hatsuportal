import { describe, expect, it } from 'vitest'
import { ProfileApiMapper } from './ProfileApiMapper'

describe('ProfileApiMapper', () => {
  const mapper = new ProfileApiMapper()

  it('converts profile dto to response', () => {
    expect(mapper.toResponse({ storiesCreated: 3 })).toStrictEqual({ storiesCreated: 3 })
  })
})
