import { isNumber, Logger } from '@hatsuportal/foundation'
import ValueObject from './ValueObject'
import { InvalidFileSizeError } from '../errors/InvalidFileSizeError'

const logger = new Logger('FileSize')

interface CanCreateOptions {
  throwError?: boolean
}

export class FileSize extends ValueObject<number> {
  static canCreate(value: number, { throwError = false }: CanCreateOptions = {}) {
    try {
      new FileSize(value)
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

    if (!isNumber(value) || !value || value <= 0) throw new InvalidFileSizeError(`Value '${value}' is not a valid file size.`)
  }

  equals(other: unknown): boolean {
    return other instanceof FileSize && this.value === other.value
  }

  toString(): string {
    return this.value.toString()
  }
}
