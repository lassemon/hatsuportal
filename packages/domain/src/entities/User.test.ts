import { describe, expect, it } from 'vitest'
import { User } from './User'
import { UserRoleEnum, uuid } from '@hatsuportal/common'
import { InvalidUnixTimestampError } from '../errors/InvalidUnixTimestampError'
import { InvalidRoleListError } from '../errors/InvalidRoleListError'
import { InvalidEmailError } from '../errors/InvalidEmailError'
import { InvalidUserNameError } from '../errors/InvalidUserNameError'
import { InvalidUserRoleError } from '../errors/InvalidUserRoleError'
import _ from 'lodash'
import { InvalidUserIdError } from '../errors/InvalidUserIdError'

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
      new User(userWithoutId as any)
    }).toThrow(InvalidUserIdError)
  })

  it('fails to create a user without a name', ({ unitFixture }) => {
    const { name, ...userWithoutName } = unitFixture.userDTOMock()
    expect(() => {
      new User(userWithoutName as any)
    }).toThrow(InvalidUserNameError)
  })

  it('fails to create a user without an email.', ({ unitFixture }) => {
    const { email, ...userWithoutEmail } = unitFixture.userDTOMock()
    expect(() => {
      new User(userWithoutEmail as any)
    }).toThrow(InvalidEmailError)
  })

  it('fails to create a user without roles', ({ unitFixture }) => {
    const { roles, ...userWithoutRoles } = unitFixture.userDTOMock()
    expect(() => {
      new User(userWithoutRoles as any)
    }).toThrow(InvalidRoleListError)
    expect(() => {
      new User({ ...userWithoutRoles, roles: [] })
    }).toThrow(InvalidRoleListError)
  })

  it('fails to create a user with an invalid role value', ({ unitFixture }) => {
    const user = unitFixture.userDTOMock()
    expect(() => {
      new User({ ...user, roles: [...user.roles, 'NotAaValidRole'] } as any)
    }).toThrow(InvalidUserRoleError)
  })

  it('fails to create a user without a creation time', ({ unitFixture }) => {
    const { createdAt, ...userWithoutCreationTime } = unitFixture.userDTOMock()
    expect(() => {
      new User(userWithoutCreationTime as any)
    }).toThrow(InvalidUnixTimestampError)
  })

  it('can compare users', ({ unitFixture }) => {
    const user = new User(unitFixture.userDTOMock())
    const otherUser = new User({
      ...unitFixture.userDTOMock(),
      id: uuid(),
      roles: [UserRoleEnum.Moderator]
    })
    expect(user.equals(user)).toBe(true)
    expect(user.equals(otherUser)).toBe(false)
  })

  it('can check if user is admin', ({ unitFixture }) => {
    const adminUser = new User({ ...unitFixture.userDTOMock(), roles: [UserRoleEnum.Admin] })
    const nonAdminUser = new User({ ...unitFixture.userDTOMock(), roles: [UserRoleEnum.Creator] })

    expect(adminUser.isAdmin()).toBe(true)
    expect(nonAdminUser.isAdmin()).toBe(false)
  })
})
