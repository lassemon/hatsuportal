import { isNonStringOrEmpty } from '@hatsuportal/common'
import ValueObject from './ValueObject'
import { InvalidMimeTypeError } from '../errors/InvalidMimeTypeError'

//TODO implement all allowed mime types and subtypes validation?

export class MimeType extends ValueObject<string> {
  public static readonly UNKNOWN = new MimeType('UNKNOWN_MIME_TYPE')
  public static readonly UNKNOWN_FILE_EXTENSION = 'UNKNOWN_FILE_EXTENSION'

  private static readonly MIME_ALIASES: Record<string, string> = {
    'image/jpg': 'image/jpeg'
  }

  private static readonly MIME_TO_EXTENSION: Record<string, string> = {
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

  private static readonly EXTENSION_TO_MIME: Record<string, string> = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    webp: 'image/webp',
    mp4: 'video/mp4',
    webm: 'video/webm',
    ogg: 'video/ogg',
    mov: 'video/quicktime',
    avi: 'video/x-msvideo',
    mkv: 'video/x-matroska',
    flv: 'video/x-flv',
    wmv: 'video/x-ms-wmv'
  }

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

  static fromString(raw: string): MimeType {
    return new MimeType(raw)
  }

  static fromFileExtension(extension: string): MimeType {
    const ext = extension.replace(/^\./, '').toLowerCase()
    const mime = MimeType.EXTENSION_TO_MIME[ext]
    if (!mime) {
      throw new InvalidMimeTypeError(`Value '${extension}' is not a recognized file extension.`)
    }
    return new MimeType(mime)
  }

  private static normalize(raw: string): string {
    const lower = raw.trim().toLowerCase()
    return MimeType.MIME_ALIASES[lower] ?? lower
  }

  constructor(public readonly value: string) {
    super()

    if (value === 'UNKNOWN_MIME_TYPE') {
      this.value = value
      return
    }

    if (isNonStringOrEmpty(value)) throw new InvalidMimeTypeError(`Value '${value}' is not a valid mime type.`)

    const normalized = MimeType.normalize(value)

    const pattern = /^[a-zA-Z0-9!#$&^_.+-]+\/[a-zA-Z0-9!#$&^_.+-]+$/
    if (!pattern.test(normalized)) throw new InvalidMimeTypeError(`Value '${value}' is not a valid mime type.`)

    this.value = normalized
  }

  get type(): string {
    return this.value.split('/')[0]
  }

  get subtype(): string {
    return this.value.split('/')[1]
  }

  get fileExtension(): string {
    const extension = MimeType.MIME_TO_EXTENSION[this.value]
    if (!extension) {
      return MimeType.UNKNOWN_FILE_EXTENSION
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
