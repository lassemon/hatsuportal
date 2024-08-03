import validator from 'email-validator'
import { InvalidEmailError } from '../errors/InvalidEmailError'
import { isNonStringOrEmpty, Logger } from '@hatsuportal/foundation'
import { ValueObject } from '@hatsuportal/shared-kernel'

const logger = new Logger('Email')

interface CanCreateOptions {
  throwError?: boolean
}

export class Email extends ValueObject<string> {
  static canCreate(value: string, { throwError = false }: CanCreateOptions = {}) {
    try {
      new Email(value)
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

    if (isNonStringOrEmpty(value) || !validator.validate(value)) throw new InvalidEmailError(`Value '${value}' is not a valid email.`)
  }

  equals(other: unknown): boolean {
    return other instanceof Email && this.value === other.value
  }

  toString(): string {
    return this.value
  }
}
