import ValueObject from './ValueObject'
import { isNonStringOrEmpty } from '@hatsuportal/common'
import { InvalidBase64ImageError } from '../errors/InvalidBase64ImageError'

export interface Base64ImageOptions {
  maximumBytes?: number // e.g., 50 * 1024 * 1024
  allowSvg?: boolean // default false if you want safer defaults
  allowUnknownSignature?: boolean // default true to support “any possible” image/*
}

function canonicalizeMimeType(mimeTypeRaw: string): string {
  const mime = mimeTypeRaw.toLowerCase()
  if (mime === 'image/jpg') return 'image/jpeg'
  return mime
}

function padBase64IfNeeded(raw: string): string {
  const payload = raw.replace(/\s+/g, '')
  const remainder = payload.length % 4
  if (remainder === 0) return payload
  if (remainder === 1) {
    // This can never be a valid base64 string
    throw new InvalidBase64ImageError('Base64 payload has an invalid length (mod 4 == 1).')
  }
  // remainder 2 -> need '==', remainder 3 -> need '='
  return payload + '='.repeat(4 - remainder)
}

/**
 * Estimate decoded byte length of base64 without decoding.
 * - Every 4 chars => 3 bytes, minus padding.
 */
function estimateDecodedBytesLength(base64Payload: string): number {
  const clean = base64Payload.replace(/\s+/g, '')
  const padding = clean.endsWith('==') ? 2 : clean.endsWith('=') ? 1 : 0
  return Math.floor((clean.length / 4) * 3) - padding
}

const IMAGE_MIME_REGEX = /^image\/[A-Za-z0-9][\w!#$&^.+-]*$/

export class Base64Image extends ValueObject<string> {
  public readonly value: string
  private readonly _bytes: Uint8Array

  static canCreate(value: string, options?: Base64ImageOptions): boolean {
    try {
      Base64Image.assertCanCreate(value, options)
      return true
    } catch (error) {
      return false
    }
  }

  static assertCanCreate(value: string, options?: Base64ImageOptions): void {
    Base64Image.create(value, options)
  }

  public static create(dataUrl: string, options?: Base64ImageOptions): Base64Image {
    const normalizedDataUrl = Base64Image.trimAndNormalize(dataUrl)
    if (isNonStringOrEmpty(normalizedDataUrl)) {
      throw new InvalidBase64ImageError(`Value '${normalizedDataUrl}' is not a valid base 64 encoded image.`)
    }
    const parsed = Base64Image.parseDataUrl(normalizedDataUrl)

    const canonicalMime = canonicalizeMimeType(parsed.mimeType)

    Base64Image.ensureMimeTypeIsValidImage(canonicalMime)

    if (canonicalMime === 'image/svg+xml' && !options?.allowSvg) {
      throw new InvalidBase64ImageError('image/svg+xml is not allowed in Base64Image by default.')
    }

    Base64Image.ensureHasBase64Flag(parsed.hasBase64Flag)

    // Accept unpadded input; pad if needed
    Base64Image.ensureBase64Alphabet(parsed.base64Payload)
    const paddedPayload = padBase64IfNeeded(parsed.base64Payload)

    // Preflight length before decoding to avoid big allocations
    const estimatedBytes = estimateDecodedBytesLength(paddedPayload)
    const maximumBytes = options?.maximumBytes ?? 50 * 1024 * 1024
    if (estimatedBytes > maximumBytes) {
      throw new InvalidBase64ImageError(`Image exceeds maximum allowed size of ${maximumBytes} bytes (estimated ${estimatedBytes}).`)
    }

    const decodedBytes = Base64Image.decodeBase64(paddedPayload)

    Base64Image.ensureWithinSize(decodedBytes, maximumBytes)

    Base64Image.ensureNonEmpty(decodedBytes)

    return new Base64Image(`data:${canonicalMime};base64,${paddedPayload}`, canonicalMime, decodedBytes)
  }

  private constructor(public readonly dataUrl: string, public readonly mimeType: string, decodedBytes: Uint8Array) {
    super()
    this.value = dataUrl
    this._bytes = decodedBytes
  }

  public get bytes(): Uint8Array {
    // Return a defensive copy to maintain VO immutability
    return new Uint8Array(this._bytes)
  }

  private static trimAndNormalize(input: string): string {
    // Remove leading/trailing whitespace and collapse internal CR/LF or spaces in the base64 part
    // Data URLs should not contain whitespace, but people paste weird things.
    return input?.trim?.() ?? ''
  }

  private static parseDataUrl(input: string): {
    mimeType: string
    hasBase64Flag: boolean
    base64Payload: string
  } {
    if (!input.startsWith('data:')) {
      throw new InvalidBase64ImageError("Value is not a data URL starting with 'data:'.")
    }

    const commaIndex = input.indexOf(',')
    if (commaIndex === -1) {
      throw new InvalidBase64ImageError('Data URL missing comma separator.')
    }

    const header = input.slice(5, commaIndex) // after "data:"
    const payload = input.slice(commaIndex + 1)

    // header example: "image/jpeg;base64"
    const headerParts = header.split(';')
    const mimeType = (headerParts[0] || '').trim()
    const hasBase64Flag = headerParts.some((p) => p.toLowerCase() === 'base64')

    if (mimeType.length === 0) {
      throw new InvalidBase64ImageError('Data URL missing MIME type.')
    }

    return {
      mimeType,
      hasBase64Flag,
      base64Payload: payload.replace(/\s+/g, '') // strip any whitespace in payload
    }
  }

  private static ensureMimeTypeIsValidImage(mimeType: string): void {
    if (!IMAGE_MIME_REGEX.test(mimeType)) {
      throw new InvalidBase64ImageError(`MIME type "${mimeType}" must match image/* with a valid subtype token.`)
    }
  }

  private static ensureHasBase64Flag(hasBase64Flag: boolean): void {
    if (!hasBase64Flag) {
      throw new InvalidBase64ImageError("Data URL must include ';base64' for Base64Image.")
    }
  }

  private static ensureBase64Alphabet(base64Payload: string): void {
    // Only base64 alphabet plus up to two '=' at the end.
    // Note: we enforce correct remainder in padBase64IfNeeded.
    if (!/^[A-Za-z0-9+/]*={0,2}$/.test(base64Payload)) {
      throw new InvalidBase64ImageError('Base64 payload contains invalid characters.')
    }
    // Also ensure any '=' are only at the end (regex already enforces this).
  }

  private static decodeBase64(base64Payload: string): Uint8Array {
    return Uint8Array.from(Buffer.from(base64Payload, 'base64'))
  }

  private static ensureWithinSize(bytes: Uint8Array, maximumBytes: number): void {
    if (bytes.byteLength > maximumBytes) {
      throw new InvalidBase64ImageError(`Image exceeds maximum allowed size of ${maximumBytes} bytes.`)
    }
  }

  private static ensureNonEmpty(bytes: Uint8Array): void {
    if (bytes.byteLength === 0) {
      throw new InvalidBase64ImageError('Image has no content.')
    }
  }

  equals(other: unknown): boolean {
    return other instanceof Base64Image && this.value === other.value
  }

  toString(): string {
    return this.value
  }
}
