import { describe, expect, it } from 'vitest'
import { UserRole } from './UserRole'
import { InvalidUserRoleError } from '../errors/InvalidUserRoleError'
import { UserRoleEnum } from '@hatsuportal/common'

describe('UserRole', () => {
  it('can create a user role', () => {
    const role = new UserRole(UserRoleEnum.Admin)
    expect(role).to.be.instanceOf(UserRole)
    expect(role.value).to.eq(UserRoleEnum.Admin)
  })

  it('does not allow creating a user role with an empty value', () => {
    expect(() => {
      new UserRole('' as any)
    }).toThrow(InvalidUserRoleError)
    expect(() => {
      new UserRole(undefined as any)
    }).toThrow(InvalidUserRoleError)
    expect(() => {
      new UserRole(null as any)
    }).toThrow(InvalidUserRoleError)
  })

  it('does not allow creating a user role with an invalid value', () => {
    const invalidUserRoles = ['   ', 'NotAUserRole', 1, 0, -1] as any[]

    invalidUserRoles.forEach((role) => {
      expect(() => {
        new UserRole(role)
      }).toThrow(InvalidUserRoleError)
    })
  })

  it('exposes canCreate, assertCanCreate, adminRoles and equals helpers', () => {
    expect(UserRole.canCreate(UserRoleEnum.Admin)).toBe(true)
    expect(() => UserRole.assertCanCreate(UserRoleEnum.Admin)).not.toThrow()
    expect(UserRole.canCreate('NotAUserRole' as UserRoleEnum)).toBe(false)
    expect(UserRole.adminRoles()).toStrictEqual([UserRoleEnum.SuperAdmin, UserRoleEnum.Admin])
    expect(UserRole.Admin.equals(UserRole.Admin)).toBe(true)
    expect(UserRole.Admin.equals(UserRoleEnum.Admin)).toBe(true)
    expect(UserRole.Admin.equals(UserRoleEnum.Viewer)).toBe(false)
    expect(UserRole.Admin.toString()).toBe(UserRoleEnum.Admin)
  })
})
