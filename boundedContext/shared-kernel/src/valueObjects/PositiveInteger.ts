import ValueObject from './ValueObject'
import { InvalidPositiveIntegerError } from '../errors/InvalidPositiveIntegerError'
import { Logger } from '@hatsuportal/foundation'

const logger = new Logger('PositiveInteger')

interface CanCreateOptions {
  throwError?: boolean
}

export class PositiveInteger extends ValueObject<number> {
  static canCreate(value: number, { throwError = false }: CanCreateOptions = {}) {
    try {
      new PositiveInteger(value)
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

    if (value <= 0) throw new InvalidPositiveIntegerError(`Value '${value}' is not a valid positive integer.`)
  }

  equals(other: unknown): boolean {
    return other instanceof PositiveInteger && this.value === other.value
  }

  toString(): string {
    return this.value.toString()
  }
}
