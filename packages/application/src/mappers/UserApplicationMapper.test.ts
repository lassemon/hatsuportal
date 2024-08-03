import { describe, expect, it } from 'vitest'
import { User } from '@hatsuportal/domain'
import { UserApplicationMapper } from './UserApplicationMapper'

describe('UserApplicationMapper', () => {
  const userMapper = new UserApplicationMapper()

  it('converts user entity to dto', ({ unitFixture }) => {
    const user = new User(unitFixture.userDTO())
    const result = userMapper.toDTO(user)
    expect(typeof result).toBe('object')
    expect(result).toStrictEqual(unitFixture.userDTO())
  })

  it('converts dto into user entity', ({ unitFixture }) => {
    const user = userMapper.toDomainEntity(unitFixture.userDTO())
    expect(user).toBeInstanceOf(User)
    expect({
      id: user.id.value,
      name: user.name.value,
      email: user.email.value,
      roles: user.roles.map((role) => role.value),
      active: user.active,
      createdAt: user.createdAt.value,
      updatedAt: user.updatedAt?.value ?? null
    }).toStrictEqual(unitFixture.userDTO())
  })
})
