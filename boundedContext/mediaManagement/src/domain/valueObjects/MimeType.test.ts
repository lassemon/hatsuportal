import { describe, expect, it } from 'vitest'
import { MimeType } from './MimeType'
import { InvalidMimeTypeError } from '../errors/InvalidMimeTypeError'

describe('MimeType', () => {
  it('can create a mime type', () => {
    const fileName = new MimeType('image/png')
    expect(fileName).to.be.instanceOf(MimeType)
    expect(fileName.value).to.eq('image/png')
  })

  it('does not allow creating a mime type with an empty value', () => {
    expect(() => {
      new MimeType('' as any)
    }).toThrow(InvalidMimeTypeError)
    expect(() => {
      new MimeType(undefined as any)
    }).toThrow(InvalidMimeTypeError)
    expect(() => {
      new MimeType(null as any)
    }).toThrow(InvalidMimeTypeError)
  })

  it('does not allow creating a mime type with an invalid value', () => {
    const invalidMimeTypes = [
      '   ',
      'application',
      'text/',
      '/html',
      'image\\jpeg',
      'audio mp3',
      'video*mp4',
      'application/json; charset=utf-8', // This will be invalid in our basic implementation
      1,
      0,
      -1
    ] as any[]

    invalidMimeTypes.forEach((mimeType) => {
      expect(() => {
        new MimeType(mimeType)
      }).toThrow(InvalidMimeTypeError)
    })
  })

  it('exposes canCreate, type/subtype accessors and file extensions', () => {
    const mimeType = new MimeType('image/jpeg')
    expect(MimeType.canCreate('image/jpeg')).toBe(true)
    expect(() => MimeType.assertCanCreate('image/jpeg')).not.toThrow()
    expect(MimeType.canCreate('bad')).toBe(false)
    expect(mimeType.type).toBe('image')
    expect(mimeType.subtype).toBe('jpeg')
    expect(mimeType.fileExtension).toBe('jpg')
    expect(new MimeType('application/unknown').fileExtension).toBe(MimeType.UNKNOWN_FILE_EXTENSION)
    expect(mimeType.equals(new MimeType('image/jpeg'))).toBe(true)
    expect(mimeType.toString()).toBe('image/jpeg')
  })

  it('normalizes image/jpg alias to image/jpeg via constructor and fromString', () => {
    expect(new MimeType('image/jpg').value).toBe('image/jpeg')
    expect(MimeType.fromString('image/jpg').value).toBe('image/jpeg')
    expect(new MimeType('image/jpg').equals(new MimeType('image/jpeg'))).toBe(true)
  })

  it('maps file extensions to canonical mime types via fromFileExtension', () => {
    expect(MimeType.fromFileExtension('jpg').value).toBe('image/jpeg')
    expect(MimeType.fromFileExtension('.jpg').value).toBe('image/jpeg')
    expect(MimeType.fromFileExtension('png').value).toBe('image/png')
    expect(() => MimeType.fromFileExtension('unknown')).toThrow(InvalidMimeTypeError)
  })
})
