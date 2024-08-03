import { describe, expect, it } from 'vitest'
import Image from './Image'
import _ from 'lodash'
import { uuid } from '@hatsuportal/common'
import { InvalidImageIdError } from '../errors/InvalidImageIdError'

describe('Image', () => {
  it('can create image with all properties', ({ unitFixture }) => {
    const image = unitFixture.imageMock()
    expect(image.fileName.value).toBe(unitFixture.imageDTOMock().fileName)

    expect(image.storageFileName.value).toBe(
      `${unitFixture.imageDTOMock().ownerEntityType}_${unitFixture.imageDTOMock().ownerEntityId}_${
        unitFixture.imageDTOMock().createdById
      }_${unitFixture.imageDTOMock().fileName}`
    )
    expect(image.mimeType.value).toBe(unitFixture.imageDTOMock().mimeType)
    expect(image.size.value).toBe(unitFixture.imageDTOMock().size)
    expect(image.base64.value).toBe(unitFixture.imageDTOMock().base64)
  })

  it('sets file extension based on mime type, not filename string', ({ unitFixture }) => {
    const metadata = Image.create({
      ...unitFixture.imageDTOMock(),
      fileName: 'test.gif',
      mimeType: 'video/x-msvideo'
    })
    expect(metadata.fileName.value).toBe('test.gif.avi')
    expect(metadata.storageFileName.value).toBe(
      `${metadata.ownerEntityType.value}_${metadata.ownerEntityId.value}_${metadata.createdById.value}_test.gif.avi`
    )
  })

  it('does not allow creating image metadata without an id', ({ unitFixture }) => {
    const { id, ...imageWithoutId } = unitFixture.imageDTOMock()
    expect(() => {
      Image.create(imageWithoutId as any)
    }).toThrow(InvalidImageIdError)
  })

  it('does not allow creating image metadata with an id with empty spaces', ({ unitFixture }) => {
    expect(() => {
      Image.create({ ...unitFixture.imageDTOMock(), id: ' te st ' } as any)
    }).toThrow(InvalidImageIdError)
  })

  it('can compare image metadatas', ({ unitFixture }) => {
    const image = unitFixture.imageMock()
    const otherImage = Image.create({
      ...unitFixture.imageDTOMock(),
      id: uuid()
    })
    expect(image.equals(image)).toBe(true)
    expect(image.equals(otherImage)).toBe(false)
  })

  it('creates image with proper base64 encoding prefix', ({ unitFixture }) => {
    const image = Image.create({ ...unitFixture.imageDTOMock(), base64: 'data:image/png;base64,testbinarystring' })
    expect(image.base64.value).toBe('data:image/png;base64,testbinarystring')
  })
})
