import { describe, expect, it } from 'vitest'
import { InvalidBase64ImageError } from '../errors/InvalidBase64ImageError'
import { Base64Image } from './Base64Image'
import { MimeType } from './MimeType'

describe('Base64Image', () => {
  it('can create a base 64 image', () => {
    const base64 = Base64Image.create('data:image/png;base64,123456')
    expect(base64).to.be.instanceOf(Base64Image)
    expect(base64.value).to.eq('data:image/png;base64,123456==')

    const a = Base64Image.create('data:image/png;base64,123456')
    const b = Base64Image.create('data:image/png;base64,123456==')
    expect([...a.bytes]).to.deep.eq([...b.bytes])
  })

  it('does not allow creating base 64 image with just the base string and no data', () => {
    expect(() => {
      Base64Image.create('data:image/png;base64,')
    }).toThrow(InvalidBase64ImageError)
  })

  it('does not allow creating base 64 image with an empty value', () => {
    expect(() => {
      Base64Image.create('')
    }).toThrow(InvalidBase64ImageError)
    expect(() => {
      Base64Image.create(undefined as any)
    }).toThrow(InvalidBase64ImageError)
    expect(() => {
      Base64Image.create(null as any)
    }).toThrow(InvalidBase64ImageError)
  })

  it('does not allow creating base 64 image with an invalid value', () => {
    const invalidBase64ImageStrings = ['   ', 'testASDtest', 1, 0, -1] as any[]

    invalidBase64ImageStrings.forEach((base64) => {
      expect(() => {
        Base64Image.create(base64)
      }).toThrow(InvalidBase64ImageError)
    })
  })

  it('exposes canCreate and assertCanCreate helpers', () => {
    const value = 'data:image/png;base64,AAA'
    expect(Base64Image.canCreate(value)).toBe(true)
    expect(() => Base64Image.assertCanCreate(value)).not.toThrow()
    expect(Base64Image.canCreate('invalid')).toBe(false)

    const image = Base64Image.create(value)
    expect(image.equals(Base64Image.create(value))).toBe(true)
    expect(image.toString()).toContain('data:image/png;base64')
    expect(() => Base64Image.create('data:image/svg+xml;base64,PHN2Zy8+')).toThrow(InvalidBase64ImageError)
  })

  it('creates an external storage reference without inline content', () => {
    const reference = Base64Image.forExternalStorage(new MimeType('image/webp'))

    expect(reference.isExternalStorageReference()).toBe(true)
    expect(reference.mimeType).toBe('image/webp')
    expect(() => reference.bytes).toThrow(InvalidBase64ImageError)
    expect(() => reference.assertHasInlineContent()).toThrow(InvalidBase64ImageError)
  })

  it('normalizes image/jpg data URL headers to image/jpeg', () => {
    const base64 = Base64Image.create('data:image/jpg;base64,AAA')

    expect(base64.mimeType).toBe('image/jpeg')
    expect(base64.value).toContain('data:image/jpeg;base64')
  })
})
