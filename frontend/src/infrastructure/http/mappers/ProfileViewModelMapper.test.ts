import { describe, expect, it } from 'vitest'
import { ProfileViewModel } from 'ui/features/user/viewModels/ProfileViewModel'
import { ProfileViewModelMapper } from './ProfileViewModelMapper'

describe('ProfileViewModelMapper', () => {
  const profileMapper = new ProfileViewModelMapper()

  it('converts response to ProfileViewModel entity', () => {
    expect(profileMapper.toViewModel({ storiesCreated: 1 })).toBeInstanceOf(ProfileViewModel)
  })
})
