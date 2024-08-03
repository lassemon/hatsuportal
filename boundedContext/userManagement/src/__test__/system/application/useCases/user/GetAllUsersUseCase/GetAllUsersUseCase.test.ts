import { describe, expect, it } from 'vitest'
import { AuthorizationError } from '@hatsuportal/platform'
import { UserRoleEnum, uuid } from '@hatsuportal/common'
import { Password, UserRole } from '../../../../../../domain'
import * as Fixture from '../../../../../testFactory'
import { systemWiring } from '../../../../../setup.system'

describe('GetAllUsersUseCase (system)', () => {
  async function seedPersistedUser(roles: UserRoleEnum[] = [UserRoleEnum.Viewer]) {
    const user = Fixture.userMock({
      roles: roles.map((role) => new UserRole(role))
    })

    await systemWiring.persistenceHarness.createUnitOfWork().execute(async () => {
      await systemWiring.userWriteRepository.insert(user, Password.create('ValidPassword123'))
      return [user]
    })

    return user
  }

  it('returns all users for a persisted admin via GetAllUsersUseCaseWithValidation', async () => {
    const admin = await seedPersistedUser([UserRoleEnum.Admin])
    const targetEmail = `getall-${uuid().slice(0, 8)}@hatsuportal.test`

    await systemWiring.createCreateUserUseCase().execute({
      createdById: admin.id.value,
      createUserInput: {
        name: `listed-${uuid().slice(0, 8)}`,
        email: targetEmail,
        password: 'ValidPassword123',
        roles: []
      },
      userCreated: () => undefined
    })

    const found: { email: string }[] = []
    await systemWiring.createGetAllUsersUseCaseWithValidation().execute({
      loggedInUserId: admin.id.value,
      allUsers: (users) => found.push(...users)
    })

    expect(found.some((user) => user.email === targetEmail)).toBe(true)
  })

  it('throws AuthorizationError for a persisted viewer via GetAllUsersUseCaseWithValidation', async () => {
    const viewer = await seedPersistedUser([UserRoleEnum.Viewer])

    await expect(
      systemWiring.createGetAllUsersUseCaseWithValidation().execute({
        loggedInUserId: viewer.id.value,
        allUsers: () => undefined
      })
    ).rejects.toBeInstanceOf(AuthorizationError)
  })
})
