import { describe, expect, it } from 'vitest'
import { ProfilePresentation } from '../entities/ProfilePresentation'
import { ProfilePresentationMapper } from './ProfilePresentationMapper'

describe('ProfilePresentationMapper', () => {
  const profileMapper = new ProfilePresentationMapper()

  it('converts profile dto to response', () => {
    expect(profileMapper.toResponse({ storiesCreated: 1 })).toStrictEqual({ storiesCreated: 1 })
  })

  it('converts response to ProfilePresentation entity', () => {
    expect(profileMapper.toProfilePresentation({ storiesCreated: 1 })).toBeInstanceOf(ProfilePresentation)
  })
})
