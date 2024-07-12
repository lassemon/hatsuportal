import { describe, expect, it } from 'vitest'
import Image from './Image'

describe('Image', () => {
  it('can create image with all properties', ({ unitFixture }) => {
    const image = new Image(unitFixture.image())
    expect(image.base64).toBe(unitFixture.serializedImage().base64)
  })

  it('creates image with proper base64 encoding prefix', ({ unitFixture }) => {
    const image = new Image({ ...unitFixture.image(), base64: 'testbinarystring' })
    expect(image.base64).toBe('data:image/png;base64,testbinarystring')
  })

  it('sets image base64 with proper encoding prefix', ({ unitFixture }) => {
    const image = new Image({ ...unitFixture.image() })
    image.base64 = 'testbinarystring'
    expect(image.base64).toBe('data:image/png;base64,testbinarystring')
  })

  it('does not allow creating image with extra props', ({ unitFixture }) => {
    expect(() => {
      new Image({ ...unitFixture.image(), extraProp: 'foobar' } as any)
    }).toThrow('Props contain extra keys: extraProp.')
  })
})
