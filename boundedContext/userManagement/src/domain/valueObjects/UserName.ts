import { isNonStringOrEmpty } from '@hatsuportal/common'
import { InvalidUserNameError } from '../errors/InvalidUserNameError'
import { ValueObject } from '@hatsuportal/shared-kernel'

export class UserName extends ValueObject<string> {
  static canCreate(value: string): boolean {
    try {
      UserName.assertCanCreate(value)
      return true
    } catch (error) {
      return false
    }
  }

  static assertCanCreate(value: string): void {
    new UserName(value)
  }

  constructor(public readonly value: string) {
    super()

    if (isNonStringOrEmpty(value)) throw new InvalidUserNameError(`Value '${value}' is not a valid user name.`)
  }

  equals(other: unknown): boolean {
    return other instanceof UserName && this.value === other.value
  }

  toString(): string {
    return this.value
  }
}
