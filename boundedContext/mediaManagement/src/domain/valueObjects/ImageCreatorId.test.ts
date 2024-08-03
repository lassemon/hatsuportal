import { describe, expect, it } from 'vitest'
import { uuid } from '@hatsuportal/common'
import { InvalidImageCreatorIdError } from '../errors/InvalidImageCreatorIdError'
import { ImageCreatorId } from './ImageCreatorId'

describe('ImageCreatorId', () => {
  it('can create a image creator id', () => {
    const id = uuid()
    const imageCreatorId = new ImageCreatorId(id)
    expect(imageCreatorId).to.be.instanceOf(ImageCreatorId)
    expect(imageCreatorId.value).to.eq(id)
  })

  it('does not allow creating a image creator id with an empty value', () => {
    expect(() => {
      new ImageCreatorId('')
    }).toThrow(InvalidImageCreatorIdError)
    expect(() => {
      new ImageCreatorId(undefined as any)
    }).toThrow(InvalidImageCreatorIdError)
    expect(() => {
      new ImageCreatorId(null as any)
    }).toThrow(InvalidImageCreatorIdError)
  })

  it('does not allow creating a image creator id with an invalid value', () => {
    const invalidIds = [
      '    ',
      '1',
      '1234',
      '1234567',
      '1234567891',
      '1234567891234',
      '1234567891234567',
      '1234567891234567891',
      '1234567891234567891234',
      '1234567891234567891234567',
      '1234567891234567891234567891',
      '1234567891234567891234567891234',
      1,
      0,
      -1
    ] as any[]

    invalidIds.forEach((id) => {
      expect(() => {
        new ImageCreatorId(id)
      }).toThrow(InvalidImageCreatorIdError)
    })
  })
})
