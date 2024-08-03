import { afterEach, describe, expect, it, vi } from 'vitest'
import { UserService } from './UserService'
import { PostId } from '@hatsuportal/domain'

describe('UserService', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('validates password change', async ({ unitFixture }) => {
    const userRecord = unitFixture.userDatabaseRecord()
    const userRepositoryMock = unitFixture.userRepositoryMock()
    const spy = vi
      .spyOn(userRepositoryMock, 'getUserCredentialsByUserId')
      .mockReturnValue({ userId: userRecord.id, passwordHash: userRecord.password })
    const userService = new UserService(userRepositoryMock)

    expect(await userService.validatePasswordChange(userRecord.id, 'NewPasswordTest123', 'passwordhash')).toBe(true)
    expect(spy).toBeCalledWith(new PostId(userRecord.id))
  })

  it.fails('rejects password change if user is not found', async ({ unitFixture }) => {
    const user = unitFixture.userDatabaseRecord()
    const userRepositoryMock = unitFixture.userRepositoryMock()
    vi.spyOn(userRepositoryMock, 'getUserCredentialsByUserId').mockReturnValue(null)
    const userService = new UserService(userRepositoryMock)
    await expect(userService.validatePasswordChange(user.id, 'newPassword', 'passwordhash')).rejects.toBe(1)
  })

  it.fails('rejects password change on invalid old password', async ({ unitFixture }) => {
    const user = unitFixture.userDatabaseRecord()
    const userRepositoryMock = unitFixture.userRepositoryMock()
    vi.spyOn(userRepositoryMock, 'getUserCredentialsByUserId').mockReturnValue(user)
    const userService = new UserService(userRepositoryMock)
    await expect(userService.validatePasswordChange(user.id, 'newPassword', 'invalid old password')).rejects.toBe(1)
  })
})
