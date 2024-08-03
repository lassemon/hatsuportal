import { describe, expect, it } from 'vitest'
import Image from './Image'
import _ from 'lodash'
import { uuid, VisibilityEnum } from '@hatsuportal/common'
import { InvalidPostIdError } from '../errors/InvalidPostIdError'

describe('Image', () => {
  it('can create image with all properties', ({ unitFixture }) => {
    const image = unitFixture.imageMock()
    expect(image.fileName.value).toBe(unitFixture.imageDTOMock().fileName)

    expect(image.storageFileName.value).toBe(
      `${unitFixture.imageDTOMock().ownerType}_${unitFixture.imageDTOMock().createdBy}_${unitFixture.imageDTOMock().fileName}`
    )
    expect(image.mimeType.value).toBe(unitFixture.imageDTOMock().mimeType)
    expect(image.size.value).toBe(unitFixture.imageDTOMock().size)
    expect(image.ownerId?.value).toStrictEqual(unitFixture.imageDTOMock().ownerId)
    expect(image.ownerType?.value).toBe(unitFixture.imageDTOMock().ownerType)
    expect(image.base64.value).toBe(unitFixture.imageDTOMock().base64)
  })

  it('sets file extension based on mime type, not filename string', ({ unitFixture }) => {
    const metadata = new Image({
      ...unitFixture.imageDTOMock(),
      fileName: 'test.gif',
      mimeType: 'video/x-msvideo'
    })
    expect(metadata.fileName.value).toBe('test.gif.avi')
    expect(metadata.storageFileName.value).toBe(`${metadata.ownerType.value}_${metadata.createdBy.value}_test.gif.avi`)
  })

  it('does not allow creating image metadata without an id', ({ unitFixture }) => {
    const { id, ...postWithoutId } = unitFixture.imageDTOMock()
    expect(() => {
      new Image(postWithoutId as any)
    }).toThrow(InvalidPostIdError)
  })

  it('does not allow creating image metadata with an id with empty spaces', ({ unitFixture }) => {
    expect(() => {
      new Image({ ...unitFixture.imageDTOMock(), id: ' te st ' } as any)
    }).toThrow(InvalidPostIdError)
  })

  it('can compare image metadatas', ({ unitFixture }) => {
    const image = unitFixture.imageMock()
    const otherImage = new Image({
      ...unitFixture.imageDTOMock(),
      id: uuid(),
      visibility: VisibilityEnum.Private
    })
    expect(image.equals(image)).toBe(true)
    expect(image.equals(otherImage)).toBe(false)
  })

  it('creates image with proper base64 encoding prefix', ({ unitFixture }) => {
    const image = new Image({ ...unitFixture.imageDTOMock(), base64: 'testbinarystring' })
    expect(image.base64.value).toBe('data:image/png;base64,testbinarystring')
  })

  it('sets image base64 with proper encoding prefix', ({ unitFixture }) => {
    const image = new Image({ ...unitFixture.imageDTOMock() })
    image.base64 = 'testbinarystring'
    expect(image.base64.value).toBe('data:image/png;base64,testbinarystring')
  })
})
