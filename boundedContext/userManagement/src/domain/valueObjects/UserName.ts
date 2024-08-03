import { isNonStringOrEmpty, Logger } from '@hatsuportal/foundation'
import { InvalidUserNameError } from '../errors/InvalidUserNameError'
import { ValueObject } from '@hatsuportal/shared-kernel'

const logger = new Logger('UserName')

interface CanCreateOptions {
  throwError?: boolean
}

export class UserName extends ValueObject<string> {
  static canCreate(value: string, { throwError = false }: CanCreateOptions = {}) {
    try {
      new UserName(value)
      return true
    } catch (error) {
      logger.warn(error)
      if (throwError) {
        throw error
      }
      return false
    }
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
