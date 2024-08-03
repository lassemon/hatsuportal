import { describe, expect, it } from 'vitest'
import { NotFoundError } from '@hatsuportal/platform'
import { UserQueryFacade } from './UserQueryFacade'
import { UserQueryMapper } from './mappers/UserQueryMapper'
import * as Fixture from '../../../__test__/testFactory'

describe('UserQueryFacade', () => {
  const createSut = () => {
    const userReadRepository = Fixture.userReadRepositoryMock()
    const userQueryMapper = new UserQueryMapper()
    const facade = new UserQueryFacade(userReadRepository, userQueryMapper)
    return { userReadRepository, facade }
  }

  it('returns mapped user contract when found', async () => {
    const { userReadRepository, facade } = createSut()
    const user = Fixture.userReadModelDTOMock()
    userReadRepository.findById.mockResolvedValue(user)

    await expect(facade.getUserById({ userId: Fixture.sampleUserId })).resolves.toStrictEqual({
      id: user.id,
      name: user.name,
      email: user.email,
      roles: user.roles,
      active: user.active,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    })
  })

  it('throws NotFoundError when user is missing', async () => {
    const { userReadRepository, facade } = createSut()
    userReadRepository.findById.mockResolvedValue(null)

    await expect(facade.getUserById({ userId: Fixture.sampleUserId })).rejects.toBeInstanceOf(NotFoundError)
  })
})
