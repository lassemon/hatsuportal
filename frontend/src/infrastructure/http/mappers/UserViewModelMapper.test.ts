import { describe, expect, it } from 'vitest'
import { UserViewModelMapper } from './UserViewModelMapper'
import { UserViewModel } from 'ui/features/user/viewModels/UserViewModel'

describe('UserViewModelMapper', () => {
  const userMapper = new UserViewModelMapper()

  it('converts user response to UserViewModel entity', ({ unitFixture }) => {
    expect(userMapper.toViewModel(unitFixture.userDTOMock())).toBeInstanceOf(UserViewModel)
  })
})
