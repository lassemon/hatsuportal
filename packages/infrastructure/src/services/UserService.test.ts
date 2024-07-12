import { describe, expect, it, vi } from 'vitest'
import { UserService } from './UserService'

describe('UserService', () => {
  it('validates password change', async ({ unitFixture }) => {
    const user = unitFixture.userDatabaseEntity()
    const userRepositoryMock = unitFixture.userRepositoryMock()
    const spy = vi.spyOn(userRepositoryMock, 'findWithPasswordById').mockReturnValue(user)
    const userService = new UserService(userRepositoryMock)

    expect(await userService.validatePasswordChange(user.id, 'newPassword', 'passwordhash')).toBe(true)
    expect(spy).toBeCalledWith(user.id)
  })

  it.fails('rejects password change if user is not found', async ({ unitFixture }) => {
    const user = unitFixture.userDatabaseEntity()
    const userRepositoryMock = unitFixture.userRepositoryMock()
    vi.spyOn(userRepositoryMock, 'findWithPasswordById').mockReturnValue(null)
    const userService = new UserService(userRepositoryMock)
    await expect(userService.validatePasswordChange(user.id, 'newPassword', 'passwordhash')).rejects.toBe(1)
  })

  it.fails('rejects password change on invalid old password', async ({ unitFixture }) => {
    const user = unitFixture.userDatabaseEntity()
    const userRepositoryMock = unitFixture.userRepositoryMock()
    vi.spyOn(userRepositoryMock, 'findWithPasswordById').mockReturnValue(user)
    const userService = new UserService(userRepositoryMock)
    await expect(userService.validatePasswordChange(user.id, 'newPassword', 'invalid old password')).rejects.toBe(1)
  })
})
