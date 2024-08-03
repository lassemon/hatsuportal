import { isNonStringOrEmpty, Logger } from '@hatsuportal/common'
import ValueObject from './ValueObject'
import { InvalidNonEmptyStringError } from '../errors/InvalidNonEmptyStringError'

const logger = new Logger('NonEmptyString')

export class NonEmptyString extends ValueObject<string> {
  static canCreate(value: string): boolean {
    try {
      new NonEmptyString(value)
      return true
    } catch (error) {
      logger.warn(error)
      return false
    }
  }

  constructor(public readonly value: string) {
    super()

    if (isNonStringOrEmpty(value)) throw new InvalidNonEmptyStringError(`Value '${value}' is not a valid non empty string.`)
  }

  equals(other: unknown): boolean {
    return other instanceof NonEmptyString && this.value === other.value
  }

  toString(): string {
    return this.value
  }
}
