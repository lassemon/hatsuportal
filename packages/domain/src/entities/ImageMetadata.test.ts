import { describe, expect, it } from 'vitest'
import ImageMetadata from './ImageMetadata'
import { uuid, VisibilityEnum } from '@hatsuportal/common'
import { InvalidPostIdError } from '../errors/InvalidPostIdError'
import _ from 'lodash'

describe('ImageMetadata', () => {
  it('can create image metadata with all properties', ({ unitFixture }) => {
    const metadata = new ImageMetadata(unitFixture.imageMetadataDTO())
    expect(metadata.fileName.value).toBe(unitFixture.imageMetadataDTO().fileName)

    expect(metadata.storageFileName.value).toBe(
      `${unitFixture.imageMetadataDTO().ownerType}_${unitFixture.imageMetadataDTO().createdBy}_${unitFixture.imageMetadataDTO().fileName}`
    )
    expect(metadata.mimeType.value).toBe(unitFixture.imageMetadataDTO().mimeType)
    expect(metadata.size.value).toBe(unitFixture.imageMetadataDTO().size)
    expect(metadata.ownerId?.value).toStrictEqual(unitFixture.imageMetadataDTO().ownerId)
    expect(metadata.ownerType?.value).toBe(unitFixture.imageMetadataDTO().ownerType)
  })

  it('sets file extension based on mime type, not filename string', ({ unitFixture }) => {
    const metadata = new ImageMetadata({
      ...unitFixture.imageMetadataDTO(),
      fileName: 'test.gif',
      mimeType: 'video/x-msvideo'
    })
    expect(metadata.fileName.value).toBe('test.gif.avi')
    expect(metadata.storageFileName.value).toBe(`${metadata.ownerType.value}_${metadata.createdBy.value}_test.gif.avi`)
  })

  it('does not allow creating image metadata without an id', ({ unitFixture }) => {
    const { id, ...postWithoutId } = unitFixture.imageMetadataDTO()
    expect(() => {
      new ImageMetadata(postWithoutId as any)
    }).toThrow(InvalidPostIdError)
  })

  it('does not allow creating image metadata with an id with empty spaces', ({ unitFixture }) => {
    expect(() => {
      new ImageMetadata({ ...unitFixture.imageMetadataDTO(), id: ' te st ' } as any)
    }).toThrow(InvalidPostIdError)
  })

  it('can compare image metadatas', ({ unitFixture }) => {
    const post = new ImageMetadata(unitFixture.imageMetadataDTO())
    const post2 = new ImageMetadata({
      ...unitFixture.imageMetadataDTO(),
      id: uuid(),
      visibility: VisibilityEnum.Private
    })
    expect(post.equals(post)).toBe(true)
    expect(post.equals(post2)).toBe(false)
  })
})
