import { describe, expect, it } from 'vitest'
import { UserApplicationMapper } from './UserApplicationMapper'
import { User } from '../../domain'
import { UserFactory } from '../services/UserFactory'

describe('UserApplicationMapper', () => {
  const userMapper = new UserApplicationMapper(new UserFactory())

  it('converts user entity to dto', ({ unitFixture }) => {
    const user = User.create(unitFixture.userDTOMock())
    const result = userMapper.toDTO(user)
    expect(typeof result).toBe('object')
    expect(result).toStrictEqual(unitFixture.userDTOMock())
  })

  it('converts dto into user entity', ({ unitFixture }) => {
    const user = userMapper.dtoToDomainEntity(unitFixture.userDTOMock())
    expect(user).toBeInstanceOf(User)
    expect({
      id: user.id.value,
      name: user.name.value,
      email: user.email.value,
      roles: user.roles.map((role) => role.value),
      active: user.active,
      createdAt: user.createdAt.value,
      updatedAt: user.updatedAt?.value ?? null
    }).toStrictEqual(unitFixture.userDTOMock())
  })
})
