import { describe, expect, it } from 'vitest'
import { ImagePresentationMapper } from './ImagePresentationMapper'
import { ImagePresentation } from '../entities/ImagePresentation'

describe('ImagePresentationMapper', () => {
  const imageMapper = new ImagePresentationMapper()

  it('converts create request to create input dto', ({ unitFixture }) => {
    const createRequest = unitFixture.createImageRequest()
    const dto = imageMapper.toCreateImageInputDTO(createRequest, unitFixture.loggedInUserId())

    expect(dto.loggedInUserId).toBe(unitFixture.loggedInUserId())

    // common post properties
    expect((dto.createImageData as any).id).toBeUndefined() // should not be given from request
    expect(dto.createImageData.visibility).toBe(createRequest.visibility)
    expect((dto.createImageData as any).createdBy).toBeUndefined() // should not be given from request
    expect((dto.createImageData as any).createdByUserName).toBeUndefined() // should not be given from request
    expect((dto.createImageData as any).createdAt).toBeUndefined() // should not be given from request
    expect((dto.createImageData as any).updatedAt).toBeUndefined() // should not be given from request

    // metadata properties
    expect(dto.createImageData.fileName).toBe(createRequest.fileName)
    expect(dto.createImageData.mimeType).toBe(createRequest.mimeType)
    expect(dto.createImageData.size).toBe(createRequest.size)
    expect(dto.createImageData.ownerId).toStrictEqual(createRequest.ownerId)
    expect(dto.createImageData.ownerType).toBe(createRequest.ownerType)
  })

  it('converts update request to update input dto', ({ unitFixture }) => {
    const updateRequest = unitFixture.updateImageRequest()
    const dto = imageMapper.toUpdateImageInputDTO(updateRequest, unitFixture.loggedInUserId())

    expect(dto.loggedInUserId).toBe(unitFixture.loggedInUserId())

    // common post properties
    expect(dto.updateImageData.id).toBe(updateRequest.id) // should not be able to update from request
    expect(dto.updateImageData.visibility).toBe(updateRequest.visibility)
    expect((dto.updateImageData as any).createdBy).toBeUndefined() // should not be able to update from request
    expect((dto.updateImageData as any).createdByUserName).toBeUndefined() // should not be able to update from request
    expect((dto.updateImageData as any).createdAt).toBeUndefined() // should not be able to update from request
    expect((dto.updateImageData as any).updatedAt).toBeUndefined() // should not be able to update from request

    // metadata properties
    expect(dto.updateImageData.fileName).toBe(updateRequest.fileName)
    expect(dto.updateImageData.mimeType).not.toBeUndefined() // mimetype should not become undefined when it is missing from update payload
    expect(dto.updateImageData.mimeType).toBe(updateRequest.mimeType)
    expect(dto.updateImageData.size).toBe(updateRequest.size)
    expect(dto.updateImageData.ownerId).toStrictEqual(updateRequest.ownerId)
    expect(dto.updateImageData.ownerType).toBe(updateRequest.ownerType)
    expect(dto.updateImageData.base64).toBe(updateRequest.base64)
  })

  it('converts remove request to remove input dto', ({ unitFixture }) => {
    const dto = imageMapper.toRemoveImageFromStoryInputDTO('storyId', unitFixture.loggedInUserId())
    expect(dto.storyIdFromWhichToRemoveImage).toBe('storyId')
    expect(dto.loggedInUserId).toBe(unitFixture.loggedInUserId())
  })

  it('converts image dto to response', ({ unitFixture }) => {
    // this is more of a dummy test because currently no specific mapping is done from ImageDTO -> ImageResponse
    expect(imageMapper.toResponse(unitFixture.imageDTO())).toStrictEqual(unitFixture.imageDTO())
  })

  it('converts image response to ImagePresentation entity', ({ unitFixture }) => {
    expect(imageMapper.toImagePresentation(unitFixture.imageDTO())).toBeInstanceOf(ImagePresentation)
  })
})
