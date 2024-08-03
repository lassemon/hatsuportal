import { describe, expect, it } from 'vitest'
import { ImageCreatorName } from './ImageCreatorName'
import { InvalidImageCreatorNameError } from '../errors/InvalidImageCreatorNameError'

describe('ImageCreatorName', () => {
  it('can create a image creator name', () => {
    const imageCreatorName = new ImageCreatorName('image/png')
    expect(imageCreatorName).to.be.instanceOf(ImageCreatorName)
    expect(imageCreatorName.value).to.eq('image/png')
  })

  it('does not allow creating a image creator name with an empty value', () => {
    expect(() => {
      new ImageCreatorName('' as any)
    }).toThrow(InvalidImageCreatorNameError)
    expect(() => {
      new ImageCreatorName(undefined as any)
    }).toThrow(InvalidImageCreatorNameError)
    expect(() => {
      new ImageCreatorName(null as any)
    }).toThrow(InvalidImageCreatorNameError)
  })

  it('does not allow creating a image creator name with an invalid value', () => {
    const invalidImageCreatorNames = ['   ', 1, 0, -1] as any[]

    invalidImageCreatorNames.forEach((imageCreatorName) => {
      expect(() => {
        new ImageCreatorName(imageCreatorName)
      }).toThrow(InvalidImageCreatorNameError)
    })
  })
})
