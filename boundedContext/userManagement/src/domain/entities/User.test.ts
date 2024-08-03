import { describe, expect, it } from 'vitest'
import { User } from './User'
import { UserRoleEnum, uuid } from '@hatsuportal/common'
import { InvalidUserNameError } from '../errors/InvalidUserNameError'
import { InvalidUserRoleError } from '../errors/InvalidUserRoleError'
import _ from 'lodash'
import { InvalidUserIdError } from '../errors/InvalidUserIdError'
import { InvalidEmailError } from '../errors/InvalidEmailError'
import { InvalidRoleListError } from '../errors/InvalidRoleListError'
import { InvalidUnixTimestampError } from '@hatsuportal/common-bounded-context'

describe('User', () => {
  it('can create user with all properties', ({ unitFixture }) => {
    const user = unitFixture.userMock()
    expect(user.id.value).toBe(unitFixture.userDTOMock().id)
    expect(user.name.value).toBe(unitFixture.userDTOMock().name)
    expect(user.email.value).toBe(unitFixture.userDTOMock().email)
    expect(user.roles.map((role) => role.value)).toStrictEqual(unitFixture.userDTOMock().roles)
    expect(user.active).toBe(unitFixture.userDTOMock().active)
    expect(user.createdAt.value).toBe(unitFixture.userDTOMock().createdAt)
    expect(user.updatedAt?.value).toBe(unitFixture.userDTOMock().updatedAt)
  })

  it('fails to create a user without an id', ({ unitFixture }) => {
    const { id, ...userWithoutId } = unitFixture.userDTOMock()
    expect(() => {
      User.create(userWithoutId as any)
    }).toThrow(InvalidUserIdError)
  })

  it('fails to create a user without a name', ({ unitFixture }) => {
    const { name, ...userWithoutName } = unitFixture.userDTOMock()
    expect(() => {
      User.create(userWithoutName as any)
    }).toThrow(InvalidUserNameError)
  })

  it('fails to create a user without an email.', ({ unitFixture }) => {
    const { email, ...userWithoutEmail } = unitFixture.userDTOMock()
    expect(() => {
      User.create(userWithoutEmail as any)
    }).toThrow(InvalidEmailError)
  })

  it('fails to create a user without roles', ({ unitFixture }) => {
    const { roles, ...userWithoutRoles } = unitFixture.userDTOMock()
    expect(() => {
      User.create(userWithoutRoles as any)
    }).toThrow(InvalidRoleListError)
    expect(() => {
      User.create({ ...userWithoutRoles, roles: [] })
    }).toThrow(InvalidRoleListError)
  })

  it('fails to create a user with an invalid role value', ({ unitFixture }) => {
    const user = unitFixture.userDTOMock()
    expect(() => {
      User.create({ ...user, roles: [...user.roles, 'NotAaValidRole'] } as any)
    }).toThrow(InvalidUserRoleError)
  })

  it('fails to create a user without a creation time', ({ unitFixture }) => {
    const { createdAt, ...userWithoutCreationTime } = unitFixture.userDTOMock()
    expect(() => {
      User.create(userWithoutCreationTime as any)
    }).toThrow(InvalidUnixTimestampError)
  })

  it('can compare users', ({ unitFixture }) => {
    const user = User.create(unitFixture.userDTOMock())
    const otherUser = User.create({
      ...unitFixture.userDTOMock(),
      id: uuid(),
      roles: [UserRoleEnum.Moderator]
    })
    expect(user.equals(user)).toBe(true)
    expect(user.equals(otherUser)).toBe(false)
  })

  it('can check if user is admin', ({ unitFixture }) => {
    const adminUser = User.create({ ...unitFixture.userDTOMock(), roles: [UserRoleEnum.Admin] })
    const nonAdminUser = User.create({ ...unitFixture.userDTOMock(), roles: [UserRoleEnum.Creator] })

    expect(adminUser.isAdmin()).toBe(true)
    expect(nonAdminUser.isAdmin()).toBe(false)
  })
})
