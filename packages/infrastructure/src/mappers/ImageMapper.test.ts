import { describe, expect, it } from 'vitest'
import { ImageMapper } from './ImageMapper'
import { Image, ImageMetadata, User } from '@hatsuportal/domain'

describe('ImageMapper', () => {
  const imageMapper = new ImageMapper()
  it('converts create request to image metadata', ({ unitFixture }) => {
    const user = new User(unitFixture.user())
    const createRequest = unitFixture.createImageRequest()
    const imageMetadata = imageMapper.createRequestToImageMetadata(createRequest, user)
    expect(imageMetadata).toBeInstanceOf(ImageMetadata)

    // common entity properties
    expect(imageMetadata.id).toBeTypeOf('string')
    expect(imageMetadata.id).not.toBe((createRequest as any).id) // should not be given from request
    expect(imageMetadata.visibility).toBe(createRequest.visibility)
    expect(imageMetadata.createdBy).toBe(user.id)
    expect(imageMetadata.createdBy).not.toBe((createRequest as any).createdBy) // should not be given from request
    expect(imageMetadata.createdByUserName).toBe(user.name)
    expect(imageMetadata.createdByUserName).not.toBe((createRequest as any).createdByUserName) // should not be given from request
    expect(imageMetadata.createdAt).not.toBe((createRequest as any).createdAt) // should not be given from request
    expect(imageMetadata.createdAt).toBeTypeOf('number')
    expect(imageMetadata.updatedAt).toBeNull()

    // metadata properties
    expect(imageMetadata.fileName).toBe(createRequest.fileName)
    expect(imageMetadata.mimeType).toBe(createRequest.mimeType)
    expect(imageMetadata.size).toBe(createRequest.size)
    expect(imageMetadata.ownerId).toStrictEqual(createRequest.ownerId)
    expect(imageMetadata.ownerType).toBe(createRequest.ownerType)
  })

  it('converts update request to image metadata', ({ unitFixture }) => {
    const existingImageMetadata = unitFixture.imageMetadata()
    const updateRequest = unitFixture.updateImageRequest()
    const imageMetadata = imageMapper.updateRequestToImageMetadata(existingImageMetadata, updateRequest)
    expect(imageMetadata).toBeInstanceOf(ImageMetadata)

    // common entity properties
    expect(imageMetadata.id).toBe(existingImageMetadata.id) // should not be able to update from request
    expect(imageMetadata.visibility).toBe(updateRequest.visibility)
    expect(imageMetadata.createdBy).toBe(existingImageMetadata.createdBy)
    expect(imageMetadata.createdBy).not.toBe((updateRequest as any).createdBy) // should not be able to update from request
    expect(imageMetadata.createdByUserName).toBe(existingImageMetadata.createdByUserName)
    expect(imageMetadata.createdByUserName).not.toBe((updateRequest as any).createdByUserName) // should not be able to update from request
    expect(imageMetadata.createdAt).toBe(existingImageMetadata.createdAt)
    expect(imageMetadata.createdAt).not.toBe((updateRequest as any).createdAt) // should not be able to update from request
    expect(imageMetadata.updatedAt).toBe(existingImageMetadata.updatedAt)
    expect(imageMetadata.updatedAt).not.toBe((updateRequest as any).updatedAt) // should not be able to update from request

    // metadata properties
    expect(imageMetadata.fileName).toBe(existingImageMetadata.fileName)
    expect(imageMetadata.mimeType).not.toBeUndefined() // mimetype should not become undefined when it is missing from update payload
    expect(imageMetadata.mimeType).toBe(existingImageMetadata.mimeType)
    expect(imageMetadata.size).toBe(updateRequest.size)
    expect(imageMetadata.ownerId).toStrictEqual(existingImageMetadata.ownerId)
    expect(imageMetadata.ownerType).toBe(existingImageMetadata.ownerType)

    //update request contains base64 encoded image but it should not end up in the image metadata
    expect((imageMetadata as any).base64).toBeUndefined()
  })

  it('converts image metadata to insert query', ({ unitFixture }) => {
    const metadata = unitFixture.imageMetadata()
    const insertQuery = imageMapper.toInsertQuery(metadata)
    // common entity properties
    expect(insertQuery.id).toBe(metadata.id)
    expect(insertQuery.visibility).toBe(metadata.visibility)
    expect(insertQuery.createdBy).toBe(metadata.createdBy)
    expect(insertQuery.createdByUserName).toBe(metadata.createdByUserName)
    expect(insertQuery.createdAt).toBe(metadata.createdAt)
    expect(insertQuery.updatedAt).not.toBe(metadata.updatedAt)
    expect(insertQuery.updatedAt).toBeNull()

    // metadata properties
    expect(insertQuery.fileName).toBe(metadata.fileName)
    expect(insertQuery.mimeType).toBe(metadata.mimeType)
    expect(insertQuery.size).toBe(metadata.size)
    expect(insertQuery.ownerId).toBe(metadata.ownerId)
    expect(insertQuery.ownerType).toBe(metadata.ownerType)
  })

  it('converts image metadata to update query', ({ unitFixture }) => {
    const metadata = unitFixture.imageMetadata()
    const updateQuery = imageMapper.toUpdateQuery(metadata)
    // common entity properties
    expect(updateQuery.id).toBe(metadata.id)
    expect(updateQuery.visibility).toBe(metadata.visibility)
    expect((updateQuery as any).createdBy).toBeUndefined() // should not be able to update
    expect((updateQuery as any).createdByUserName).toBeUndefined() // should not be able to update
    expect((updateQuery as any).createdAt).toBeUndefined() // should not be able to update
    expect(updateQuery.updatedAt).not.toBe(metadata.updatedAt) // mapper should set new updated at timestamp

    // metadata properties
    expect(updateQuery.fileName).toBe(metadata.fileName)
    expect(updateQuery.mimeType).toBe(metadata.mimeType)
    expect(updateQuery.size).toBe(metadata.size)
    expect(updateQuery.ownerId).toBe(metadata.ownerId)
    expect(updateQuery.ownerType).toBe(metadata.ownerType)
  })

  it('converts image metadata JSON into image metadata class instance', ({ unitFixture }) => {
    expect(imageMapper.toImageMetadata(unitFixture.imageMetadata())).toBeInstanceOf(ImageMetadata)
  })

  it('converts image metadata and base64 image data into image class instance', ({ unitFixture }) => {
    const image = imageMapper.metadataToImage(unitFixture.imageMetadata(), 'asfasdf')
    expect(image).toBeInstanceOf(Image)
    expect(image.base64).toBe('data:image/png;base64,asfasdf')
    expect(image.serialize()).toStrictEqual({ ...unitFixture.imageMetadata(), base64: 'data:image/png;base64,asfasdf' })
  })

  it('converts image JSON to image response', ({ unitFixture }) => {
    // this is more of a dummy test because currently no specific mapping is done from ImageDTO -> ImageResponseDTO
    expect(imageMapper.toResponse(unitFixture.image())).toStrictEqual(unitFixture.image())
  })
})
