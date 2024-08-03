import { describe, expect, it } from 'vitest'
import { UserQueryMapper } from './UserQueryMapper'
import * as Fixture from '../../../../__test__/testFactory'

describe('UserQueryMapper', () => {
  const mapper = new UserQueryMapper()

  it('maps user read model to user contract', () => {
    const user = Fixture.userReadModelDTOMock()
    expect(mapper.toUserContract(user)).toStrictEqual({
      id: user.id,
      name: user.name,
      email: user.email,
      roles: user.roles,
      active: user.active,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    })
  })
})
