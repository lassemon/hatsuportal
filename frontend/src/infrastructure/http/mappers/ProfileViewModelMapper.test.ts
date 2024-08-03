import { describe, expect, it } from 'vitest'
import { ProfileViewModel } from 'ui/entities/user/model/ProfileViewModel'
import { ProfileViewModelMapper } from './ProfileViewModelMapper'

describe('ProfileViewModelMapper', () => {
  const profileMapper = new ProfileViewModelMapper()

  it('converts response to ProfileViewModel entity', () => {
    expect(
      profileMapper.toViewModel({
        bio: 'Hello',
        statusMessage: 'Available',
        profileImageId: null
      })
    ).toBeInstanceOf(ProfileViewModel)
  })
})
