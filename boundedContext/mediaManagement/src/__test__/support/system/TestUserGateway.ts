import { castToEnum, UserRoleEnum } from '@hatsuportal/common'
import { EntityLoadResult } from '@hatsuportal/platform'
import { IUserGateway } from '../../../application/acl/userManagement/IUserGateway'
import { UserLoadError } from '../../../application/acl/userManagement/errors/UserLoadError'
import { UserReadModelDTO } from '../../../application/dtos/UserReadModelDTO'
import { PersistenceHarness } from '../persistence/PersistenceHarness'

type UsersTableRow = {
  id: string
  name: string
  email: string
  roles: UserRoleEnum[]
  active: boolean | 0 | 1
  createdAt: number
  updatedAt: number
}

/**
 * Test-only IUserGateway backed by shared Postgres `users` rows (FK stubs).
 * Keeps mediaManagement system tests independent of userManagement BC code.
 */
export class TestUserGateway implements IUserGateway {
  constructor(private readonly persistenceHarness: PersistenceHarness) {}

  async getUserById(params: { userId: string }): Promise<EntityLoadResult<UserReadModelDTO, UserLoadError>> {
    try {
      const row = (await this.persistenceHarness.dataAccessProvider
        .table('users')
        .select(['id', 'name', 'email', 'roles', 'active', 'createdAt', 'updatedAt'])
        .where('id', params.userId)
        .first()) as UsersTableRow | undefined

      if (!row) {
        return EntityLoadResult.failure(
          new UserLoadError({
            userId: params.userId,
            error: new Error(`User '${params.userId}' not found`)
          })
        )
      }

      return EntityLoadResult.success({
        id: row.id,
        name: row.name,
        email: row.email,
        roles: (row.roles ?? []).map((role) => castToEnum(role, UserRoleEnum)),
        active: row.active === 1 || row.active === true,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt
      })
    } catch (error) {
      if (error instanceof Error) {
        return EntityLoadResult.failure(new UserLoadError({ userId: params.userId, error }))
      }

      return EntityLoadResult.failure(
        new UserLoadError({
          userId: params.userId,
          error: new Error('Unknown error occurred')
        })
      )
    }
  }
}

export function createTestUserGateway(persistenceHarness: PersistenceHarness): IUserGateway {
  return new TestUserGateway(persistenceHarness)
}
