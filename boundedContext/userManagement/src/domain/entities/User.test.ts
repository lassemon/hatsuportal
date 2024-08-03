import { describe, expect, it } from 'vitest'
import _ from 'lodash'
import { UserRoleEnum, uuid } from '@hatsuportal/foundation'
import { UserId } from '../valueObjects/UserId'
import { UserRole } from '../valueObjects/UserRole'

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

  it('can compare users', ({ unitFixture }) => {
    const user = unitFixture.userMock()
    const otherUser = unitFixture.userMock({
      id: new UserId(uuid()),
      roles: [new UserRole(UserRoleEnum.Moderator)]
    })
    expect(user.equals(user)).toBe(true)
    expect(user.equals(otherUser)).toBe(false)
  })

  // TODO add tests for domain methods like rename etc.

  it('can check if user is admin', ({ unitFixture }) => {
    const adminUser = unitFixture.userMock({ roles: [new UserRole(UserRoleEnum.Admin)] })
    const nonAdminUser = unitFixture.userMock({ roles: [new UserRole(UserRoleEnum.Creator)] })

    expect(adminUser.isAdmin()).toBe(true)
    expect(nonAdminUser.isAdmin()).toBe(false)
  })
})
