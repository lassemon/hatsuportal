import { describe, expect, it } from 'vitest'
import { InvalidBase64ImageError } from '../errors/InvalidBase64ImageError'
import { Base64Image } from './Base64Image'
import { BASE64_PREFIX } from '@hatsuportal/common'

describe('Base64Image', () => {
  it('can create a base 64 image', () => {
    const base64 = new Base64Image(BASE64_PREFIX + '123456')
    expect(base64).to.be.instanceOf(Base64Image)
    expect(base64.value).to.eq(BASE64_PREFIX + '123456')
  })

  it('does not allow creating base 64 image with just the base string and no data', () => {
    expect(() => {
      new Base64Image(BASE64_PREFIX)
    }).toThrow(InvalidBase64ImageError)
  })

  it('does not allow creating base 64 image with an empty value', () => {
    expect(() => {
      new Base64Image('')
    }).toThrow(InvalidBase64ImageError)
    expect(() => {
      new Base64Image(undefined as any)
    }).toThrow(InvalidBase64ImageError)
    expect(() => {
      new Base64Image(null as any)
    }).toThrow(InvalidBase64ImageError)
  })

  it('does not allow creating base 64 image with an invalid value', () => {
    const invalidBase64ImageStrings = ['   ', 'testASDtest', 1, 0, -1] as any[]

    invalidBase64ImageStrings.forEach((base64) => {
      expect(() => {
        new Base64Image(base64)
      }).toThrow(InvalidBase64ImageError)
    })
  })
})
