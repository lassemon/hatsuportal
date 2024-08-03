import { afterEach, describe, expect, it, vi } from 'vitest'
import { UserAuthenticationService } from './UserAuthenticationService'
import { InvalidPasswordError, UserId } from '../../domain'
import { PasswordFactory } from '../../application/authentication/PasswordFactory'
import { StrictPasswordPolicy } from '../authentication/StrictPasswordPolicy'
import { AuthenticationError } from '@hatsuportal/platform'

describe('UserAuthenticationService', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  const passwordFactory = new PasswordFactory(new StrictPasswordPolicy())

  it('validates password change', async ({ unitFixture }) => {
    const userRecord = unitFixture.userDatabaseRecord()
    const userWriteRepositoryMock = unitFixture.userWriteRepositoryMock()
    const spy = vi
      .spyOn(userWriteRepositoryMock, 'getUserCredentialsByUserId')
      .mockReturnValue(Promise.resolve({ userId: userRecord.id, passwordHash: userRecord.password }))
    const userService = new UserAuthenticationService(userWriteRepositoryMock, passwordFactory)

    await expect(userService.validatePasswordChange(userRecord.id, 'NewPasswordTest123', 'passwordhash')).resolves.toBeUndefined()
    expect(spy).toBeCalledWith(new UserId(userRecord.id))
  })

  it('rejects password change if user is not found', async ({ unitFixture }) => {
    const user = unitFixture.userDatabaseRecord()
    const userWriteRepositoryMock = unitFixture.userWriteRepositoryMock()
    vi.spyOn(userWriteRepositoryMock, 'getUserCredentialsByUserId').mockReturnValue(Promise.resolve(null))
    const userService = new UserAuthenticationService(userWriteRepositoryMock, passwordFactory)
    await expect(userService.validatePasswordChange(user.id, 'newPassword', 'passwordhash')).rejects.toThrow(AuthenticationError)
  })

  it('rejects password change on invalid old password', async ({ unitFixture }) => {
    const user = unitFixture.userDatabaseRecord()
    const userWriteRepositoryMock = unitFixture.userWriteRepositoryMock()
    vi.spyOn(userWriteRepositoryMock, 'getUserCredentialsByUserId').mockReturnValue(
      Promise.resolve({ userId: user.id, passwordHash: user.password })
    )
    const userService = new UserAuthenticationService(userWriteRepositoryMock, passwordFactory)
    await expect(userService.validatePasswordChange(user.id, 'newPassword', 'invalid old password')).rejects.toThrow(InvalidPasswordError)
  })
})
