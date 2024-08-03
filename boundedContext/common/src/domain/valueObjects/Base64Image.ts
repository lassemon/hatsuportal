import ValueObject from './ValueObject'
import { BASE64_PREFIX, isNonStringOrEmpty, Logger, truncateString } from '@hatsuportal/common'
import { InvalidBase64ImageError } from '../errors/InvalidBase64ImageError'

const logger = new Logger('Base64Image')

interface CanCreateOptions {
  throwError?: boolean
}

export class Base64Image extends ValueObject<string> {
  static canCreate(value: string, { throwError = false }: CanCreateOptions = {}) {
    try {
      new Base64Image(value)
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

    if (isNonStringOrEmpty(value) || !value.startsWith(BASE64_PREFIX) || value === BASE64_PREFIX)
      throw new InvalidBase64ImageError(`Value '${truncateString(value, 100)}' is not a valid base 64 encoded image.`)
  }

  equals(other: unknown): boolean {
    return other instanceof Base64Image && this.value === other.value
  }

  toString(): string {
    return this.value
  }
}
