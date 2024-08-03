import { isNonStringOrEmpty } from '@hatsuportal/common'
import ValueObject from './ValueObject'
import { InvalidMimeTypeError } from '../errors/InvalidMimeTypeError'

//TODO implement all allowed mime types and subtypes validation?

export class MimeType extends ValueObject<string> {
  static canCreate(value: string): boolean {
    try {
      MimeType.assertCanCreate(value)
      return true
    } catch (error) {
      return false
    }
  }

  static assertCanCreate(value: string): void {
    new MimeType(value)
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

  get fileExtension(): string {
    const mimeToExtension: Record<string, string> = {
      'image/jpg': 'jpg',
      'image/jpeg': 'jpg',
      'image/png': 'png',
      'image/gif': 'gif',
      'image/webp': 'webp',
      'video/mp4': 'mp4',
      'video/webm': 'webm',
      'video/ogg': 'ogg',
      'video/quicktime': 'mov',
      'video/x-msvideo': 'avi',
      'video/x-matroska': 'mkv',
      'video/x-flv': 'flv',
      'video/x-ms-wmv': 'wmv'
    }

    const extension = mimeToExtension[this.value]
    if (!extension) {
      throw new InvalidMimeTypeError(`Unsupported mime type: '${this.value}'`)
    }
    return extension
  }

  equals(other: unknown): boolean {
    return other instanceof MimeType && this.value === other.value
  }

  toString(): string {
    return this.value
  }
}
