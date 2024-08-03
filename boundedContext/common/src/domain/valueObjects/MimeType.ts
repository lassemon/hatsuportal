import { isNonStringOrEmpty, Logger } from '@hatsuportal/common'
import ValueObject from './ValueObject'
import { InvalidMimeTypeError } from '../errors/InvalidMimeTypeError'

const logger = new Logger('MimeType')
//TODO implement all allowed mime types and subtypes validation?

export class MimeType extends ValueObject<string> {
  static canCreate(value: string) {
    try {
      new MimeType(value)
      return true
    } catch (error) {
      logger.warn(error)
      return false
    }
  }

  constructor(public readonly value: string) {
    super()

    if (isNonStringOrEmpty(value)) throw new InvalidMimeTypeError(`Value '${value}' is not a valid mime type.`)

    const pattern = /^[a-zA-Z0-9!#$&^_.+-]+\/[a-zA-Z0-9!#$&^_.+-]+$/
    if (!pattern.test(value)) throw new InvalidMimeTypeError(`Value '${value}' is not a valid mime type.`)

    this.value = value
  }

  get type(): string {
    return this.value.split('/')[0]
  }

  get subtype(): string {
    return this.value.split('/')[1]
  }

  equals(other: unknown): boolean {
    return other instanceof MimeType && this.value === other.value
  }

  toString(): string {
    return this.value
  }
}
