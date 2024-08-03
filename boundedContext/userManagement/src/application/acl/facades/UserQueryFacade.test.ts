import { describe, expect, it } from 'vitest'
import { NotFoundError } from '@hatsuportal/platform'
import { UserQueryFacade } from './UserQueryFacade'
import { UserQueryMapper } from './mappers/UserQueryMapper'
import * as Fixture from '../../../__test__/testFactory'

describe('UserQueryFacade', () => {
  const createSut = () => {
    const userRepository = Fixture.userRepositoryMock()
    const userQueryMapper = new UserQueryMapper()
    const facade = new UserQueryFacade(userRepository, userQueryMapper)
    return { userRepository, facade }
  }

  it('returns mapped user contract when found', async () => {
    const { userRepository, facade } = createSut()
    const user = Fixture.userMock()
    userRepository.findById.mockResolvedValue(user)

    await expect(facade.getUserById({ userId: Fixture.sampleUserId })).resolves.toStrictEqual({
      id: user.id.toString(),
      name: user.name.toString(),
      email: user.email.toString(),
      roles: user.roles.map((role) => role.toString()),
      active: user.active,
      createdAt: user.createdAt.value,
      updatedAt: user.updatedAt.value
    })
  })

  it('throws NotFoundError when user is missing', async () => {
    const { userRepository, facade } = createSut()
    userRepository.findById.mockResolvedValue(null)

    await expect(facade.getUserById({ userId: Fixture.sampleUserId })).rejects.toBeInstanceOf(NotFoundError)
  })
})
