import { describe, expect, it } from 'vitest'
import { UserQueryMapper } from './UserQueryMapper'
import * as Fixture from '../../../../__test__/testFactory'

describe('UserQueryMapper', () => {
  const mapper = new UserQueryMapper()

  it('maps user entity to user contract', () => {
    const user = Fixture.userMock()
    expect(mapper.toUserContract(user)).toStrictEqual({
      id: user.id.toString(),
      name: user.name.toString(),
      email: user.email.toString(),
      roles: user.roles.map((role) => role.toString()),
      active: user.active,
      createdAt: user.createdAt.value,
      updatedAt: user.updatedAt.value
    })
  })
})
