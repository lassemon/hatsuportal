import { InputLimits } from '@hatsuportal/contracts'
import { isNonStringOrEmpty } from '@hatsuportal/common'
import { UserNameEmptyError } from '../errors/UserNameEmptyError'
import { UserNameTooLongError } from '../errors/UserNameTooLongError'
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

  readonly value: string

  constructor(raw: string) {
    super()

    if (typeof raw !== 'string') throw new UserNameEmptyError(`Value '${raw}' is not a valid user name.`)

    const trimmed = raw.trim()
    if (isNonStringOrEmpty(trimmed)) throw new UserNameEmptyError(`Value '${raw}' is not a valid user name.`)
    if (trimmed.length > InputLimits.userName) {
      throw new UserNameTooLongError(`User name must be at most ${InputLimits.userName} characters.`)
    }

    this.value = trimmed
  }

  equals(other: unknown): boolean {
    return other instanceof UserName && this.value === other.value
  }

  toString(): string {
    return this.value
  }
}
