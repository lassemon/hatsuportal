import { describe, expect, it } from 'vitest'
import { InvalidBase64ImageError } from '../errors/InvalidBase64ImageError'
import { Base64Image } from './Base64Image'

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
})
