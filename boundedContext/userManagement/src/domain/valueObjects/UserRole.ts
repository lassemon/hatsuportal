import { isNonStringOrEmpty, isEnumValue, UserRoleEnum, Logger } from '@hatsuportal/common'
import { InvalidUserRoleError } from '../errors/InvalidUserRoleError'
import { ValueObject } from '@hatsuportal/common-bounded-context'

const logger = new Logger('UserRole')

export class UserRole extends ValueObject<UserRoleEnum> {
  static canCreate(value: UserRoleEnum) {
    try {
      new UserRole(value)
      return true
    } catch (error) {
      logger.warn(error)
      return false
    }
  }

  constructor(private readonly _value: UserRoleEnum) {
    super()

    if (isNonStringOrEmpty(_value) || !isEnumValue(_value, UserRoleEnum))
      throw new InvalidUserRoleError(`Value '${_value}' is not a valid user role.`)

    this._value = _value
  }

  static adminRoles() {
    return [UserRoleEnum.SuperAdmin, UserRoleEnum.Admin]
  }

  get value(): UserRoleEnum {
    return this._value
  }

  equals(other: unknown): boolean {
    if (other instanceof UserRole) {
      return this._value === other.value
    }
    return this._value === other
  }

  toString(): UserRoleEnum {
    return this._value
  }
}
