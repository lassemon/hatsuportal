import { isNonStringOrEmpty, isEnumValue, UserRoleEnum, Logger } from '@hatsuportal/common'
import { InvalidUserRoleError } from '../errors/InvalidUserRoleError'
import { ValueObject } from '@hatsuportal/common-bounded-context'

const logger = new Logger('UserRole')

interface CanCreateOptions {
  throwError?: boolean
}

export class UserRole extends ValueObject<UserRoleEnum> {
  static canCreate(value: UserRoleEnum, { throwError = false }: CanCreateOptions = {}) {
    try {
      new UserRole(value)
      return true
    } catch (error) {
      logger.warn(error)
      if (throwError) {
        throw error
      }
      return false
    }
  }

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
