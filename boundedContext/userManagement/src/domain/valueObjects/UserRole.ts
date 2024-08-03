import { isEnumValue, isNonStringOrEmpty } from '@hatsuportal/common'
import { UserRoleEnum } from '@hatsuportal/common'
import { InvalidUserRoleError } from '../errors/InvalidUserRoleError'
import { ValueObject } from '@hatsuportal/shared-kernel'

export class UserRole extends ValueObject<UserRoleEnum> {
  static canCreate(value: UserRoleEnum): boolean {
    try {
      UserRole.assertCanCreate(value)
      return true
    } catch (error) {
      return false
    }
  }

  static assertCanCreate(value: UserRoleEnum): void {
    new UserRole(value)
  }

  // TODO, static roles like UserRole.Admin etc.

  constructor(public readonly value: UserRoleEnum) {
    super()

    if (isNonStringOrEmpty(value) || !isEnumValue(value, UserRoleEnum))
      throw new InvalidUserRoleError(`Value '${value}' is not a valid user role.`)
  }

  static adminRoles() {
    return [UserRoleEnum.SuperAdmin, UserRoleEnum.Admin]
  }

  equals(other: unknown): boolean {
    if (other instanceof UserRole) {
      return this.value === other.value
    }
    return this.value === other
  }

  toString(): UserRoleEnum {
    return this.value
  }
}
