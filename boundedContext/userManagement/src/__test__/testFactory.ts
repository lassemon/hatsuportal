import { unixtimeNow, UserRoleEnum } from '@hatsuportal/common'
import { Mocked, vi } from 'vitest'
import { UserDatabaseSchema } from '../infrastructure/schemas/UserDatabaseSchema'
import { IUserRepository, User } from '../domain'

const createdAt = unixtimeNow() - 3000
const updatedAt = createdAt + 1500

export const userDatabaseRecord = (): UserDatabaseSchema => {
  return {
    ...{
      id: userDTOMock().id,
      name: userDTOMock().name,
      password: '$2a$10$Ktrlfz7aJd.Vnp4WZ7jvOeD21HoMZGorwPefzm0BOWyJ5SNgem8TW', // this is the word 'passwordhash' encrypted with bcrypt
      email: userDTOMock().email,
      roles: `["admin", "moderator"]`, // json types are strings in database
      active: 1, // tinyint datatype, 1 is true, 0 is false
      createdAt: userDTOMock().createdAt,
      updatedAt: userDTOMock().updatedAt
    }
  }
}

export const userDTOMock = () => {
  return {
    ...{
      id: 'test1b19-user-4792-a2f0-f95ccab82d92',
      name: 'username',
      email: 'email@test.com',
      roles: [UserRoleEnum.Admin],
      active: true,
      createdAt,
      updatedAt
    }
  }
}

export const userMock = (): User => {
  const user = new User(userDTOMock())

  // Spy on the methods but retain their original implementations
  vi.spyOn(user, 'getProps').mockImplementation(function (this: User) {
    return User.prototype.getProps.apply(this)
  })

  return user
}

export const userRepositoryMock = (): Mocked<IUserRepository> => {
  class UserRepositoryMock implements IUserRepository {
    getAll = vi.fn().mockResolvedValue([userMock()])
    findById = vi.fn().mockResolvedValue(userMock())
    getUserCredentialsByUserId = vi.fn().mockResolvedValue({ userId: '1', passwordHash: '1' })
    getUserCredentialsByUsername = vi.fn().mockResolvedValue({ userId: '1', passwordHash: '1' })
    findByName = vi.fn().mockResolvedValue(userMock())
    count = vi.fn().mockResolvedValue(userMock())
    insert = vi.fn().mockResolvedValue(userMock())
    update = vi.fn().mockResolvedValue(userMock())
    deactivate = vi.fn().mockResolvedValue(userMock())
    setTransaction = vi.fn()
    clearLastLoadedMap = vi.fn()
  }
  return new UserRepositoryMock()
}
