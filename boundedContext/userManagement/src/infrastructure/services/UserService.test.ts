import { afterEach, describe, expect, it, vi } from 'vitest'
import { UserService } from './UserService'
import { InvalidPasswordError, UserId } from '../../domain'
import { ValidationError } from '../errors/ValidationError'
import { PasswordFactory } from '../../application/authentication/PasswordFactory'
import { StrictPasswordPolicy } from '../authentication/StrictPasswordPolicy'

describe('UserService', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  const passwordFactory = new PasswordFactory(new StrictPasswordPolicy())

  it('validates password change', async ({ unitFixture }) => {
    const userRecord = unitFixture.userDatabaseRecord()
    const userRepositoryMock = unitFixture.userRepositoryMock()
    const spy = vi
      .spyOn(userRepositoryMock, 'getUserCredentialsByUserId')
      .mockReturnValue(Promise.resolve({ userId: userRecord.id, passwordHash: userRecord.password }))
    const userService = new UserService(userRepositoryMock, passwordFactory)

    await expect(userService.validatePasswordChange(userRecord.id, 'NewPasswordTest123', 'passwordhash')).resolves.toBeUndefined()
    expect(spy).toBeCalledWith(new UserId(userRecord.id))
  })

  it('rejects password change if user is not found', async ({ unitFixture }) => {
    const user = unitFixture.userDatabaseRecord()
    const userRepositoryMock = unitFixture.userRepositoryMock()
    vi.spyOn(userRepositoryMock, 'getUserCredentialsByUserId').mockReturnValue(Promise.resolve(null))
    const userService = new UserService(userRepositoryMock, passwordFactory)
    await expect(userService.validatePasswordChange(user.id, 'newPassword', 'passwordhash')).rejects.toThrow(ValidationError)
  })

  it('rejects password change on invalid old password', async ({ unitFixture }) => {
    const user = unitFixture.userDatabaseRecord()
    const userRepositoryMock = unitFixture.userRepositoryMock()
    vi.spyOn(userRepositoryMock, 'getUserCredentialsByUserId').mockReturnValue(
      Promise.resolve({ userId: user.id, passwordHash: user.password })
    )
    const userService = new UserService(userRepositoryMock, passwordFactory)
    await expect(userService.validatePasswordChange(user.id, 'newPassword', 'invalid old password')).rejects.toThrow(InvalidPasswordError)
  })
})
