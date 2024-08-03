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
    const user = new User(unitFixture.userDTO())
    expect(user.id.value).toBe(unitFixture.userDTO().id)
    expect(user.name.value).toBe(unitFixture.userDTO().name)
    expect(user.email.value).toBe(unitFixture.userDTO().email)
    expect(user.roles.map((role) => role.value)).toStrictEqual(unitFixture.userDTO().roles)
    expect(user.active).toBe(unitFixture.userDTO().active)
    expect(user.createdAt.value).toBe(unitFixture.userDTO().createdAt)
    expect(user.updatedAt?.value).toBe(unitFixture.userDTO().updatedAt)
  })

  it('fails to create a user without an id', ({ unitFixture }) => {
    const { id, ...userWithoutId } = unitFixture.userDTO()
    expect(() => {
      new User(userWithoutId as any)
    }).toThrow(InvalidUserIdError)
  })

  it('fails to create a user without a name', ({ unitFixture }) => {
    const { name, ...userWithoutName } = unitFixture.userDTO()
    expect(() => {
      new User(userWithoutName as any)
    }).toThrow(InvalidUserNameError)
  })

  it('fails to create a user without an email.', ({ unitFixture }) => {
    const { email, ...userWithoutEmail } = unitFixture.userDTO()
    expect(() => {
      new User(userWithoutEmail as any)
    }).toThrow(InvalidEmailError)
  })

  it('fails to create a user without roles', ({ unitFixture }) => {
    const { roles, ...userWithoutRoles } = unitFixture.userDTO()
    expect(() => {
      new User(userWithoutRoles as any)
    }).toThrow(InvalidRoleListError)
    expect(() => {
      new User({ ...userWithoutRoles, roles: [] })
    }).toThrow(InvalidRoleListError)
  })

  it('fails to create a user with an invalid role value', ({ unitFixture }) => {
    const user = unitFixture.userDTO()
    expect(() => {
      new User({ ...user, roles: [...user.roles, 'NotAaValidRole'] } as any)
    }).toThrow(InvalidUserRoleError)
  })

  it('fails to create a user without a creation time', ({ unitFixture }) => {
    const { createdAt, ...userWithoutCreationTime } = unitFixture.userDTO()
    expect(() => {
      new User(userWithoutCreationTime as any)
    }).toThrow(InvalidUnixTimestampError)
  })

  it('can compare users', ({ unitFixture }) => {
    const user = new User(unitFixture.userDTO())
    const otherUser = new User({
      ...unitFixture.userDTO(),
      id: uuid(),
      roles: [UserRoleEnum.Moderator]
    })
    expect(user.equals(user)).toBe(true)
    expect(user.equals(otherUser)).toBe(false)
  })

  it('can check if user is admin', ({ unitFixture }) => {
    const adminUser = new User({ ...unitFixture.userDTO(), roles: [UserRoleEnum.Admin] })
    const nonAdminUser = new User({ ...unitFixture.userDTO(), roles: [UserRoleEnum.Creator] })

    expect(adminUser.isAdmin()).toBe(true)
    expect(nonAdminUser.isAdmin()).toBe(false)
  })
})
