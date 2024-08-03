import ValueObject from './ValueObject'
import { InvalidNonNegativeIntegerError } from '../errors/InvalidNonNegativeIntegerError'
import { Logger } from '@hatsuportal/foundation'

const logger = new Logger('NonNegativeInteger')

interface CanCreateOptions {
  throwError?: boolean
}

export class NonNegativeInteger extends ValueObject<number> {
  static canCreate(value: number, { throwError = false }: CanCreateOptions = {}) {
    try {
      new NonNegativeInteger(value)
      return true
    } catch (error) {
      logger.warn(error)
      if (throwError) {
        throw error
      }
      return false
    }
  }

  constructor(public readonly value: number) {
    super()

    if (value < 0) throw new InvalidNonNegativeIntegerError(`Value '${value}' is not a valid non negative integer.`)
  }

  equals(other: unknown): boolean {
    return other instanceof NonNegativeInteger && this.value === other.value
  }

  toString(): string {
    return this.value.toString()
  }
}
