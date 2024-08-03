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
})
