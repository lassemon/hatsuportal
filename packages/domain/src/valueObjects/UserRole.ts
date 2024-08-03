import ValueObject from './ValueObject'
import { InvalidUserRoleError } from '../errors/InvalidUserRoleError'
import { isNonStringOrEmpty, isEnumValue, UserRoleEnum } from '@hatsuportal/common'

export class UserRole extends ValueObject<UserRoleEnum> {
  constructor(private readonly _value: UserRoleEnum) {
    super()

    if (isNonStringOrEmpty(_value) || !isEnumValue(_value, UserRoleEnum))
      throw new InvalidUserRoleError(`Value '${_value}' is not a valid user role.`)

    this._value = _value
  }

  static canCreate(_value: UserRoleEnum) {
    try {
      new UserRole(_value)
      return true
    } catch {
      return false
    }
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
