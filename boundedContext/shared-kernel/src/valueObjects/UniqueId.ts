import { isNonStringOrEmpty, Logger } from '@hatsuportal/foundation'
import { ValueObject } from './ValueObject'
import { InvalidUniqueIdError } from '../errors/InvalidUniqueIdError'

const logger = new Logger('UniqueId')

interface CanCreateOptions {
  throwError?: boolean
}

export class UniqueId extends ValueObject<string> {
  static canCreate(value: string, { throwError = false }: CanCreateOptions = {}) {
    try {
      new UniqueId(value)
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

    if (isNonStringOrEmpty(value)) throw new InvalidUniqueIdError(`Value '${value}' is not a valid unique id for ${this.constructor.name}.`)

    // 36 characters is the uuid v4 standard length
    if (value.length < 36) throw new InvalidUniqueIdError(`Value '${value}' is too short.`)
  }

  equals(other: unknown): boolean {
    return other instanceof UniqueId && this.value === other.value
  }

  toString(): string {
    return this.value
  }
}
